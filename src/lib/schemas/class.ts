import * as z from "zod"

const optionalDate = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.coerce.date().nullable()
)

const optionalMoney = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? null : value),
  z.coerce.number().min(0, "Đơn giá không được âm").nullable()
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
  /** Đơn giá/buổi riêng của lớp; trống = theo khoá học */
  sessionFee: optionalMoney.optional(),
  /** Lớp học riêng 1-1 với giáo viên Việt Nam */
  isOneOnOne: z.boolean().default(false),
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
