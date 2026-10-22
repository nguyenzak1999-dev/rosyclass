import * as z from "zod"

const optionalDate = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.coerce.date().nullable()
)

const optionalId = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.string().nullable()
)

export const classSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tên lớp học là bắt buộc"),
  courseId: z.string().min(1, "Khóa học là bắt buộc"),
  maxStudents: z.coerce.number().min(1).default(15),
  startDate: optionalDate.optional(),
  expectedEndDate: optionalDate.optional(),
  status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED", "PAUSED", "CANCELLED"]).default("UPCOMING"),
  teacherId: optionalId.optional(),
  teachingAssistantId: optionalId.optional(),
  branchId: optionalId.optional(),
  roomId: optionalId.optional(),
  curriculumId: optionalId.optional(),
  studentIds: z.array(z.string()).default([]),
  notes: z.string().optional(),
})

export type ClassFormValues = z.infer<typeof classSchema>
