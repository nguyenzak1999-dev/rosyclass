"use server"

import { prisma } from "@/lib/prisma"
import { AuthorizationError, hasPermission, PERMISSIONS, requireAdminUser, requirePermission } from "@/lib/auth/permissions"
import {
  paymentSchema,
  recordPaymentSchema,
  type PaymentFormValues,
  type RecordPaymentFormValues
} from "@/lib/schemas/payment"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/errors"
import { notifyAdmins } from "@/lib/admin-notifications"

function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase();
}

export async function upsertPayment(data: PaymentFormValues) {
  try {
    const user = await requirePermission(PERMISSIONS.paymentsWrite)
    const parsedData = paymentSchema.parse(data)

    // Auto-compute status nếu không khớp với paidAmount
    let status = parsedData.status
    if (parsedData.paidAmount === 0) status = "UNPAID"
    else if (parsedData.paidAmount >= parsedData.totalAmount) status = "PAID"
    else status = "PARTIAL"

    const remainingAmount = Math.max(0, parsedData.totalAmount - parsedData.paidAmount)

    const payload = {
      totalAmount: parsedData.totalAmount,
      paidAmount: parsedData.paidAmount,
      remainingAmount,
      paymentMethod: parsedData.paymentMethod,
      status,
      paymentDate: parsedData.paymentDate ?? null,
      dueDate: parsedData.dueDate ?? null,
      note: parsedData.note,
      studentId: parsedData.studentId,
      classId: parsedData.classId ?? null,
      courseId: parsedData.courseId ?? null
    }

    let resultId: string
    if (parsedData.id) {
      const student = await prisma.student.findUnique({
        where: { id: parsedData.studentId },
        select: { code: true, fullName: true }
      })
      const existing = await prisma.payment.findUnique({
        where: { id: parsedData.id },
        select: { receiptCode: true, status: true, classId: true, courseId: true }
      })
      const receiptCode = existing?.receiptCode || await generateReceiptCode()
      const qrPayload = buildQrPayload(receiptCode, parsedData.totalAmount, student)

      await prisma.payment.update({ 
        where: { id: parsedData.id }, 
        data: {
          ...payload,
          // Form sửa không gửi lớp/khoá: giữ nguyên thay vì xoá (báo cáo doanh thu theo lớp/khoá cần chúng)
          classId: parsedData.classId ?? existing?.classId ?? null,
          courseId: parsedData.courseId ?? existing?.courseId ?? null,
          // Phiếu đã hoàn tiền / đã huỷ không tự quay lại thành đã thu khi sửa ghi chú hay số tiền
          status: existing && ["REFUNDED", "CANCELLED"].includes(existing.status) ? existing.status : payload.status,
          qrPayload
        } 
      })
      resultId = parsedData.id
    } else {
      const receiptCode = await generateReceiptCode()
      const student = await prisma.student.findUnique({
        where: { id: parsedData.studentId },
        select: { code: true, fullName: true }
      })
      const qrPayload = buildQrPayload(receiptCode, parsedData.totalAmount, student)

      const newPayment = await prisma.payment.create({
        data: { ...payload, receiptCode, qrPayload, createdById: user.id }
      })
      resultId = newPayment.id
    }

    revalidatePath("/admin/payments")
    revalidatePath(`/admin/payments/${resultId}`)
    return { success: true, data: { id: resultId } }
  } catch (error: unknown) {
    console.error("Payment upsert error:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deletePayment(id: string) {
  try {
    await requirePermission(PERMISSIONS.paymentsWrite)
    await prisma.payment.delete({ where: { id } })
    revalidatePath("/admin/payments")
    return { success: true }
  } catch (error: unknown) {
    console.error("Payment delete error:", error)
    return { success: false, error: "Không thể xóa thanh toán này" }
  }
}

/**
 * Ghi nhận 1 khoản thanh toán (partial hoặc full).
 * - Tự động cộng dồn paidAmount
 * - Tự động update status: PAID nếu đủ, PARTIAL nếu 1 phần, UNPAID nếu 0
 * - Append vào note lịch sử
 * - Notify admin
 */
export async function recordPayment(data: RecordPaymentFormValues) {
  try {
    const user = await requirePermission(PERMISSIONS.paymentsWrite)
    const parsed = recordPaymentSchema.parse(data)

    const payment = await prisma.payment.findUnique({
      where: { id: parsed.paymentId },
      include: { student: { select: { id: true, fullName: true } } }
    })
    if (!payment) {
      return { success: false, error: "Không tìm thấy payment" }
    }
    if (payment.status === "CANCELLED" || payment.status === "REFUNDED") {
      return {
        success: false,
        error: `Không thể ghi nhận thanh toán cho payment đã ${payment.status === "CANCELLED" ? "huỷ" : "hoàn tiền"}`
      }
    }

    const newPaidAmount = payment.paidAmount + parsed.amount
    if (newPaidAmount > payment.totalAmount) {
      return {
        success: false,
        error: `Số tiền thanh toán vượt quá tổng (đã trả ${payment.paidAmount.toLocaleString("vi-VN")}đ / tổng ${payment.totalAmount.toLocaleString("vi-VN")}đ)`
      }
    }

    // Auto-update status
    let newStatus: "UNPAID" | "PARTIAL" | "PAID"
    if (newPaidAmount === 0) newStatus = "UNPAID"
    else if (newPaidAmount >= payment.totalAmount) newStatus = "PAID"
    else newStatus = "PARTIAL"

    const remainingAmount = Math.max(0, payment.totalAmount - newPaidAmount)
    const paymentDate = parsed.paymentDate || new Date()

    // Build note lịch sử
    const historyEntry = `[${new Date().toLocaleString("vi-VN")}] ${user.fullName} - ${parsed.amount.toLocaleString("vi-VN")}đ (${parsed.paymentMethod})${parsed.note ? ` - ${parsed.note}` : ""}`
    const newNote = payment.note ? `${payment.note}\n${historyEntry}` : historyEntry

    await prisma.payment.update({
      where: { id: parsed.paymentId },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount,
        status: newStatus,
        paymentMethod: parsed.paymentMethod,
        paymentDate,
        note: newNote
      }
    })

    // Notify admin nếu PAID xong
    if (newStatus === "PAID") {
      notifyAdmins(
        "Thanh toán hoàn tất",
        `${payment.student.fullName} đã thanh toán đủ ${payment.totalAmount.toLocaleString("vi-VN")}đ`,
        `/admin/payments/${parsed.paymentId}`
      )
    }

    revalidatePath(`/admin/payments/${parsed.paymentId}`)
    revalidatePath("/admin/payments")
    revalidatePath("/admin/students")
    return { success: true, data: { newPaidAmount, remainingAmount, status: newStatus } }
  } catch (error) {
    console.error("Record payment error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể ghi nhận thanh toán") }
  }
}

