import { z } from "zod"

export const studentSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  dateOfBirth: z.coerce.date().optional().nullable(),
  gender: z.string().optional(),
  address: z.string().optional(),
  currentLevel: z.string().optional(),
  learningGoal: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(['ACTIVE', 'WAITING_CLASS', 'RESERVED', 'PAUSED', 'COMPLETED', 'DROPPED']).default('ACTIVE'),
  notes: z.string().optional(),
  parentId: z.string().optional().nullable(),
  tuitionDiscountPercent: z.coerce
    .number({ message: "Miễn/giảm phải là số" })
    .min(0, "Miễn/giảm không được âm")
    .max(100, "Miễn/giảm tối đa 100%")
    .optional(),
})

export type StudentFormValues = z.infer<typeof studentSchema>
