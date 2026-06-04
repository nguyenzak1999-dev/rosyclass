import { z } from "zod"

export const blogPostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Tiêu đề phải có ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug phải có ít nhất 2 ký tự"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Nội dung không được để trống"),
  thumbnail: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ACTIVE', 'INACTIVE']).default('DRAFT'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

export type BlogPostFormValues = z.infer<typeof blogPostSchema>
