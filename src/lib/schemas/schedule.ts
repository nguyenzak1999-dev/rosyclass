import { z } from "zod"

/**
 * Regex HH:mm (24h format). Dùng cho startTime / endTime của ClassSchedule & ClassSession.
 */
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

const timeString = z
  .string()
  .regex(TIME_REGEX, "Định dạng giờ phải là HH:mm (ví dụ: 18:00)")

/**
 * Schema cho ClassSchedule — lịch học cố định theo thứ trong tuần.
 */
export const scheduleSchema = z
  .object({
    id: z.string().optional(),
    classId: z.string().min(1, "Lớp học là bắt buộc"),
    dayOfWeek: z.coerce
      .number()
      .int("Thứ trong tuần phải là số nguyên")
      .min(0, "Thứ trong tuần từ 0 (CN) đến 6 (T7)")
      .max(6, "Thứ trong tuần từ 0 (CN) đến 6 (T7)"),
    startTime: timeString,
    endTime: timeString,
    roomId: z.string().optional().nullable(),
    teacherId: z.string().optional().nullable(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "Giờ bắt đầu phải trước giờ kết thúc",
    path: ["endTime"],
  })

export type ScheduleFormValues = z.infer<typeof scheduleSchema>

/**
 * Schema cho generateSessions — sinh các buổi học từ schedule trong 1 khoảng ngày.
 */
/**
 * Input type cho generateSessions ở form: dùng string "YYYY-MM-DD" vì <input type="date">.
 * Action sẽ tự chuyển sang Date.
 */
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải có định dạng YYYY-MM-DD")

export const generateSessionsSchema = z
  .object({
    classId: z.string().min(1, "Lớp học là bắt buộc"),
    fromDate: dateString,
    toDate: dateString,
    replaceExisting: z.boolean().default(false),
  })
  .refine((data) => new Date(data.fromDate) <= new Date(data.toDate), {
    message: "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc",
    path: ["toDate"],
  })
  .refine(
    (data) => {
      const from = new Date(data.fromDate)
      const to = new Date(data.toDate)
      const monthsDiff =
        (to.getFullYear() - from.getFullYear()) * 12 +
        (to.getMonth() - from.getMonth())
      return monthsDiff <= 12
    },
    {
      message: "Khoảng thời gian sinh buổi không được quá 12 tháng",
      path: ["toDate"],
    }
  )

export type GenerateSessionsFormValues = z.infer<typeof generateSessionsSchema>

/**
 * Schema cho updateSession — sửa 1 buổi học đã sinh.
 */
export const updateSessionSchema = z
  .object({
    id: z.string().min(1, "ID buổi học là bắt buộc"),
    sessionDate: z.coerce.date().optional(),
    startTime: timeString.optional(),
    endTime: timeString.optional(),
    roomId: z.string().optional().nullable(),
    teacherId: z.string().optional().nullable(),
    topic: z.string().max(200, "Chủ đề tối đa 200 ký tự").optional().nullable(),
    notes: z.string().optional().nullable(),
    /** undefined = giữ nguyên bài đã gắn; null = bỏ gắn bài */
    lessonId: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.startTime < data.endTime
      }
      return true
    },
    {
      message: "Giờ bắt đầu phải trước giờ kết thúc",
      path: ["endTime"],
    }
  )

export type UpdateSessionFormValues = z.infer<typeof updateSessionSchema>

/**
 * Schema cho cancelSession — huỷ 1 buổi học (kèm lý do tuỳ chọn).
 */
export const cancelSessionSchema = z.object({
  id: z.string().min(1, "ID buổi học là bắt buộc"),
  reason: z.string().max(500, "Lý do tối đa 500 ký tự").optional(),
})

export type CancelSessionFormValues = z.infer<typeof cancelSessionSchema>

/**
 * Map tên thứ trong tuần (Tiếng Việt) cho UI select dayOfWeek.
 */
export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: "Chủ nhật",
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
}
