import { z } from "zod"

export const courseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(5, "Tên khóa học phải có ít nhất 5 ký tự"),
  slug: z.string().min(2, "Slug phải có ít nhất 2 ký tự"),
  level: z.enum([
    "KIDS",
    "STARTER",
    "A1",
    "A2",
    "B1",
    "B2",
    "IELTS_FOUNDATION",
    "IELTS_5_5",
    "IELTS_6_5",
    "TOEIC",
    "COMMUNICATION",
    "ONE_ON_ONE",
  ]),
  description: z.string().optional(),
  targetAudience: z.string().optional(),
  learningOutcomes: z.string().optional(),
  tuitionFee: z.coerce.number().min(0, "Học phí không hợp lệ"),
  salePrice: z.coerce.number().min(0, "Giá ưu đãi không hợp lệ").optional().nullable(),
  totalSessions: z.coerce.number().min(1, "Số buổi học phải lớn hơn 0"),
  sessionDurationMinutes: z.coerce.number().min(1, "Thời lượng phải lớn hơn 0").default(90),
  isPublished: z.boolean().default(false),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT", "PUBLISHED"]).default("ACTIVE"),
  thumbnail: z.string().optional(),
})

export type CourseFormValues = z.infer<typeof courseSchema>
