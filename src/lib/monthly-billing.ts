// Lập phiếu thu học phí theo tháng (chỉ chạy trên server).
// Một phiếu cho mỗi bé mỗi tháng, gồm: học phí các lớp đang học (số buổi thực tế × đơn giá), buổi giáo viên
// nước ngoài (đơn giá + phụ thu), giảm trừ buổi nghỉ không kèm bù được, và học liệu do kế toán thêm tay.
// Phiếu cũng in đối chiếu tháng trước và anh chị em cùng SĐT phụ huynh.
import { prisma } from "@/lib/prisma"
import {
  DAY_MS,
  formatVietnam,
  toVietnamWallClock,
  parseVietnamDateKey,
  vietnamDateKey,
  vietnamDayRange,
  vietnamMonthBounds,
  vietnamMonthStart,
} from "@/lib/curriculum"
import { buildQrPayload, generateReceiptCode } from "@/lib/payment-receipt"
import { getSiteSettings } from "@/lib/get-site-settings"
import {
  billTotal,
  billingMonthKey,
  formatBillingMonth,
  lineTotal,
  normalizePhone,
  parseBillingSummary,
  shiftBillingMonth,
  noticeLineKind,
  plannedDatesText,
  type BillingLineDraft,
  type BillingSummary,
  type FamilyNotice,
  type FamilyNoticeChild,
  type PlannedClassMonth,
  type PreviousClassMonth,
  type SessionMark,
  type SessionMarkCode,
  type SiblingBill,
} from "@/lib/monthly-billing-shared"

const ATTENDED = new Set(["PRESENT", "LATE", "MAKE_UP"])
const ABSENT = new Set(["ABSENT_WITH_PERMISSION", "ABSENT_WITHOUT_PERMISSION"])

export type MonthlyBillDraft = {
  month: string
  student: { id: string; fullName: string; code: string | null }
  summary: BillingSummary
  lines: BillingLineDraft[]
  existingPayment: { id: string; receiptCode: string | null; status: string } | null
  warnings: string[]
}

function monthRange(month: string) {
  const bounds = vietnamMonthBounds(month)
  if (!bounds) throw new Error("Tháng thu không hợp lệ")
  return { start: bounds.start, end: vietnamMonthStart(bounds.start, 1) }
}

function classFee(cls: { sessionFee: number | null; course: { sessionFee: number | null } | null }) {
  return cls.sessionFee ?? cls.course?.sessionFee ?? 0
}

/** Hồ sơ phụ huynh có cùng SĐT (đã chuẩn hoá), để không tạo trùng một gia đình thành nhiều hồ sơ */
export async function findParentsByPhone(phone: string, excludeId?: string) {
  const normalized = normalizePhone(phone)
  if (normalized.length < 9) return []
  const parents = await prisma.parent.findMany({
    where: { phone: { contains: normalized.slice(-9) }, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true, fullName: true, phone: true },
  })
  return parents.filter((parent) => normalizePhone(parent.phone) === normalized)
}

/** Các bé có phụ huynh cùng SĐT (anh chị em trong nhà), không gồm chính bé */
export async function findSiblings(studentId: string, parentPhone: string | null | undefined) {
  const phone = normalizePhone(parentPhone)
  if (phone.length < 9) return []
  const parents = await prisma.parent.findMany({
    where: { phone: { contains: phone.slice(-9) } },
    select: {
      phone: true,
      students: { where: { id: { not: studentId } }, select: { id: true, fullName: true, code: true } },
    },
  })
  const seen = new Set<string>()
  return parents
    .filter((parent) => normalizePhone(parent.phone) === phone)
    .flatMap((parent) => parent.students)
    .filter((student) => !seen.has(student.id) && Boolean(seen.add(student.id)))
}

/** Anh chị em kèm phiếu thu cùng tháng (nếu đã lập) — đọc mới mỗi lần để phiếu in luôn đúng */
export async function siblingBills(studentId: string, parentPhone: string | null | undefined, month: string): Promise<SiblingBill[]> {
  const siblingStudents = await findSiblings(studentId, parentPhone)
  if (siblingStudents.length === 0) return []
  const payments = await prisma.payment.findMany({
    where: { studentId: { in: siblingStudents.map((sibling) => sibling.id) }, billingMonth: month, status: { not: "CANCELLED" } },
    select: { id: true, studentId: true, receiptCode: true, totalAmount: true, remainingAmount: true, status: true },
  })
  return siblingStudents.map((sibling) => {
    const payment = payments.find((item) => item.studentId === sibling.id)
    return {
      studentId: sibling.id,
      fullName: sibling.fullName,
      code: sibling.code,
      paymentId: payment?.id ?? null,
      receiptCode: payment?.receiptCode ?? null,
      totalAmount: payment?.totalAmount ?? 0,
      remainingAmount: payment?.remainingAmount ?? 0,
      status: payment?.status ?? null,
    }
  })
}

