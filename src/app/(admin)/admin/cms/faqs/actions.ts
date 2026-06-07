"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"

const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(5, "Câu hỏi phải có ít nhất 5 ký tự"),
  answer: z.string().min(5, "Câu trả lời phải có ít nhất 5 ký tự"),
  category: z.string().optional().nullable(),
  position: z.coerce.number().default(0),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT", "PUBLISHED"]).default("ACTIVE"),
})

export type FaqFormValues = z.infer<typeof faqSchema>

export async function upsertFaq(data: FaqFormValues) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    const parsed = faqSchema.parse(data)

    const payload = {
      question: parsed.question,
      answer: parsed.answer,
      category: parsed.category || null,
      position: parsed.position,
      status: parsed.status,
    }

    if (parsed.id) {
      await prisma.faq.update({
        where: { id: parsed.id },
        data: payload,
      })
    } else {
      await prisma.faq.create({ data: payload })
    }

    revalidatePath("/admin/cms/faqs")
    revalidatePath("/hoi-dap")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("FAQ upsert error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Không thể lưu FAQ" }
  }
}

export async function deleteFaq(id: string) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    await prisma.faq.delete({ where: { id } })
    revalidatePath("/admin/cms/faqs")
    revalidatePath("/hoi-dap")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("FAQ delete error:", error)
    return { success: false, error: "Không thể xóa FAQ này" }
  }
}
