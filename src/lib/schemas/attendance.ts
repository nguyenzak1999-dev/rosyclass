import { z } from "zod"

/**
 * Schema cho từng row điểm danh trong form bulk.
 */
export const attendanceRowSchema = z.object({
  studentId: z.string().min(1, "Thiếu studentId"),
  status: z.enum([
    "PRESENT",
    "ABSENT_WITH_PERMISSION",
    "ABSENT_WITHOUT_PERMISSION",
    "LATE",
    "MAKE_UP",
  ]),
  note: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional().nullable(),
})

export type AttendanceRowValues = z.infer<typeof attendanceRowSchema>

/**
 * Schema cho bulk mark attendance — lưu nhiều HV cùng lúc.
 */
export const markAttendanceSchema = z.object({
  sessionId: z.string().min(1, "Thiếu sessionId"),
  attendances: z.array(attendanceRowSchema).min(1, "Cần ít nhất 1 học viên"),
})

export type MarkAttendanceFormValues = z.infer<typeof markAttendanceSchema>

/**
 * Schema cho tạo buổi make-up (phụ đạo).
 */
export const createMakeUpSessionSchema = z
  .object({
    classId: z.string().min(1, "Lớp học là bắt buộc"),
    originalSessionId: z.string().min(1, "Buổi học gốc là bắt buộc"),
    sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ"),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ bắt đầu không hợp lệ"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ kết thúc không hợp lệ"),
    topic: z.string().max(200).optional().nullable(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "Giờ bắt đầu phải trước giờ kết thúc",
    path: ["endTime"],
  })

export type CreateMakeUpSessionFormValues = z.infer<typeof createMakeUpSessionSchema>

/**
 * Schema cho upsert 1 điểm số.
 */
export const scoreSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, "Học viên là bắt buộc"),
  classId: z.string().min(1, "Lớp học là bắt buộc"),
  sessionId: z.string().optional().nullable(),
  type: z.enum([
    "QUIZ",
    "MIDTERM",
    "FINAL",
    "SPEAKING",
    "WRITING",
    "LISTENING",
    "READING",
    "OTHER",
  ]),
  value: z.coerce.number().min(0, "Điểm không được âm"),
  maxValue: z.coerce.number().min(0.01, "Điểm tối đa phải > 0").default(10),
  note: z.string().max(500).optional().nullable(),
  date: z.coerce.date().optional(),
})

export type ScoreFormValues = z.infer<typeof scoreSchema>