export async function buildMonthlyBillDraft(studentId: string, month: string): Promise<MonthlyBillDraft> {
  const { start, end } = monthRange(month)
  const previousMonth = shiftBillingMonth(month, -1)
  const previousStart = monthRange(previousMonth).start
  const now = new Date()

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      fullName: true,
      code: true,
      parent: { select: { phone: true } },
      classStudents: {
        where: { status: "ACTIVE", class: { status: { in: ["ACTIVE", "UPCOMING"] } } },
        select: {
          joinedAt: true,
          class: {
            select: {
              id: true,
              name: true,
              isOneOnOne: true,
              sessionFee: true,
              startDate: true,
              expectedEndDate: true,
              course: { select: { sessionFee: true } },
              schedules: { select: { dayOfWeek: true } },
            },
          },
        },
      },
    },
  })
  if (!student) throw new Error("Không tìm thấy học viên")

  // Ngày vào lớp (giờ VN): bé vào giữa tháng chỉ tính các buổi từ ngày đó
  const classes = student.classStudents.map((item) => ({ ...item.class, joinedKey: vietnamDateKey(item.joinedAt) }))
  const classIds = classes.map((cls) => cls.id)
  const warnings: string[] = []

  const [sessions, monthlyPayments, missedMakeUps, legacyPayments] = await Promise.all([
    classIds.length
      ? prisma.classSession.findMany({
          where: { classId: { in: classIds }, sessionDate: { gte: previousStart, lt: end } },
          select: {
            id: true,
            classId: true,
            sessionDate: true,
            status: true,
            isForeignTeacher: true,
            surcharge: true,
            attendances: { where: { studentId }, select: { status: true } },
            makeUpLessons: { where: { studentId }, select: { status: true, scheduledDate: true } },
          },
          orderBy: { sessionDate: "asc" },
        })
      : Promise.resolve([]),
    prisma.payment.findMany({
      where: { studentId, billingMonth: { not: null }, status: { not: "CANCELLED" } },
      select: { id: true, receiptCode: true, status: true, billingMonth: true, billingSummary: true },
    }),
    prisma.makeUpLesson.findMany({
      where: { studentId, status: "MISSED", creditedPaymentId: null },
      select: {
        id: true,
        sessionId: true,
        session: {
          select: {
            sessionDate: true,
            isForeignTeacher: true,
            surcharge: true,
            class: { select: { id: true, name: true, sessionFee: true, course: { select: { sessionFee: true } } } },
          },
        },
      },
    }),
    // Phiếu kiểu cũ (thu theo khoá, không theo tháng) gần đây: tháng trước có thể đã thu theo phiếu đó
    prisma.payment.count({
      where: {
        studentId,
        billingMonth: null,
        status: { notIn: ["CANCELLED", "REFUNDED"] },
        createdAt: { gte: new Date(previousStart.getTime() - 180 * DAY_MS) },
      },
    }),
  ])

  const paymentByMonth = new Map(monthlyPayments.map((payment) => [payment.billingMonth as string, payment]))

  // --- Tạm thu tháng này ---
  const planned: PlannedClassMonth[] = classes.map((cls) => {
    const fee = classFee(cls)
    if (fee <= 0) warnings.push(`Lớp ${cls.name} chưa có đơn giá/buổi (sửa ở lớp hoặc khoá học)`)

    const monthSessions = sessions.filter(
      (session) =>
        session.classId === cls.id &&
        session.status !== "CANCELLED" &&
        session.sessionDate >= start &&
        session.sessionDate < end &&
        vietnamDateKey(session.sessionDate) >= cls.joinedKey
    )
    // Buổi GV nước ngoài là buổi thêm, luôn lấy theo buổi đã xếp
    const foreign = monthSessions.filter((session) => session.isForeignTeacher)
    let regularDates = monthSessions.filter((session) => !session.isForeignTeacher).map((session) => session.sessionDate)
    let estimated = false
    // Chỉ ước tính khi lớp chưa sinh buổi thường nào trong tháng (kể cả buổi trước ngày bé vào lớp)
    const hasGeneratedRegular = sessions.some(
      (session) =>
        session.classId === cls.id &&
        !session.isForeignTeacher &&
        session.status !== "CANCELLED" &&
        session.sessionDate >= start &&
        session.sessionDate < end
    )

    if (!hasGeneratedRegular) {
      // Chưa sinh buổi học thường của tháng: ước tính theo lịch tuần, trong khoảng ngày bắt đầu – kết thúc của lớp
      estimated = true
      const weekdays = new Set(cls.schedules.map((schedule) => schedule.dayOfWeek))
      const days = Math.round((end.getTime() - start.getTime()) / DAY_MS)
      regularDates = Array.from({ length: days }, (_, index) => vietnamDayRange(start, index).start).filter((day) => {
        if (!weekdays.has(toVietnamWallClock(day).getDay())) return false
        if (cls.startDate && vietnamDateKey(day) < vietnamDateKey(cls.startDate)) return false
        if (vietnamDateKey(day) < cls.joinedKey) return false
        if (cls.expectedEndDate && vietnamDateKey(day) > vietnamDateKey(cls.expectedEndDate)) return false
        return true
      })
      if (weekdays.size === 0) warnings.push(`Lớp ${cls.name} chưa có lịch học trong tuần nên chưa tính được số buổi`)
    }

    const foreignSurcharge = foreign.reduce((sum, session) => sum + session.surcharge, 0)
    return {
      classId: cls.id,
      className: cls.name,
      isOneOnOne: cls.isOneOnOne,
      sessionFee: fee,
      regularSessions: regularDates.length,
      foreignSessions: foreign.length,
      foreignSurcharge,
      estimated,
      dates: [...regularDates, ...foreign.map((session) => session.sessionDate)]
        .sort((a, b) => a.getTime() - b.getTime())
        .map((date) => formatVietnam(date, "dd/MM")),
      foreignDates: foreign.map((session) => formatVietnam(session.sessionDate, "dd/MM")),
      amount: regularDates.length * fee + foreign.length * fee + foreignSurcharge,
    }
  })

  // --- Đối chiếu tháng trước: đã thu bao nhiêu buổi, bé học bao nhiêu, phần chênh cộng dồn sang phiếu này ---
  const previousPayment = paymentByMonth.get(previousMonth)
  const previousPlanned = parseBillingSummary(previousPayment?.billingSummary)?.planned ?? null
  const previousLabel = formatBillingMonth(previousMonth)
  const label = formatBillingMonth(month)
  const lines: BillingLineDraft[] = []
  // Tiền và số buổi cộng dồn theo lớp, ghi vào bảng đối chiếu sau khi lập xong các dòng
  const carry = new Map<string, { credit: number; creditAmount: number; extra: number; extraAmount: number }>()
  const addCarry = (classId: string, line: BillingLineDraft) => {
    const current = carry.get(classId) ?? { credit: 0, creditAmount: 0, extra: 0, extraAmount: 0 }
    if (line.unitAmount < 0) {
      current.credit += line.quantity
      current.creditAmount += lineTotal(line)
    } else {
      current.extra += line.quantity
      current.extraAmount += lineTotal(line)
    }
    carry.set(classId, current)
  }
  const adjustments: { classId: string; line: BillingLineDraft }[] = []
  // Buổi kèm bù không bù được đã xử lý trong dòng thu bù tháng trước
  const usedMakeUps = new Set<string>()

  const previous: PreviousClassMonth[] = classes.map((cls) => {
    const monthSessions = sessions.filter(
      (session) =>
        session.classId === cls.id &&
        session.sessionDate >= previousStart &&
        session.sessionDate < start &&
        vietnamDateKey(session.sessionDate) >= cls.joinedKey
    )
    const scheduled = monthSessions.filter((session) => session.status !== "CANCELLED")
    const held = scheduled.filter((session) => session.sessionDate <= now)
    const billed = previousPlanned?.find((item) => item.classId === cls.id)
    // Buổi thực tính phí: buổi lớp xếp, trừ buổi bé nghỉ mà không kèm bù được
    const missedIn = (list: typeof scheduled) => list.filter((session) => session.makeUpLessons[0]?.status === "MISSED")
    const chargeable = scheduled.length - missedIn(scheduled).length
    let catchUp = false
    const absentSessions = held.filter((session) => ABSENT.has(session.attendances[0]?.status ?? ""))
    const makeUpStatus = (status: string) => absentSessions.filter((session) => session.makeUpLessons[0]?.status === status).length
    const attended = held.filter((session) => ATTENDED.has(session.attendances[0]?.status ?? "")).length
    const madeUp = makeUpStatus("DONE")

    // Phiếu tháng trước thu theo lịch dự kiến: buổi lớp huỷ được trừ lại, buổi phát sinh thêm thì thu bù
    if (billed && sessions.some((session) => session.classId === cls.id && session.sessionDate >= previousStart && session.sessionDate < start)) {
      const regularDiff = billed.regularSessions - scheduled.filter((session) => !session.isForeignTeacher).length
      const foreignScheduled = scheduled.filter((session) => session.isForeignTeacher)
      const foreignDiff = billed.foreignSessions - foreignScheduled.length
      const cancelledDates = monthSessions
        .filter((session) => session.status === "CANCELLED")
        .map((session) => formatVietnam(session.sessionDate, "dd/MM"))
      const cancelledNote = cancelledDates.length ? ` (lớp nghỉ ${cancelledDates.join(", ")})` : ""
      if (regularDiff !== 0) {
        adjustments.push({
          classId: cls.id,
          line: {
            description:
              regularDiff > 0
                ? `Trừ buổi đã thu tháng ${previousLabel} nhưng lớp không học – ${cls.name}${cancelledNote}`
                : `Thu thêm buổi phát sinh tháng ${previousLabel} – ${cls.name}`,
            category: "CARRY",
            quantity: Math.abs(regularDiff),
            unitAmount: regularDiff > 0 ? -billed.sessionFee : billed.sessionFee,
          },
        })
      }
      if (foreignDiff !== 0) {
        const billedUnit = billed.sessionFee + (billed.foreignSessions ? Math.round(billed.foreignSurcharge / billed.foreignSessions) : 0)
        const extraUnit =
          billed.sessionFee +
          (foreignScheduled.length ? Math.round(foreignScheduled.reduce((sum, session) => sum + session.surcharge, 0) / foreignScheduled.length) : 0)
        adjustments.push({
          classId: cls.id,
          line: {
            description:
              foreignDiff > 0
                ? `Trừ buổi GV nước ngoài đã thu tháng ${previousLabel} nhưng không học – ${cls.name}`
                : `Thu thêm buổi GV nước ngoài tháng ${previousLabel} (xếp sau khi lập phiếu) – ${cls.name}`,
            category: "CARRY",
            quantity: Math.abs(foreignDiff),
            unitAmount: foreignDiff > 0 ? -billedUnit : extraUnit,
          },
        })
      }
    } else if (!billed && chargeable > 0) {
      // Tháng trước chưa lập phiếu tháng cho lớp này: thu bù các buổi thực tính phí (đã tạm thu 0 buổi)
      if (legacyPayments > 0) {
        warnings.push(
          `Tháng ${previousLabel} chưa có phiếu thu tháng cho lớp ${cls.name} nhưng bé có phiếu thu kiểu cũ gần đây: không tự thu bù ${chargeable} buổi tháng trước, thêm tay nếu cần`
        )
      } else {
        catchUp = true
        const fee = classFee(cls)
        const regular = scheduled.filter((session) => !session.isForeignTeacher)
        const foreign = scheduled.filter((session) => session.isForeignTeacher)
        const regularCount = regular.length - missedIn(regular).length
        const foreignCount = foreign.length - missedIn(foreign).length
        // Buổi nghỉ không bù được đã không tính ở đây: đánh dấu đã trừ để phiếu sau không trừ lần nữa
        const sessionIds = new Set(scheduled.map((session) => session.id))
        const missedIds = missedMakeUps.filter((makeUp) => sessionIds.has(makeUp.sessionId)).map((makeUp) => makeUp.id)
        missedIds.forEach((id) => usedMakeUps.add(id))
        if (regularCount > 0) {
          adjustments.push({
            classId: cls.id,
            line: {
              description: `Thu buổi đã học tháng ${previousLabel} (chưa tạm thu) – ${cls.name}`,
              category: "CARRY",
              quantity: regularCount,
              unitAmount: fee,
              makeUpIds: missedIds,
            },
          })
        }
        if (foreignCount > 0) {
          const surcharge = Math.round(foreign.reduce((sum, session) => sum + session.surcharge, 0) / foreign.length)
          adjustments.push({
            classId: cls.id,
            line: {
              description: `Thu buổi GV nước ngoài tháng ${previousLabel} (chưa tạm thu) – ${cls.name}`,
              category: "CARRY",
              quantity: foreignCount,
              unitAmount: fee + surcharge,
              ...(regularCount > 0 ? {} : { makeUpIds: missedIds }),
            },
          })
        }
      }
    }

    const days: SessionMark[] = monthSessions.map((session) => {
      const attendance = session.attendances[0]?.status ?? ""
      const makeUp = session.makeUpLessons[0]
      let mark: SessionMarkCode
      if (session.status === "CANCELLED") mark = "CANCELLED"
      else if (attendance === "PRESENT" || attendance === "MAKE_UP") mark = "PRESENT"
      else if (attendance === "LATE") mark = "LATE"
      else if (ABSENT.has(attendance)) {
        mark =
          makeUp?.status === "DONE"
            ? "MADE_UP"
            : makeUp?.status === "PENDING"
              ? "PENDING_MAKE_UP"
              : makeUp?.status === "MISSED"
                ? "MISSED_MAKE_UP"
                : "ABSENT"
      } else mark = session.sessionDate > now ? "UPCOMING" : "UNMARKED"
      return {
        date: formatVietnam(session.sessionDate, "dd/MM"),
        mark,
        ...(session.isForeignTeacher ? { foreign: true } : {}),
        ...(makeUp && mark !== "MISSED_MAKE_UP" && mark !== "PRESENT" ? { makeUpDate: formatVietnam(makeUp.scheduledDate, "dd/MM") } : {}),
      }
    })

    return {
      classId: cls.id,
      className: cls.name,
      billedSessions: billed ? billed.regularSessions + billed.foreignSessions : null,
      heldSessions: held.length,
      attended,
      absent: absentSessions.length,
      madeUp,
      pendingMakeUp: makeUpStatus("PENDING"),
      missedMakeUp: makeUpStatus("MISSED"),
      scheduledSessions: scheduled.length,
      chargeable,
      ...(catchUp ? { catchUp } : {}),
      learned: attended + madeUp,
      days,
    }
  })

  // --- Dòng phiếu thu ---
  for (const item of planned) {
    const name = item.isOneOnOne ? `Học 1-1 với GV Việt Nam – ${item.className}` : `Học phí ${item.className}`
    lines.push({
      description: `${name} tháng ${label}${item.estimated ? " (tạm tính theo lịch)" : ""}`,
      category: "TUITION",
      quantity: item.regularSessions,
      unitAmount: item.sessionFee,
    })
    // Buổi GV nước ngoài là buổi thêm ngoài lịch, không phải tháng nào cũng có: chỉ thu khi lớp đã xếp buổi đó
    if (item.foreignSessions > 0) {
      lines.push({
        description: `Buổi học thêm với GV nước ngoài – ${item.className} (đơn giá + phụ thu)`,
        category: "FOREIGN",
        quantity: item.foreignSessions,
        unitAmount: item.sessionFee + Math.round(item.foreignSurcharge / item.foreignSessions),
      })
    }
  }

  for (const adjustment of adjustments) {
    lines.push(adjustment.line)
    addCarry(adjustment.classId, adjustment.line)
  }

  // Trừ buổi nghỉ không kèm bù được, chỉ khi tháng của buổi đó đã thu theo phiếu tháng có lớp này
  const credits = new Map<string, BillingLineDraft & { classId: string }>()
  const creditDates = new Map<string, string[]>()
  // Tháng của buổi đã được thu: phiếu tháng đó có lớp này, hoặc phiếu tháng sau đã thu bù các buổi tháng đó
  const monthBilled = (monthKey: string, classId: string) =>
    Boolean(parseBillingSummary(paymentByMonth.get(monthKey)?.billingSummary)?.planned.some((item) => item.classId === classId)) ||
    Boolean(
      parseBillingSummary(paymentByMonth.get(shiftBillingMonth(monthKey, 1))?.billingSummary)?.previous.some(
        (item) => item.classId === classId && item.catchUp
      )
    )
  for (const makeUp of missedMakeUps) {
    const session = makeUp.session
    if (usedMakeUps.has(makeUp.id) || !monthBilled(billingMonthKey(session.sessionDate), session.class.id)) continue

    const amount = classFee(session.class) + (session.isForeignTeacher ? session.surcharge : 0)
    const key = `${session.class.id}:${amount}`
    const credit = credits.get(key) ?? {
      classId: session.class.id,
      description: "",
      category: "CARRY",
      quantity: 0,
      unitAmount: -amount,
      makeUpIds: [],
    }
    const dates = [...(creditDates.get(key) ?? []), formatVietnam(session.sessionDate, "dd/MM")]
    credit.quantity += 1
    credit.makeUpIds = [...(credit.makeUpIds ?? []), makeUp.id]
    credit.description = `Trừ buổi nghỉ không kèm bù được – ${session.class.name} (${dates.join(", ")})`
    credits.set(key, credit)
    creditDates.set(key, dates)
  }
  for (const { classId, ...line } of credits.values()) {
    lines.push(line)
    addCarry(classId, line)
  }

  for (const item of previous) {
    const value = carry.get(item.classId)
    item.carryOver = value?.credit ?? 0
    item.carryAmount = value?.creditAmount ?? 0
    item.extraSessions = value?.extra ?? 0
    item.extraAmount = value?.extraAmount ?? 0
  }

  const siblings = await siblingBills(student.id, student.parent?.phone, month)

  const existing = paymentByMonth.get(month)
  if (classes.length === 0) warnings.push("Học viên chưa có lớp nào đang học")

  return {
    month,
    student: { id: student.id, fullName: student.fullName, code: student.code },
    summary: {
      version: 1,
      month,
      previousMonth,
      planned,
      previous,
      siblings,
      parentPhone: student.parent?.phone ?? null,
    },
    lines,
    existingPayment: existing ? { id: existing.id, receiptCode: existing.receiptCode, status: existing.status } : null,
    warnings,
  }
}

