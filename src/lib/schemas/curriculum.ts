import { z } from "zod"
import { MAX_STARS } from "@/lib/curriculum"

const optionalText = (max: number, message: string) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() || null : value ?? null),
    z.string().max(max, message).nullable()
  )

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() || null : value ?? null),
  z
    .string()
    .max(500, "Đường dẫn tối đa 500 ký tự")
    .regex(/^https?:\/\/\S+$/i, "Đường dẫn phải bắt đầu bằng http:// hoặc https://")
    .nullable()
)

export const curriculumSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Tên chương trình là bắt buộc").max(200, "Tên tối đa 200 ký tự"),
  gradeLabel: z.string().trim().min(1, "Khối lớp là bắt buộc").max(50, "Khối lớp tối đa 50 ký tự"),
  description: optionalText(2000, "Mô tả tối đa 2000 ký tự"),
  sourceBook: optionalText(200, "Giáo trình tối đa 200 ký tự"),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT", "PUBLISHED"]).default("ACTIVE"),
})

export type CurriculumFormValues = z.input<typeof curriculumSchema>

export const curriculumUnitSchema = z.object({
  id: z.string().optional(),
  curriculumId: z.string().min(1, "Thiếu chương trình học"),
  title: z.string().trim().min(1, "Tên Unit là bắt buộc").max(200, "Tên Unit tối đa 200 ký tự"),
  objectives: optionalText(2000, "Mục tiêu tối đa 2000 ký tự"),
  /** Từ vựng nhập tay, cách nhau bởi dấu phẩy hoặc xuống dòng */
  vocabularyText: z.string().max(4000, "Từ vựng quá dài").default(""),
  /** Mỗi dòng một mẫu câu */
  sentencePatternsText: z.string().max(4000, "Mẫu câu quá dài").default(""),
  phonics: optionalText(500, "Phonics tối đa 500 ký tự"),
  songUrl: optionalUrl,
})

export type CurriculumUnitFormValues = z.input<typeof curriculumUnitSchema>

export const lessonSchema = z.object({
  id: z.string().optional(),
  unitId: z.string().min(1, "Thiếu Unit"),
  title: z.string().trim().min(1, "Tên bài là bắt buộc").max(200, "Tên bài tối đa 200 ký tự"),
  objectives: optionalText(2000, "Mục tiêu tối đa 2000 ký tự"),
  activities: optionalText(8000, "Giáo án tối đa 8000 ký tự"),
  materials: optionalText(2000, "Tài liệu tối đa 2000 ký tự"),
  mediaUrl: optionalUrl,
  homework: optionalText(2000, "Bài tập về nhà tối đa 2000 ký tự"),
})

export type LessonFormValues = z.input<typeof lessonSchema>

export const moveDirectionSchema = z.enum(["up", "down"])

/** Lưu màn hình "Lên lớp": điểm danh + sao/nhận xét của từng bé */
export const teachSessionSchema = z.object({
  sessionId: z.string().min(1, "Thiếu buổi học"),
  attendances: z
    .array(
      z.object({
        studentId: z.string().min(1),
        status: z.enum(["PRESENT", "ABSENT_WITH_PERMISSION", "ABSENT_WITHOUT_PERMISSION", "LATE", "MAKE_UP"]),
      })
    )
    .max(200),
  feedbacks: z
    .array(
      z.object({
        studentId: z.string().min(1),
        stars: z.coerce.number().int().min(0).max(MAX_STARS),
        praises: z.array(z.string().trim().min(1).max(60)).max(10),
        mood: z.string().trim().max(16).nullable(),
        comment: z.string().trim().max(500, "Nhận xét tối đa 500 ký tự").nullable(),
      })
    )
    .max(200),
})

export type TeachSessionValues = z.infer<typeof teachSessionSchema>
