// Học phí thu theo tháng — phần dùng chung server + client (không truy vấn DB).
// Học phí tháng = số buổi thực tế trong tháng (2 buổi/tuần → 7, 8 hoặc 9 buổi) × đơn giá buổi của lớp;
// buổi giáo viên nước ngoài là buổi thêm ngoài lịch, thu đơn giá + phụ thu.
import { toVietnamWallClock, vietnamMonthStart } from "@/lib/curriculum"

/** Phụ thu mặc định cho mỗi buổi học với giáo viên nước ngoài */
export const FOREIGN_TEACHER_SURCHARGE = 50_000
/** Thời lượng mặc định của một buổi kèm bù khi học sinh nghỉ */
export const MAKE_UP_MINUTES = 30

export const MAKE_UP_STATUS_LABELS = {
  PENDING: "Chờ kèm bù",
  DONE: "Đã kèm bù",
  MISSED: "Không bù được",
} as const

export type MakeUpStatusCode = keyof typeof MAKE_UP_STATUS_LABELS

export type BillingCategory = "TUITION" | "FOREIGN" | "CARRY" | "MATERIAL" | "TEST" | "MAKE_UP" | "DISCOUNT" | "OTHER"

export const BILLING_CATEGORY_LABELS: Record<BillingCategory, string> = {
  TUITION: "Học phí",
  FOREIGN: "Buổi GV nước ngoài",
  CARRY: "Thừa/thiếu tháng trước",
  MATERIAL: "Học liệu / sách",
  TEST: "Kiểm tra",
  MAKE_UP: "Học bù",
  DISCOUNT: "Giảm trừ",
  OTHER: "Khác",
}

/** Một dòng trên phiếu thu tháng; giảm trừ có unitAmount âm */
export type BillingLineDraft = {
  description: string
  category: BillingCategory
  quantity: number
  unitAmount: number
  /** Buổi kèm bù không bù được được trừ ở dòng này (để đánh dấu đã trừ khi lưu phiếu) */
  makeUpIds?: string[]
}

export type PlannedClassMonth = {
  classId: string
  className: string
  isOneOnOne: boolean
  sessionFee: number
  regularSessions: number
  foreignSessions: number
  foreignSurcharge: number
  /** true khi lớp chưa sinh buổi học của tháng, số buổi ước tính theo lịch tuần */
  estimated: boolean
  /** Các ngày học "dd/MM" để in trên phiếu */
  dates: string[]
  /** Ngày "dd/MM" của buổi GV nước ngoài (nằm trong dates); phiếu cũ không có */
  foreignDates?: string[]
  amount: number
}

/** Điểm danh của bé ở một buổi tháng trước, in trên phiếu để phụ huynh đối chiếu */
export type SessionMarkCode =
  | "PRESENT"
  | "LATE"
  | "MADE_UP"
  | "PENDING_MAKE_UP"
  | "MISSED_MAKE_UP"
  | "ABSENT"
  | "CANCELLED"
  | "UPCOMING"
  | "UNMARKED"

export type SessionMark = {
  /** "dd/MM" */
  date: string
  mark: SessionMarkCode
  foreign?: boolean
  /** Ngày kèm bù "dd/MM" khi bé nghỉ và đã/được xếp kèm bù */
  makeUpDate?: string
}

export const SESSION_MARK_LABELS: Record<SessionMarkCode, string> = {
  PRESENT: "Có mặt",
  LATE: "Đi muộn",
  MADE_UP: "Nghỉ, đã kèm bù",
  PENDING_MAKE_UP: "Nghỉ, chờ kèm bù",
  MISSED_MAKE_UP: "Nghỉ, không bù được",
  ABSENT: "Nghỉ",
  CANCELLED: "Lớp nghỉ (huỷ)",
  UPCOMING: "Chưa học",
  UNMARKED: "Chưa điểm danh",
}

