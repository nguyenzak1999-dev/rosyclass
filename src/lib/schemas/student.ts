import { z } from "zod"

export const studentSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BANNED']).default('ACTIVE'),
})

export type StudentFormValues = z.infer<typeof studentSchema>