export type MonthlyPaymentRecordInput = {
  studentId: string
  month: string
  lines: BillingLineDraft[]
  /** "YYYY-MM-DD" (giờ VN); trống = hạn mặc định */
  dueDate?: string | null
  note?: string | null
  /** Có = sửa phiếu tháng đã có */
  paymentId?: string | null
}

/**
 * Hạn đóng mặc định, học phí thu trước: ngày cuối của tháng liền trước tháng thu.
 * Phiếu lập muộn (vd. bé vào lớp giữa tháng) thì hạn không sớm hơn hôm nay.
 */
export function defaultDueDate(month: string, now = new Date()) {
  const bounds = vietnamMonthBounds(month)
  if (!bounds) return vietnamDayRange(now, 7).start
  const lastDayBefore = vietnamDayRange(bounds.start, -1).start
  const today = vietnamDayRange(now).start
  return lastDayBefore < today ? today : lastDayBefore
}

/**
 * Lưu phiếu thu tháng (tạo mới hoặc sửa). Không kiểm tra quyền: người gọi (server action) phải kiểm tra trước.
 * Ảnh chụp đối chiếu luôn tính lại trên server, không tin dữ liệu trình duyệt gửi.
 */
export async function saveMonthlyPaymentRecord(input: MonthlyPaymentRecordInput, actorId: string): Promise<{ id: string; totalAmount: number }> {
  const draft = await buildMonthlyBillDraft(input.studentId, input.month)
  const lines: BillingLineDraft[] = input.lines.filter((line) => line.quantity > 0)
  if (lines.length === 0) throw new Error("Phiếu thu cần ít nhất một dòng có số lượng > 0")
  const totalAmount = billTotal(lines)
  const dueDate = parseVietnamDateKey(input.dueDate) ?? defaultDueDate(input.month)
  const billingSummary = JSON.stringify(draft.summary)
  const lineRows = lines.map((line) => ({
    description: line.description,
    category: line.category,
    quantity: line.quantity,
    unitAmount: line.unitAmount,
    totalAmount: lineTotal(line),
  }))
  // Chỉ nhận các buổi kèm bù hợp lệ của chính bé (không tin id do trình duyệt gửi)
  const makeUpIds = [...new Set(lines.flatMap((line) => line.makeUpIds ?? []))]

  const student = await prisma.student.findUnique({ where: { id: input.studentId }, select: { code: true, fullName: true } })
  if (!student) throw new Error("Không tìm thấy học viên")

  let paymentId: string
  if (input.paymentId) {
    const existing = await prisma.payment.findUnique({
      where: { id: input.paymentId },
      select: { id: true, studentId: true, billingMonth: true, paidAmount: true, status: true, receiptCode: true },
    })
    if (!existing || existing.studentId !== input.studentId || existing.billingMonth !== input.month) {
      throw new Error("Không tìm thấy phiếu thu tháng cần sửa")
    }
    if (existing.status === "CANCELLED" || existing.status === "REFUNDED") throw new Error("Phiếu đã huỷ/hoàn tiền, không sửa được")
    if (totalAmount < existing.paidAmount) {
      throw new Error(`Tổng mới (${totalAmount.toLocaleString("vi-VN")}đ) nhỏ hơn số đã thu (${existing.paidAmount.toLocaleString("vi-VN")}đ)`)
    }
    const remainingAmount = totalAmount - existing.paidAmount
    const receiptCode = existing.receiptCode || (await generateReceiptCode())

    // D1 không có transaction tương tác: gom các câu ghi vào một batch để chạy cùng lúc.
    // Buổi kèm bù đã trừ vào phiếu này giữ nguyên đánh dấu (dòng nạp lại khi sửa không mang makeUpIds)
    await prisma.$transaction([
      prisma.paymentLineItem.deleteMany({ where: { paymentId: existing.id } }),
      prisma.paymentLineItem.createMany({ data: lineRows.map((row) => ({ ...row, paymentId: existing.id })) }),
      prisma.payment.update({
        where: { id: existing.id },
        data: {
          receiptCode,
          totalAmount,
          remainingAmount,
          status: remainingAmount <= 0 ? "PAID" : existing.paidAmount > 0 ? "PARTIAL" : "UNPAID",
          dueDate,
          note: input.note?.trim() || null,
          billingSummary,
          qrPayload: buildQrPayload(receiptCode, remainingAmount, student),
        },
      }),
    ])
    paymentId = existing.id
  } else {
    if (draft.existingPayment) {
      throw new Error(`Bé đã có phiếu thu tháng ${formatBillingMonth(input.month)} (${draft.existingPayment.receiptCode ?? "chưa có mã"})`)
    }
    const receiptCode = await generateReceiptCode()
    const created = await prisma.payment.create({
      data: {
        receiptCode,
        studentId: input.studentId,
        classId: draft.summary.planned.length === 1 ? draft.summary.planned[0].classId : null,
        totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        status: totalAmount <= 0 ? "PAID" : "UNPAID",
        paymentMethod: "BANK_TRANSFER",
        dueDate,
        billingMonth: input.month,
        billingSummary,
        qrPayload: buildQrPayload(receiptCode, totalAmount, student),
        bankName: process.env.PAYMENT_BANK_NAME || null,
        bankAccountName: process.env.PAYMENT_BANK_ACCOUNT_NAME || null,
        bankAccountNo: process.env.PAYMENT_BANK_ACCOUNT_NO || null,
        note: input.note?.trim() || `Học phí tháng ${formatBillingMonth(input.month)}`,
        createdById: actorId,
        lineItems: { create: lineRows },
      },
      select: { id: true },
    })
    paymentId = created.id
  }

  if (makeUpIds.length > 0) {
    await prisma.makeUpLesson.updateMany({
      where: { id: { in: makeUpIds }, studentId: input.studentId, status: "MISSED", creditedPaymentId: null },
      data: { creditedPaymentId: paymentId },
    })
  }

  return { id: paymentId, totalAmount }
}

