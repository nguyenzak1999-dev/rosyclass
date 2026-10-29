// Lập phiếu thu học phí theo tháng (chỉ chạy trên server).
// Một phiếu cho mỗi bé mỗi tháng, gồm: học phí các lớp đang học (số buổi thực tế × đơn giá), buổi giáo viên
// nước ngoài (đơn giá + phụ thu), giảm trừ buổi nghỉ không kèm bù được, và học liệu do kế toán thêm tay.
// Phiếu cũng in đối chiếu tháng trước và anh chị em cùng SĐT phụ huynh.
import { prisma } from "@/lib/prisma"
import {
  DAY_MS,
  formatVietnam,
  toVietnamWallClock,
  vietnamDateKey,
  vietnamDayRange,
  vietnamMonthBounds,
  vietnamMonthStart,
} from "@/lib/curriculum"
import {
  billingMonthKey,
  formatBillingMonth,
  normalizePhone,
  parseBillingSummary,
  shiftBillingMonth,
  type BillingLineDraft,
  type BillingSummary,
  type PlannedClassMonth,
  type PreviousClassMonth,
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

  const classes = student.classStudents.map((item) => item.class)
  const classIds = classes.map((cls) => cls.id)
  const warnings: string[] = []

  const [sessions, monthlyPayments, missedMakeUps] = await Promise.all([
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
            makeUpLessons: { where: { studentId }, select: { status: true } },
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
  ])

  const paymentByMonth = new Map(monthlyPayments.map((payment) => [payment.billingMonth as string, payment]))

  // --- Tạm thu tháng này ---
  const planned: PlannedClassMonth[] = classes.map((cls) => {
    const fee = classFee(cls)
    if (fee <= 0) warnings.push(`Lớp ${cls.name} chưa có đơn giá/buổi (sửa ở lớp hoặc khoá học)`)

    const monthSessions = sessions.filter(
      (session) => session.classId === cls.id && session.status !== "CANCELLED" && session.sessionDate >= start && session.sessionDate < end
    )
    // Buổi GV nước ngoài là buổi thêm, luôn lấy theo buổi đã xếp
    const foreign = monthSessions.filter((session) => session.isForeignTeacher)
    let regularDates = monthSessions.filter((session) => !session.isForeignTeacher).map((session) => session.sessionDate)
    let estimated = false

    if (regularDates.length === 0) {
      // Chưa sinh buổi học thường của tháng: ước tính theo lịch tuần, trong khoảng ngày bắt đầu – kết thúc của lớp
      estimated = true
      const weekdays = new Set(cls.schedules.map((schedule) => schedule.dayOfWeek))
      const days = Math.round((end.getTime() - start.getTime()) / DAY_MS)
      regularDates = Array.from({ length: days }, (_, index) => vietnamDayRange(start, index).start).filter((day) => {
        if (!weekdays.has(toVietnamWallClock(day).getDay())) return false
        if (cls.startDate && vietnamDateKey(day) < vietnamDateKey(cls.startDate)) return false
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
      amount: regularDates.length * fee + foreign.length * fee + foreignSurcharge,
    }
  })

  // --- Đối chiếu tháng trước ---
  const previousPayment = paymentByMonth.get(previousMonth)
  const previousPlanned = parseBillingSummary(previousPayment?.billingSummary)?.planned ?? null
  const previous: PreviousClassMonth[] = classes.map((cls) => {
    const held = sessions.filter(
      (session) =>
        session.classId === cls.id &&
        session.status !== "CANCELLED" &&
        session.sessionDate >= previousStart &&
        session.sessionDate < start &&
        session.sessionDate <= now
    )
    const billed = previousPlanned?.find((item) => item.classId === cls.id)
    const absentSessions = held.filter((session) => ABSENT.has(session.attendances[0]?.status ?? ""))
    const makeUpStatus = (status: string) => absentSessions.filter((session) => session.makeUpLessons[0]?.status === status).length
    return {
      classId: cls.id,
      className: cls.name,
      billedSessions: billed ? billed.regularSessions + billed.foreignSessions : null,
      heldSessions: held.length,
      attended: held.filter((session) => ATTENDED.has(session.attendances[0]?.status ?? "")).length,
      absent: absentSessions.length,
      madeUp: makeUpStatus("DONE"),
      pendingMakeUp: makeUpStatus("PENDING"),
      missedMakeUp: makeUpStatus("MISSED"),
    }
  })

  // --- Dòng phiếu thu ---
  const label = formatBillingMonth(month)
  const lines: BillingLineDraft[] = []
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
        category: "TUITION",
        quantity: item.foreignSessions,
        unitAmount: item.sessionFee + Math.round(item.foreignSurcharge / item.foreignSessions),
      })
    }
  }

  // Trừ buổi nghỉ không kèm bù được, chỉ khi tháng của buổi đó đã thu theo phiếu tháng có lớp này
  const credits = new Map<string, BillingLineDraft>()
  const creditDates = new Map<string, string[]>()
  for (const makeUp of missedMakeUps) {
    const session = makeUp.session
    const billedPlan = parseBillingSummary(paymentByMonth.get(billingMonthKey(session.sessionDate))?.billingSummary)?.planned
    if (!billedPlan?.some((item) => item.classId === session.class.id)) continue

    const amount = classFee(session.class) + (session.isForeignTeacher ? session.surcharge : 0)
    const key = `${session.class.id}:${amount}`
    const credit = credits.get(key) ?? { description: "", category: "DISCOUNT", quantity: 0, unitAmount: -amount, makeUpIds: [] }
    const dates = [...(creditDates.get(key) ?? []), formatVietnam(session.sessionDate, "dd/MM")]
    credit.quantity += 1
    credit.makeUpIds = [...(credit.makeUpIds ?? []), makeUp.id]
    credit.description = `Trừ buổi nghỉ không kèm bù được – ${session.class.name} (${dates.join(", ")})`
    credits.set(key, credit)
    creditDates.set(key, dates)
  }
  lines.push(...credits.values())

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