/**
 * Tạo payment cho HV khi xếp vào lớp (auto-generate totalAmount = course.salePrice || course.tuitionFee).
 * Thường được gọi từ action addStudentToClass.
 */
export async function createPaymentForStudent(
  studentId: string,
  classId: string,
  dueDays: number = 14,
  createdById?: string,
  createPayment: boolean = true
): Promise<{ id: string; totalAmount: number } | null> {
  try {
    // Luôn xác thực người gọi; createdById từ client không được dùng để bỏ qua kiểm tra quyền
    const actor = await requireAdminUser()
    if (!hasPermission(actor, PERMISSIONS.classesWrite) && !hasPermission(actor, PERMISSIONS.paymentsWrite)) {
      throw new AuthorizationError()
    }
    const actorId = actor.id
    void createdById
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        name: true,
        tuitionFee: true,
        course: {
          select: {
            id: true,
            name: true,
            totalSessions: true,
            tuitionFee: true,
            salePrice: true
          }
        }
      }
    })
    if (!cls || !cls.course) return null

    const totalAmount = cls.tuitionFee ?? (cls.course.salePrice || cls.course.tuitionFee)
    const sessionCount = cls.course.totalSessions || 1
    const receiptCode = await generateReceiptCode()
    let newPayment: { id: string; totalAmount: number } | null = null

    // Tạo dueDate = now + dueDays
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + dueDays)

    await prisma.$transaction(async (tx) => {
      if (createPayment && totalAmount > 0) {
        const student = await tx.student.findUnique({
          where: { id: studentId },
          select: { code: true, fullName: true }
        })
        newPayment = await tx.payment.create({
          data: {
            receiptCode,
            studentId,
            classId,
            courseId: cls.course.id,
            totalAmount,
            paidAmount: 0,
            remainingAmount: totalAmount,
            status: "UNPAID",
            paymentMethod: "BANK_TRANSFER",
            dueDate,
            qrPayload: buildQrPayload(receiptCode, totalAmount, student),
            bankName: process.env.PAYMENT_BANK_NAME || null,
            bankAccountName: process.env.PAYMENT_BANK_ACCOUNT_NAME || null,
            bankAccountNo: process.env.PAYMENT_BANK_ACCOUNT_NO || null,
            note: "Tự động tạo khi xếp vào lớp",
            createdById: actorId,
            lineItems: {
              create: {
                description: `${cls.course.name} (${sessionCount} buổi)`,
                category: "TUITION",
                quantity: 1,
                unitAmount: totalAmount,
                totalAmount,
              }
            }
          }
        })
      }

      await tx.classStudent.create({
        data: {
          studentId,
          classId,
          status: "ACTIVE"
        }
      })

      await tx.student.update({
        where: { id: studentId },
        data: { status: "ACTIVE" }
      })
    })

    const paymentForNotification = newPayment as { id: string; totalAmount: number } | null
    if (paymentForNotification) {
      notifyAdmins(
        "Payment mới",
        `Học viên vừa được tạo payment ${totalAmount.toLocaleString("vi-VN")}đ`,
        `/admin/payments/${paymentForNotification.id}`
      )
    }

    return paymentForNotification
  } catch (error) {
    console.error("Create payment for student error:", error)
    return null
  }
}

