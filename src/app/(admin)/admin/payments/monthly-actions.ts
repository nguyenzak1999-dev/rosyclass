"use server"

import * as z from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { getErrorMessage } from "@/lib/errors"
import { buildMonthlyBillDraft, saveMonthlyPaymentRecord, type MonthlyBillDraft } from "@/lib/monthly-billing"
import { isBillingMonth } from "@/lib/monthly-billing-shared"

const lineSchema = z.object({
  description: z.string().trim().min(1, "Mỗi dòng cần có nội dung").max(300),
  category: z.enum(["TUITION", "MATERIAL", "TEST", "MAKE_UP", "DISCOUNT", "OTHER"]),
  quantity: z.coerce.number().int("Số lượng phải là số nguyên").min(0, "Số lượng không được âm").max(100),
  unitAmount: z.coerce.number().min(-100_000_000).max(100_000_000),
  makeUpIds: z.array(z.string()).max(50).optional(),
})

const monthlyPaymentSchema = z.object({
  studentId: z.string().min(1),
  month: z.string().refine(isBillingMonth, "Tháng thu không hợp lệ"),
  lines: z.array(lineSchema).min(1, "Phiếu thu cần ít nhất một dòng").max(40),
  dueDate: z.string().optional().nullable(),
  note: z.string().max(1000).optional().nullable(),
  paymentId: z.string().optional().nullable(),
})

export type MonthlyPaymentInput = z.input<typeof monthlyPaymentSchema>

type ActionResult<T = undefined> = { success: true; data: T } | { success: false; error: string }

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Dữ liệu không hợp lệ"
}

export async function getMonthlyBillDraft(studentId: string, month: string): Promise<ActionResult<MonthlyBillDraft>> {
  try {
    await requirePermission(PERMISSIONS.paymentsWrite)
    if (!isBillingMonth(month)) return { success: false, error: "Tháng thu không hợp lệ" }
    return { success: true, data: await buildMonthlyBillDraft(studentId, month) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error, "Không tính được phiếu thu tháng") }
  }
}

export async function saveMonthlyPaymentAction(data: MonthlyPaymentInput): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission(PERMISSIONS.paymentsWrite)
    const parsed = monthlyPaymentSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: firstIssue(parsed.error) }

    const saved = await saveMonthlyPaymentRecord(parsed.data, user.id)
    revalidatePath("/admin/payments")
    revalidatePath(`/admin/payments/${saved.id}`)
    revalidatePath(`/admin/students/${parsed.data.studentId}`)
    return { success: true, data: { id: saved.id } }
  } catch (error) {
    console.error("Save monthly payment error:", error)
    return { success: false, error: getErrorMessage(error, "Không lưu được phiếu thu tháng") }
  }
}

const classBillingSchema = z.object({
  classId: z.string().min(1, "Chọn lớp"),
  month: z.string().refine(isBillingMonth, "Tháng thu không hợp lệ"),
  /** Dòng thêm cho mọi bé trong lớp (học liệu, sách bổ trợ…) */
  extraLines: z.array(lineSchema).max(10).default([]),
  dueDate: z.string().optional().nullable(),
})

export type ClassBillingInput = z.input<typeof classBillingSchema>

/** Lập phiếu thu tháng cho mọi bé đang học trong lớp; bé đã có phiếu tháng đó thì bỏ qua */
export async function createClassMonthlyPayments(
  data: ClassBillingInput
): Promise<ActionResult<{ created: number; skipped: string[]; failed: string[] }>> {
  try {
    const user = await requirePermission(PERMISSIONS.paymentsWrite)
    const parsed = classBillingSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: firstIssue(parsed.error) }

    const members = await prisma.classStudent.findMany({
      where: { classId: parsed.data.classId, status: "ACTIVE" },
      select: { student: { select: { id: true, fullName: true } } },
      orderBy: { student: { fullName: "asc" } },
    })
    if (members.length === 0) return { success: false, error: "Lớp chưa có học viên đang học" }

    let created = 0
    const skipped: string[] = []
    const failed: string[] = []
    // Lần lượt từng bé: mỗi phiếu vài câu truy vấn, chạy song song dễ chạm giới hạn của D1
    for (const { student } of members) {
      try {
        const draft = await buildMonthlyBillDraft(student.id, parsed.data.month)
        if (draft.existingPayment) {
          skipped.push(student.fullName)
          continue
        }
        await saveMonthlyPaymentRecord(
          {
            studentId: student.id,
            month: parsed.data.month,
            lines: [...draft.lines, ...parsed.data.extraLines],
            dueDate: parsed.data.dueDate,
            note: null,
            paymentId: null,
          },
          user.id
        )
        created += 1
      } catch (error) {
        console.error(`Monthly payment for ${student.id} failed:`, error)
        failed.push(student.fullName)
      }
    }

    revalidatePath("/admin/payments")
    return { success: true, data: { created, skipped, failed } }
  } catch (error) {
    return { success: false, error: getErrorMessage(error, "Không lập được phiếu thu cho lớp") }
  }
}