/** "09/10 nghỉ, đã kèm bù 10/10" — dùng cho tin nhắn, bản in và nhãn trên phiếu */
export function sessionMarkText(item: SessionMark) {
  const date = `${item.date}${item.foreign ? " (GVNN)" : ""}`
  if (item.mark === "PRESENT") return `${date} ✓`
  return `${date} ${SESSION_MARK_LABELS[item.mark].toLowerCase()}${item.makeUpDate ? ` ${item.makeUpDate}` : ""}`
}

/** Buổi cộng dồn sang phiếu này: "Trừ 3 buổi (-450.000đ) · Thu thêm 1 buổi (+200.000đ)" */
export function carryOverText(item: Pick<PreviousClassMonth, "carryOver" | "carryAmount" | "extraSessions" | "extraAmount">) {
  if (item.carryOver === undefined) return "—"
  const money = (value = 0) => `${Math.abs(Math.round(value)).toLocaleString("vi-VN")}đ`
  const parts = [
    item.carryOver ? `Trừ ${item.carryOver} buổi (-${money(item.carryAmount)})` : null,
    item.extraSessions ? `Thu thêm ${item.extraSessions} buổi (+${money(item.extraAmount)})` : null,
  ].filter(Boolean)
  return parts.length ? parts.join(" · ") : "Không"
}

/** Ngày học dự kiến của tháng thu, đánh dấu buổi GV nước ngoài */
export function plannedDatesText(item: Pick<PlannedClassMonth, "dates" | "foreignDates">) {
  const foreign = new Set(item.foreignDates ?? [])
  return item.dates.map((date) => (foreign.has(date) ? `${date} (GVNN)` : date)).join(", ")
}

export type PreviousClassMonth = {
  classId: string
  className: string
  /** Số buổi đã thu trên phiếu tháng trước; null nếu tháng trước không có phiếu thu tháng */
  billedSessions: number | null
  /** Số buổi lớp đã diễn ra (không tính buổi huỷ, buổi chưa tới) */
  heldSessions: number
  attended: number
  absent: number
  madeUp: number
  pendingMakeUp: number
  missedMakeUp: number
  // Các trường dưới có từ bản cộng dồn buổi; phiếu lập trước đó không có
  /** Buổi lớp xếp trong tháng (không tính buổi huỷ), gồm cả buổi chưa tới ngày */
  scheduledSessions?: number
  /** Buổi thực tính phí: buổi lớp xếp trừ buổi bé nghỉ không kèm bù được */
  chargeable?: number
  /** true khi tháng trước chưa có phiếu và phiếu này thu bù các buổi đã học */
  catchUp?: boolean
  /** Buổi bé đã học thực tế: có mặt/đi muộn + đã kèm bù */
  learned?: number
  /** Điểm danh từng buổi */
  days?: SessionMark[]
  /** Buổi cộng dồn được trừ vào phiếu này (đã thu mà lớp huỷ, nghỉ không kèm bù được) và số tiền trừ (âm) */
  carryOver?: number
  carryAmount?: number
  /** Buổi phát sinh sau khi lập phiếu tháng trước, thu thêm ở phiếu này, và số tiền (dương) */
  extraSessions?: number
  extraAmount?: number
}

export type SiblingBill = {
  studentId: string
  fullName: string
  code: string | null
  paymentId: string | null
  receiptCode: string | null
  totalAmount: number
  remainingAmount: number
  status: string | null
}

/** Ảnh chụp số liệu lưu cùng phiếu (Payment.billingSummary) để phiếu in ra không đổi theo dữ liệu về sau */
export type BillingSummary = {
  version: 1
  month: string
  previousMonth: string
  planned: PlannedClassMonth[]
  previous: PreviousClassMonth[]
  siblings: SiblingBill[]
  parentPhone: string | null
}

export function parseBillingSummary(value: string | null | undefined): BillingSummary | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as BillingSummary
    return parsed && parsed.version === 1 ? parsed : null
  } catch {
    return null
  }
}

