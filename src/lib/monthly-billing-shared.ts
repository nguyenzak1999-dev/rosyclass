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

export type BillingCategory = "TUITION" | "MATERIAL" | "TEST" | "MAKE_UP" | "DISCOUNT" | "OTHER"

export const BILLING_CATEGORY_LABELS: Record<BillingCategory, string> = {
  TUITION: "Học phí",
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
  amount: number
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
