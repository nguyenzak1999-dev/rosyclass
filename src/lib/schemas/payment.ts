import * as z from "zod"

export const PAYMENT_METHODS = [
  "CASH",
  "BANK_TRANSFER",
  "CARD",
  "OTHER",
] as const

export const PAYMENT_STATUSES = [
  "UNPAID",
  "PARTIAL",
  "PAID",
  "REFUNDED",
  "CANCELLED",
] as const

export const paymentSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, "Học viên là bắt buộc"),
  classId: z.string().optional().nullable(),
  courseId: z.string().optional().nullable(),
  totalAmount: z.coerce.number().min(0, "Tổng tiền phải >= 0"),
  paidAmount: z.coerce.number().min(0, "Số tiền đã trả phải >= 0").default(0),
  paymentMethod: z.enum(PAYMENT_METHODS).default("CASH"),
  status: z.enum(PAYMENT_STATUSES).default("UNPAID"),
  paymentDate: z.coerce.date().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  note: z.string().optional(),
})

export type PaymentFormValues = z.infer<typeof paymentSchema>

/**
 * Schema cho record một khoản thanh toán (partial payment).
 * Auto-update status: PAID nếu đủ, PARTIAL nếu 1 phần.
 */
export const recordPaymentSchema = z.object({
  paymentId: z.string().min(1, "Thiếu payment ID"),
  amount: z.coerce.number().min(1, "Số tiền phải > 0"),
  paymentMethod: z.enum(PAYMENT_METHODS).default("CASH"),
  paymentDate: z.coerce.date().optional(),
  note: z.string().max(500).optional(),
})

export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>
