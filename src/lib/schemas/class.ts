import * as z from "zod"

export const classSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tên lớp học là bắt buộc"),
  courseId: z.string().min(1, "Khóa học là bắt buộc"),
  maxStudents: z.coerce.number().min(1).default(15),
  status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED", "PAUSED", "CANCELLED"]).default("UPCOMING"),
  notes: z.string().optional(),
})

export type ClassFormValues = z.infer<typeof classSchema>
