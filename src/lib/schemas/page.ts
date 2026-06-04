import * as z from "zod"

export const pageSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  slug: z.string().min(1, "Slug là bắt buộc"),
  content: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT", "PUBLISHED"]).default("ACTIVE"),
})

export type PageFormValues = z.infer<typeof pageSchema>
