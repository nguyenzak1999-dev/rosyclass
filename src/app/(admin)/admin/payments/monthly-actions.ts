"use server"

import * as z from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { getErrorMessage } from "@/lib/errors"
import { parseVietnamDateKey, vietnamDayRange } from "@/lib/curriculum"
import { buildMonthlyBillDraft, type MonthlyBillDraft } from "@/lib/monthly-billing"
import { billTotal, formatBillingMonth, isBillingMonth, lineTotal, type BillingLineDraft } from "@/lib/monthly-billing-shared"
import { buildQrPayload, generateReceiptCode } from "@/lib/payment-receipt"

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

/** Hạn đóng mặc định: ngày 5 của tháng thu (giờ VN) */
function defaultDueDate(month: string) {
  return parseVietnamDateKey(`${month}-05`) ?? vietnamDayRange(new Date(), 7).start
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

async function saveMonthlyPayment(
  input: z.infer<typeof monthlyPaymentSchema>,
  actorId: string
): Promise<{ id: string; totalAmount: number }> {
  const draft = await buildMonthlyBillDraft(input.studentId, input.month)
  const lines: BillingLineDraft[] = input.lines.filter((line) => line.quantity > 0)
  if (lines.length === 0) throw new Error("Phiếu thu cần ít nhất một dòng có số lượng > 0")
  const totalAmount = billTotal(lines)
  const dueDate = parseVietnamDateKey(input.dueDate) ?? defaultDueDate(input.month)
  const billingSummary = JSON.stringify(draft.summary)
  const lineRows = lines.map((line) => ({
    description: line.description,
    category: line.category,
    quantity: line.quantity,
    unitAmount: line.unitAmount,
    totalAmount: lineTotal(line),
  }))
  // Chỉ nhận các buổi kèm bù hợp lệ của chính bé (không tin id do trình duyệt gửi)
  const makeUpIds = [...new Set(lines.flatMap((line) => line.makeUpIds ?? []))]

  const student = await prisma.student.findUnique({ where: { id: input.studentId }, select: { code: true, fullName: true } })
  if (!student) throw new Error("Không tìm thấy học viên")

  let paymentId: string
  if (input.paymentId) {
    const existing = await prisma.payment.findUnique({
      where: { id: input.paymentId },
      select: { id: true, studentId: true, billingMonth: true, paidAmount: true, status: true, receiptCode: true },
    })
    if (!existing || existing.studentId !== input.studentId || existing.billingMonth !== input.month) {
      throw new Error("Không tìm thấy phiếu thu tháng cần sửa")
    }
    if (existing.status === "CANCELLED" || existing.status === "REFUNDED") throw new Error("Phiếu đã huỷ/hoàn tiền, không sửa được")
    if (totalAmount < existing.paidAmount) {
      throw new Error(`Tổng mới (${totalAmount.toLocaleString("vi-VN")}đ) nhỏ hơn số đã thu (${existing.paidAmount.toLocaleString("vi-VN")}đ)`)
    }
    const remainingAmount = totalAmount - existing.paidAmount
    const receiptCode = existing.receiptCode || (await generateReceiptCode())

    // D1 không có transaction tương tác: gom các câu ghi vào một batch để chạy cùng lúc.
    // Buổi kèm bù đã trừ vào phiếu này giữ nguyên đánh dấu (dòng nạp lại khi sửa không mang makeUpIds)
    await prisma.$transaction([
      prisma.paymentLineItem.deleteMany({ where: { paymentId: existing.id } }),
      prisma.paymentLineItem.createMany({ data: lineRows.map((row) => ({ ...row, paymentId: existing.id })) }),
      prisma.payment.update({
        where: { id: existing.id },
        data: {
          receiptCode,
          totalAmount,
          remainingAmount,
          status: remainingAmount <= 0 ? "PAID" : existing.paidAmount > 0 ? "PARTIAL" : "UNPAID",
          dueDate,
          note: input.note?.trim() || null,
          billingSummary,
          qrPayload: buildQrPayload(receiptCode, remainingAmount, student),
        },
      }),
    ])
    paymentId = existing.id
  } else {
    if (draft.existingPayment) {
      throw new Error(`Bé đã có phiếu thu tháng ${formatBillingMonth(input.month)} (${draft.existingPayment.receiptCode ?? "chưa có mã"})`)
    }
    const receiptCode = await generateReceiptCode()
    const created = await prisma.payment.create({
      data: {
        receiptCode,
        studentId: input.studentId,
        classId: draft.summary.planned.length === 1 ? draft.summary.planned[0].classId : null,
        totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        status: totalAmount <= 0 ? "PAID" : "UNPAID",
        paymentMethod: "BANK_TRANSFER",
        dueDate,
        billingMonth: input.month,
        billingSummary,
        qrPayload: buildQrPayload(receiptCode, totalAmount, student),
        bankName: process.env.PAYMENT_BANK_NAME || null,
        bankAccountName: process.env.PAYMENT_BANK_ACCOUNT_NAME || null,
        bankAccountNo: process.env.PAYMENT_BANK_ACCOUNT_NO || null,
        note: input.note?.trim() || `Học phí tháng ${formatBillingMonth(input.month)}`,
        createdById: actorId,
        lineItems: { create: lineRows },
      },
      select: { id: true },
    })
    paymentId = created.id
  }

  if (makeUpIds.length > 0) {
    await prisma.makeUpLesson.updateMany({
      where: { id: { in: makeUpIds }, studentId: input.studentId, status: "MISSED", creditedPaymentId: null },
      data: { creditedPaymentId: paymentId },
    })
  }

  return { id: paymentId, totalAmount }
}

export async function saveMonthlyPaymentAction(data: MonthlyPaymentInput): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission(PERMISSIONS.paymentsWrite)
    const parsed = monthlyPaymentSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: firstIssue(parsed.error) }

    const saved = await saveMonthlyPayment(parsed.data, user.id)
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
        await saveMonthlyPayment(
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
