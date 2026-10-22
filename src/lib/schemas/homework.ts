import { z } from "zod"
import { HOMEWORK_KINDS, HOMEWORK_STICKERS, SKILLS } from "@/lib/curriculum"

const optionalText = (max: number, message: string) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() || null : value ?? null),
    z.string().max(max, message).nullable()
  )

const optionalId = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() || null : value ?? null),
  z.string().max(64).nullable()
)

/** "YYYY-MM-DD" theo giờ Việt Nam, hoặc rỗng */
const optionalDateKey = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() || null : value ?? null),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ").nullable()
)

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ")

export const homeworkKindSchema = z.enum(HOMEWORK_KINDS.map((kind) => kind.value) as [string, ...string[]])

export const homeworkSchema = z.object({
  id: z.string().optional(),
  classId: z.string().min(1, "Thiếu lớp học"),
  sessionId: optionalId,
  lessonId: optionalId,
  title: z.string().trim().min(1, "Tên bài tập là bắt buộc").max(200, "Tên bài tập tối đa 200 ký tự"),
  instructions: optionalText(2000, "Hướng dẫn tối đa 2000 ký tự"),
  kind: homeworkKindSchema.default("OTHER"),
  dueDate: optionalDateKey,
})

export type HomeworkFormValues = z.input<typeof homeworkSchema>

export const stickerSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() || null : value ?? null),
  z.enum(HOMEWORK_STICKERS).nullable()
)

export const reviewSubmissionSchema = z.object({
  submissionId: z.string().min(1, "Thiếu bài nộp"),
  sticker: stickerSchema,
  teacherComment: optionalText(500, "Nhận xét tối đa 500 ký tự"),
})

export type ReviewSubmissionValues = z.input<typeof reviewSubmissionSchema>

/** Giáo viên ghi nhận các bé "đã làm trên lớp" (không có file) */
export const recordInClassSchema = z.object({
  homeworkId: z.string().min(1, "Thiếu bài tập"),
  studentIds: z.array(z.string().min(1)).min(1, "Chọn ít nhất một bé").max(200),
  sticker: stickerSchema,
})

export type RecordInClassValues = z.input<typeof recordInClassSchema>

export const skillCodeSchema = z.enum(SKILLS.map((skill) => skill.value) as [string, ...string[]])

export const saveSkillAssessmentsSchema = z.object({
  classId: z.string().min(1, "Thiếu lớp học"),
  unitId: z.string().min(1, "Chọn Unit cần đánh giá"),
  entries: z
    .array(
      z.object({
        studentId: z.string().min(1),
        skill: skillCodeSchema,
        /** null = xoá đánh giá đã có */
        level: z.number().int().min(1).max(3).nullable(),
        note: optionalText(300, "Ghi chú tối đa 300 ký tự"),
      })
    )
    .max(2000),
})

export type SaveSkillAssessmentsValues = z.input<typeof saveSkillAssessmentsSchema>

export const generateReportsSchema = z
  .object({
    classId: z.string().min(1, "Thiếu lớp học"),
    /** Ngày đầu và ngày cuối kỳ (giờ VN, tính cả hai đầu) */
    from: dateKey,
    to: dateKey,
    title: optionalText(200, "Tiêu đề tối đa 200 ký tự"),
  })
  .refine((value) => value.from <= value.to, { message: "Ngày bắt đầu phải trước ngày kết thúc", path: ["to"] })

export type GenerateReportsValues = z.input<typeof generateReportsSchema>

export const reportCommentSchema = z.object({
  reportId: z.string().min(1),
  teacherComment: optionalText(2000, "Nhận xét tối đa 2000 ký tự"),
})

export const createParentLinkSchema = z.object({
  parentId: z.string().min(1, "Thiếu phụ huynh"),
  label: optionalText(100, "Ghi chú tối đa 100 ký tự"),
  /** Số ngày link còn hiệu lực; 0 = không hết hạn */
  validDays: z.coerce.number().int().min(0).max(3650).default(180),
})

export type CreateParentLinkValues = z.input<typeof createParentLinkSchema>
