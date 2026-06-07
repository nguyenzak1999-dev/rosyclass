"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"

const placementQuestionSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(2, "Nhóm câu hỏi là bắt buộc"),
  question: z.string().min(5, "Câu hỏi phải có ít nhất 5 ký tự"),
  optionA: z.string().min(1, "Lựa chọn A là bắt buộc"),
  optionB: z.string().min(1, "Lựa chọn B là bắt buộc"),
  optionC: z.string().min(1, "Lựa chọn C là bắt buộc"),
  optionD: z.string().min(1, "Lựa chọn D là bắt buộc"),
  correctIndex: z.coerce.number().min(0).max(3),
  order: z.coerce.number().default(0),
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
  ]).optional().nullable(),
  isPublished: z.boolean().default(false),
})

export type PlacementQuestionFormValues = z.infer<typeof placementQuestionSchema>

export async function upsertPlacementQuestion(data: PlacementQuestionFormValues) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    const parsed = placementQuestionSchema.parse(data)
    const payload = {
      type: parsed.type,
      question: parsed.question,
      options: JSON.stringify([parsed.optionA, parsed.optionB, parsed.optionC, parsed.optionD]),
      correctIndex: parsed.correctIndex,
      order: parsed.order,
      level: parsed.level || null,
      isPublished: parsed.isPublished,
    }

    if (parsed.id) {
      await prisma.placementQuestion.update({
        where: { id: parsed.id },
        data: payload,
      })
    } else {
      await prisma.placementQuestion.create({ data: payload })
    }

    revalidatePath("/admin/cms/placement-questions")
    revalidatePath("/kiem-tra-trinh-do")
    return { success: true }
  } catch (error) {
    console.error("Placement question upsert error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Không thể lưu câu hỏi" }
  }
}

export async function deletePlacementQuestion(id: string) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    await prisma.placementQuestion.delete({ where: { id } })
    revalidatePath("/admin/cms/placement-questions")
    revalidatePath("/kiem-tra-trinh-do")
    return { success: true }
  } catch (error) {
    console.error("Placement question delete error:", error)
    return { success: false, error: "Không thể xóa câu hỏi này" }
  }
}
