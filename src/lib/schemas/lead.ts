import * as z from "zod"

export const leadSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(1, "Tên khách hàng là bắt buộc"),
  phone: z.string().min(1, "Số điện thoại là bắt buộc"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  age: z.coerce.number().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  learningGoal: z.string().optional(),
  currentLevel: z.string().optional(),
  source: z.string().optional(),
  status: z.enum([
    "NEW", "CONTACTED", "NO_ANSWER", "CONSULTED", 
    "PLACEMENT_TEST_BOOKED", "TESTED", "WAITING_FOR_PAYMENT", 
    "ENROLLED", "LOST"
  ]).default("NEW"),
  notes: z.string().optional(),
})

export type LeadFormValues = z.infer<typeof leadSchema>
