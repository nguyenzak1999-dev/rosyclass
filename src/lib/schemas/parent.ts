import * as z from "zod"

export const parentSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(1, "Họ và tên là bắt buộc"),
  phone: z.string().min(1, "Số điện thoại là bắt buộc"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  relationship: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  studentIds: z.array(z.string()).optional(),
})

export type ParentFormValues = z.infer<typeof parentSchema>
