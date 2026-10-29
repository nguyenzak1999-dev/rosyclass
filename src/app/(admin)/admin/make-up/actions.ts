"use server"

import * as z from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { getErrorMessage } from "@/lib/errors"
import { parseVietnamDateKey } from "@/lib/curriculum"

const updateMakeUpSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "DONE", "MISSED"]).optional(),
  /** "YYYY-MM-DD" theo giờ VN */
  scheduledDate: z.string().optional(),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ phải có dạng HH:mm")
    .optional()
    .nullable(),
  note: z.string().max(500).optional().nullable(),
})

export type UpdateMakeUpInput = z.input<typeof updateMakeUpSchema>

export async function updateMakeUpLesson(data: UpdateMakeUpInput) {
  try {
    await requirePermission(PERMISSIONS.attendanceWrite)
    const parsed = updateMakeUpSchema.safeParse(data)
    if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }

    const existing = await prisma.makeUpLesson.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, studentId: true, creditedPaymentId: true, creditedPayment: { select: { receiptCode: true } } },
    })
    if (!existing) return { success: false as const, error: "Không tìm thấy lịch kèm bù" }

    // Buổi đã trừ tiền vào phiếu thu: đổi trạng thái sẽ làm lệch học phí, phải sửa phiếu trước
    if (existing.creditedPaymentId && parsed.data.status && parsed.data.status !== "MISSED") {
      return {
        success: false as const,
        error: `Buổi này đã được trừ vào phiếu ${existing.creditedPayment?.receiptCode ?? ""}; hãy sửa phiếu thu trước`,
      }
    }

    let scheduledDate: Date | undefined
    if (parsed.data.scheduledDate !== undefined) {
      const date = parseVietnamDateKey(parsed.data.scheduledDate)
      if (!date) return { success: false as const, error: "Ngày kèm bù không hợp lệ" }
      scheduledDate = date
    }

    await prisma.makeUpLesson.update({
      where: { id: existing.id },
      data: {
        status: parsed.data.status,
        scheduledDate,
        startTime: parsed.data.startTime === undefined ? undefined : parsed.data.startTime || null,
        note: parsed.data.note === undefined ? undefined : parsed.data.note?.trim() || null,
      },
    })

    revalidatePath("/admin/make-up")
    revalidatePath(`/admin/students/${existing.studentId}`)
    return { success: true as const }
  } catch (error) {
    console.error("Update make-up lesson error:", error)
    return { success: false as const, error: getErrorMessage(error, "Không cập nhật được lịch kèm bù") }
  }
}
