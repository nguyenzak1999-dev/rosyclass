"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"
import { revalidatePublicSite } from "@/lib/public-cache"

const testimonialSchema = z.object({
  id: z.string().optional(),
  authorName: z.string().min(2, "Tên học viên phải có ít nhất 2 ký tự"),
  authorTitle: z.string().optional().nullable(),
  content: z.string().min(10, "Nội dung cảm nhận phải có ít nhất 10 ký tự"),
  avatar: z.string().optional().nullable(),
  rating: z.coerce.number().int("Số sao phải là số nguyên").min(1, "Đánh giá từ 1 đến 5 sao").max(5, "Đánh giá từ 1 đến 5 sao").default(5),
  isPublished: z.boolean().default(false),
})

export type TestimonialFormValues = z.infer<typeof testimonialSchema>

export async function upsertTestimonial(data: TestimonialFormValues) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    const result = testimonialSchema.safeParse(data)
    if (!result.success) return { success: false, error: result.error.issues[0]?.message || "Dữ liệu cảm nhận không hợp lệ" }
    const parsed = result.data

    const payload = {
      authorName: parsed.authorName.trim(),
      authorTitle: parsed.authorTitle?.trim() || null,
      content: parsed.content.trim(),
      avatar: parsed.avatar?.trim() || null,
      rating: parsed.rating,
      isPublished: parsed.isPublished,
    }

    if (parsed.id) {
      await prisma.testimonial.update({
        where: { id: parsed.id },
        data: payload,
      })
    } else {
      await prisma.testimonial.create({ data: payload })
    }

    revalidatePublicSite()

    revalidatePath("/admin/cms/testimonials")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Testimonial upsert error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Không thể lưu cảm nhận" }
  }
}

export async function deleteTestimonial(id: string) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    await prisma.testimonial.delete({ where: { id } })
    revalidatePublicSite()
    revalidatePath("/admin/cms/testimonials")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Testimonial delete error:", error)
    return { success: false, error: "Không thể xóa cảm nhận này" }
  }
}
