import * as z from "zod"

export const paymentSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, "Học viên là bắt buộc"),
  totalAmount: z.coerce.number().min(0),
  paidAmount: z.coerce.number().min(0),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CARD", "OTHER"]).default("CASH"),
  status: z.enum(["UNPAID", "PARTIAL", "PAID", "REFUNDED", "CANCELLED"]).default("UNPAID"),
  note: z.string().optional(),
})

export type PaymentFormValues = z.infer<typeof paymentSchema>
