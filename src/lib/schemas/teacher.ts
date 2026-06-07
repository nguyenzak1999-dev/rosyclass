import { z } from "zod"

export const teacherSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  roleCode: z.enum(["TEACHER", "ADMIN", "SUPER_ADMIN", "CONSULTANT", "ACCOUNTANT"]).default("TEACHER"),
  bio: z.string().optional(),
  specialties: z.string().optional(),
  certificates: z.string().optional(),
  avatar: z.string().optional(),
  showOnHomepage: z.boolean().default(false),
})

export type TeacherFormValues = z.infer<typeof teacherSchema>
