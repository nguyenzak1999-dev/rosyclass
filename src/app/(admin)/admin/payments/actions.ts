"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import {
  paymentSchema,
  recordPaymentSchema,
  type PaymentFormValues,
  type RecordPaymentFormValues,
} from "@/lib/schemas/payment"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/errors"
import { notifyAdmins } from "@/app/(admin)/admin/notifications/actions"

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
      courseId: parsedData.courseId ?? null,
    }

    let resultId: string
    if (parsedData.id) {
      await prisma.payment.update({ where: { id: parsedData.id }, data: payload })
      resultId = parsedData.id
    } else {
      const newPayment = await prisma.payment.create({
        data: { ...payload, createdById: user.id },
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
      include: { student: { select: { id: true, fullName: true } } },
    })
    if (!payment) {
      return { success: false, error: "Không tìm thấy payment" }
    }
    if (payment.status === "CANCELLED" || payment.status === "REFUNDED") {
      return {
        success: false,
        error: `Không thể ghi nhận thanh toán cho payment đã ${payment.status === "CANCELLED" ? "huỷ" : "hoàn tiền"}`,
      }
    }

    const newPaidAmount = payment.paidAmount + parsed.amount
    if (newPaidAmount > payment.totalAmount) {
      return {
        success: false,
        error: `Số tiền thanh toán vượt quá tổng (đã trả ${payment.paidAmount.toLocaleString("vi-VN")}đ / tổng ${payment.totalAmount.toLocaleString("vi-VN")}đ)`,
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
    const newNote = payment.note
      ? `${payment.note}\n${historyEntry}`
      : historyEntry

    await prisma.payment.update({
      where: { id: parsed.paymentId },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount,
        status: newStatus,
        paymentMethod: parsed.paymentMethod,
        paymentDate,
        note: newNote,
      },
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
  createdById?: string
) {
  try {
    const actorId = createdById ?? (await requirePermission(PERMISSIONS.paymentsWrite)).id
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        course: { select: { id: true, tuitionFee: true, salePrice: true } },
      },
    })
    if (!cls || !cls.course) return null

    const totalAmount = cls.course.salePrice || cls.course.tuitionFee
    if (totalAmount <= 0) return null

    // Tạo dueDate = now + dueDays
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + dueDays)

    const newPayment = await prisma.payment.create({
      data: {
        studentId,
        classId,
        courseId: cls.course.id,
        totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        status: "UNPAID",
        paymentMethod: "CASH",
        dueDate,
        note: "Tự động tạo khi xếp vào lớp",
        createdById: actorId,
      },
    })

    notifyAdmins(
      "Payment mới",
      `Học viên vừa được tạo payment ${totalAmount.toLocaleString("vi-VN")}đ`,
      `/admin/payments/${newPayment.id}`
    )

    return newPayment
  } catch (error) {
    console.error("Create payment for student error:", error)
    return null
  }
}

/**
 * Đánh dấu payment là REFUNDED (hoàn tiền).
 */
export async function refundPayment(paymentId: string, reason: string) {
  try {
    const user = await requirePermission(PERMISSIONS.paymentsWrite)
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { student: { select: { fullName: true } } },
    })
    if (!payment) return { success: false, error: "Không tìm thấy payment" }
    if (payment.status === "REFUNDED") {
      return { success: false, error: "Payment đã được hoàn tiền" }
    }

    const historyEntry = `[${new Date().toLocaleString("vi-VN")}] ${user.fullName} - HOÀN TIỀN${reason ? `: ${reason}` : ""}`
    const newNote = payment.note
      ? `${payment.note}\n${historyEntry}`
      : historyEntry

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "REFUNDED",
        note: newNote,
      },
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