export function lineTotal(line: Pick<BillingLineDraft, "quantity" | "unitAmount">) {
  return Math.round(line.quantity * line.unitAmount)
}

export function billTotal(lines: Pick<BillingLineDraft, "quantity" | "unitAmount">[]) {
  return Math.max(0, lines.reduce((sum, line) => sum + lineTotal(line), 0))
}

// ------------------------------------------------------
// Tháng thu ("YYYY-MM", theo giờ Việt Nam)
// ------------------------------------------------------

export function billingMonthKey(value: Date | string | number) {
  const local = toVietnamWallClock(value)
  return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}`
}

/** Tháng mặc định khi lập phiếu: tháng kế tiếp (thu trước học sau) */
export function defaultBillingMonth(now = new Date()) {
  return billingMonthKey(vietnamMonthStart(now, 1))
}

export function shiftBillingMonth(month: string, offset: number) {
  const [year, monthIndex] = month.split("-").map(Number)
  const date = new Date(Date.UTC(year, monthIndex - 1 + offset, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
}

export function isBillingMonth(value: string | null | undefined): value is string {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value ?? "")
}

/** "2026-11" → "11/2026" */
export function formatBillingMonth(month: string) {
  const [year, monthIndex] = month.split("-")
  return `${monthIndex}/${year}`
}

/** Chuẩn hoá SĐT để so khớp phụ huynh: chỉ giữ chữ số, đổi đầu 84 thành 0 */
export function normalizePhone(phone: string | null | undefined) {
  const digits = (phone ?? "").replace(/\D/g, "")
  if (digits.startsWith("84") && digits.length >= 11) return `0${digits.slice(2)}`
  return digits
}

// ------------------------------------------------------
// Thông báo thu học phí cả nhà (mỗi bé một cột)
// ------------------------------------------------------

export type NoticeLineKind = "tuition" | "foreign" | "carry" | "extra" | "discount"

/** Xếp dòng phiếu vào các mục của thông báo; phiếu lập trước khi có danh mục FOREIGN/CARRY thì đoán theo nội dung */
export function noticeLineKind(line: { category: string; description: string }): NoticeLineKind {
  if (line.category === "CARRY") return "carry"
  if (line.category === "FOREIGN") return "foreign"
  if (line.category === "TUITION" || line.category === "DISCOUNT") {
    if (/^(Trừ buổi|Thu thêm buổi|Thu buổi)/.test(line.description)) return "carry"
    if (line.category === "DISCOUNT") return "discount"
    return /GV nước ngoài/.test(line.description) ? "foreign" : "tuition"
  }
  return "extra"
}

export type FamilyNoticeChild = {
  paymentId: string
  receiptCode: string | null
  fullName: string
  /** Tên gọi + lớp, vd. "Thùy Anh G3" */
  label: string
  /** Mục 1–3: tháng trước */
  prevBilled: number
  prevChargeable: number
  carryAmount: number
  /** Mục 4–6: tháng thu */
  monthSessions: number
  monthAmount: number
  /** Mục 6: buổi học với giáo viên nước ngoài; mục 7: học liệu, sách và các khoản thu thêm khác */
  foreignAmount: number
  materialAmount: number
  discountAmount: number
  total: number
  paid: number
  remaining: number
  attendance: { className: string; days: SessionMark[] }[]
  planned: { className: string; dates: string }[]
}

export type FamilyNotice = {
  month: string
  previousMonth: string
  parentName: string | null
  children: FamilyNoticeChild[]
  totalAmount: number
  totalPaid: number
  totalDue: number
  /** Nội dung chuyển khoản hiển thị, vd. "Thùy Anh G3 Minh Quang L5 Thang 10" */
  transferContent: string
  dueDate: string | null
  bank: { code: string; accountNo: string; accountName: string }
  qrUrl: string | null
}