async function generateReceiptCode() {
  const today = new Date()
  const yyyymmdd = today.toISOString().slice(0, 10).replaceAll("-", "")

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
    const receiptCode = `PT-${yyyymmdd}-${suffix}`
    const existing = await prisma.payment.findUnique({ where: { receiptCode } })
    if (!existing) return receiptCode
  }

  return `PT-${yyyymmdd}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

function buildQrPayload(
  receiptCode: string,
  amount: number,
  student?: { code?: string | null; fullName?: string | null } | null
) {
  const bankCode = process.env.VIETQR_BANK_CODE
  const accountNo = process.env.PAYMENT_BANK_ACCOUNT_NO
  const accountName = process.env.PAYMENT_BANK_ACCOUNT_NAME

  let addInfo = `ROSY ${receiptCode}`
  if (student && student.code) {
    const cleanName = student.fullName ? removeDiacritics(student.fullName) : ""
    addInfo = `ROSY ${student.code} ${cleanName}`.trim()
  }

  if (!bankCode || !accountNo) {
    return addInfo
  }

  const params = new URLSearchParams({
    amount: String(Math.round(amount)),
    addInfo
  })
  if (accountName) {
    params.set("accountName", accountName)
  }

  return `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png?${params.toString()}`
}

/**
 * Đánh dấu payment là REFUNDED (hoàn tiền).
 */
export async function refundPayment(paymentId: string, reason: string) {
  try {
    const user = await requirePermission(PERMISSIONS.paymentsWrite)
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { student: { select: { fullName: true } } }
    })
    if (!payment) return { success: false, error: "Không tìm thấy payment" }
    if (payment.status === "REFUNDED") {
      return { success: false, error: "Payment đã được hoàn tiền" }
    }

    const historyEntry = `[${new Date().toLocaleString("vi-VN")}] ${user.fullName} - HOÀN TIỀN${reason ? `: ${reason}` : ""}`
    const newNote = payment.note ? `${payment.note}\n${historyEntry}` : historyEntry

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "REFUNDED",
        note: newNote
      }
    })

    notifyAdmins(
      "Hoàn tiền",
      `Payment của ${payment.student.fullName} đã được hoàn tiền`,
      `/admin/payments/${paymentId}`
    )

    revalidatePath(`/admin/payments/${paymentId}`)
    revalidatePath("/admin/payments")
    return { success: true }
  } catch (error) {
    console.error("Refund payment error:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}
