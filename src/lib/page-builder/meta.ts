import * as z from "zod"
import { PAGE_SLUG_RE } from "./constants"

/** Thông tin trang (tab "Cài đặt trang" trong builder) */
export const pageMetaSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề là bắt buộc").max(160, "Tiêu đề tối đa 160 ký tự"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug là bắt buộc")
    .max(120, "Slug tối đa 120 ký tự")
    .regex(PAGE_SLUG_RE, "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang"),
  seoTitle: z.string().trim().max(160, "SEO title tối đa 160 ký tự"),
  seoDescription: z.string().trim().max(320, "SEO description tối đa 320 ký tự"),
})

export type PageMetaInput = z.infer<typeof pageMetaSchema>
