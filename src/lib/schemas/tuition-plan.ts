import * as z from "zod"

export const TEACHER_TYPES = ["LOCAL", "FOREIGN", "ANY"] as const

export const tuitionPlanSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tên gói học phí là bắt buộc"),
  description: z.string().optional().nullable(),
  sessionCount: z.coerce.number<string | number>().int().min(1, "Số buổi phải lớn hơn 0"),
  price: z.coerce.number<string | number>().min(0, "Học phí không hợp lệ"),
  teacherType: z.enum(TEACHER_TYPES).default("ANY"),
  isActive: z.coerce.boolean<boolean>().default(true),
  courseId: z.string().optional().nullable()
})

export type TuitionPlanFormValues = z.infer<typeof tuitionPlanSchema>

export const addStudentToClassSchema = z.object({
  classId: z.string().min(1, "Lớp học là bắt buộc"),
  studentId: z.string().min(1, "Học viên là bắt buộc"),
  tuitionPlanId: z.string().optional().nullable(),
  createPayment: z.coerce.boolean<boolean>().default(true)
})

export type AddStudentToClassValues = z.infer<typeof addStudentToClassSchema>
