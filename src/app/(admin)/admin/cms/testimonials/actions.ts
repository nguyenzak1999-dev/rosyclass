"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"

const testimonialSchema = z.object({
  id: z.string().optional(),
  authorName: z.string().min(2, "Tên học viên phải có ít nhất 2 ký tự"),
  authorTitle: z.string().optional().nullable(),
  content: z.string().min(10, "Nội dung cảm nhận phải có ít nhất 10 ký tự"),
  avatar: z.string().optional().nullable(),
  rating: z.coerce.number().min(1).max(5).default(5),
  isPublished: z.boolean().default(false),
})

export type TestimonialFormValues = z.infer<typeof testimonialSchema>

export async function upsertTestimonial(data: TestimonialFormValues) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    const parsed = testimonialSchema.parse(data)

    const payload = {
      authorName: parsed.authorName,
      authorTitle: parsed.authorTitle || null,
      content: parsed.content,
      avatar: parsed.avatar || null,
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
    revalidatePath("/admin/cms/testimonials")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Testimonial delete error:", error)
    return { success: false, error: "Không thể xóa cảm nhận này" }
  }
}