/** "Nguyễn Thùy Anh" → "Thùy Anh": phụ huynh quen gọi bé bằng tên, kèm tên đệm */
function callName(fullName: string) {
  const words = fullName.trim().split(/\s+/)
  return words.length >= 3 ? words.slice(-2).join(" ") : fullName.trim()
}

function stripDiacritics(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
}

/**
 * Thông báo thu học phí cả nhà cho phiếu thu tháng: các bé cùng SĐT phụ huynh có phiếu cùng tháng,
 * mỗi bé một cột (mục 1–6), tổng cả nhà và một mã QR cho tổng số tiền còn phải đóng.
 */
export async function buildFamilyNotice(paymentId: string): Promise<FamilyNotice | null> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      billingMonth: true,
      bankName: true,
      bankAccountNo: true,
      bankAccountName: true,
      student: { select: { id: true, parent: { select: { fullName: true, phone: true } } } },
    },
  })
  if (!payment?.billingMonth) return null
  const month = payment.billingMonth

  const siblings = await findSiblings(payment.student.id, payment.student.parent?.phone)
  const studentIds = [payment.student.id, ...siblings.map((sibling) => sibling.id)]
  const [payments, settings] = await Promise.all([
    prisma.payment.findMany({
      where: { studentId: { in: studentIds }, billingMonth: month, status: { notIn: ["CANCELLED", "REFUNDED"] } },
      select: {
        id: true,
        receiptCode: true,
        totalAmount: true,
        paidAmount: true,
        remainingAmount: true,
        dueDate: true,
        billingSummary: true,
        student: { select: { id: true, fullName: true } },
        lineItems: { select: { category: true, description: true, quantity: true, totalAmount: true } },
      },
    }),
    getSiteSettings(),
  ])
  // Bé của phiếu đang xem đứng đầu, các anh chị em xếp theo tên
  payments.sort((a, b) =>
    a.student.id === payment.student.id ? -1 : b.student.id === payment.student.id ? 1 : a.student.fullName.localeCompare(b.student.fullName, "vi")
  )

  const children: FamilyNoticeChild[] = payments.map((item) => {
    const summary = parseBillingSummary(item.billingSummary)
    const sum = (kind: string, field: "quantity" | "totalAmount") =>
      item.lineItems.filter((line) => noticeLineKind(line) === kind).reduce((total, line) => total + line[field], 0)
    const classNames = summary?.planned.map((plan) => plan.className) ?? []
    return {
      paymentId: item.id,
      receiptCode: item.receiptCode,
      fullName: item.student.fullName,
      label: [callName(item.student.fullName), ...classNames].join(" "),
      prevBilled: summary?.previous.reduce((total, prev) => total + (prev.billedSessions ?? 0), 0) ?? 0,
      prevChargeable:
        summary?.previous.reduce((total, prev) => total + (prev.chargeable ?? prev.scheduledSessions ?? prev.heldSessions), 0) ?? 0,
      carryAmount: sum("carry", "totalAmount"),
      monthSessions: sum("tuition", "quantity"),
      monthAmount: sum("tuition", "totalAmount"),
      foreignAmount: sum("foreign", "totalAmount"),
      materialAmount: sum("extra", "totalAmount"),
      discountAmount: sum("discount", "totalAmount"),
      total: item.totalAmount,
      paid: item.paidAmount,
      remaining: item.remainingAmount,
      attendance: (summary?.previous ?? [])
        .filter((prev) => prev.days?.length)
        .map((prev) => ({ className: prev.className, days: prev.days ?? [] })),
      planned: (summary?.planned ?? [])
        .filter((plan) => plan.dates.length)
        .map((plan) => ({ className: plan.className, dates: plannedDatesText(plan) })),
    }
  })

  const totalDue = children.reduce((total, child) => total + child.remaining, 0)
  const monthNumber = month.slice(5)
  const transferContent = `${children.map((child) => child.label).join(" ")} Thang ${monthNumber}`
  const bank = {
    code: (payment.bankName || settings.paymentBankCode || "MB").split(" ")[0].toUpperCase(),
    accountNo: payment.bankAccountNo || settings.paymentBankAccountNo || "",
    accountName: payment.bankAccountName || settings.paymentBankAccountName || "",
  }
  // Nội dung QR không dấu, tối đa 50 ký tự (giới hạn của nhiều ngân hàng)
  const addInfo = stripDiacritics(transferContent).replace(/[^A-Za-z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, 50)
  const qrUrl =
    bank.accountNo && totalDue > 0
      ? `https://img.vietqr.io/image/${bank.code}-${bank.accountNo}-compact2.svg?amount=${Math.round(totalDue)}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(bank.accountName)}`
      : null
  const dueDates = payments.map((item) => item.dueDate).filter((date): date is Date => Boolean(date))
  const dueDate = dueDates.length ? new Date(Math.min(...dueDates.map((date) => date.getTime()))) : null

  return {
    month,
    previousMonth: shiftBillingMonth(month, -1),
    parentName: payment.student.parent?.fullName ?? null,
    children,
    totalAmount: children.reduce((total, child) => total + child.total, 0),
    totalPaid: children.reduce((total, child) => total + child.paid, 0),
    totalDue,
    transferContent,
    dueDate: dueDate ? formatVietnam(dueDate, "dd/MM/yyyy") : null,
    bank,
    qrUrl,
  }
}
