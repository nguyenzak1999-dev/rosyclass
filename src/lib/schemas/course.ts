import { z } from "zod"

export const courseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(5, "Tên khóa học phải có ít nhất 5 ký tự"),
  slug: z.string().min(2, "Slug phải có ít nhất 2 ký tự"),
  level: z.enum(['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED', 'MASTERY']),
  description: z.string().optional(),
  tuitionFee: z.coerce.number().min(0, "Học phí không hợp lệ"),
  totalSessions: z.coerce.number().min(1, "Số buổi học phải lớn hơn 0"),
  sessionDurationMinutes: z.coerce.number().min(1, "Thời lượng phải lớn hơn 0").default(90),
  isPublished: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
})

export type CourseFormValues = z.infer<typeof courseSchema>
