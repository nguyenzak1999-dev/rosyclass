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
import { formatVietnam } from "@/lib/curriculum"
import { buildQrPayload, generateReceiptCode } from "@/lib/payment-receipt"
import { buildMonthlyBillDraft, saveMonthlyPaymentRecord } from "@/lib/monthly-billing"
import { billTotal, billingMonthKey, formatBillingMonth } from "@/lib/monthly-billing-shared"

export async function upsertPayment(data: PaymentFormValues) {
  try {
    const user = await requirePermission(PERMISSIONS.paymentsWrite)
    const parsedData = paymentSchema.parse(data)

    // Trạng thái thu tiền tự tính theo paidAmount; Hoàn tiền / Huỷ là lựa chọn tay nên giữ nguyên
    let status = parsedData.status
    if (status !== "REFUNDED" && status !== "CANCELLED") {
      if (parsedData.paidAmount === 0) status = "UNPAID"
      else if (parsedData.paidAmount >= parsedData.totalAmount) status = "PAID"
      else status = "PARTIAL"
    }

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
        select: { receiptCode: true, status: true, classId: true, courseId: true, paymentDate: true }
      })
      if (!existing) return { success: false, error: "Không tìm thấy phiếu thu" }
      const receiptCode = existing.receiptCode || await generateReceiptCode()
      const qrPayload = buildQrPayload(receiptCode, parsedData.totalAmount, student)

      await prisma.payment.update({ 
        where: { id: parsedData.id }, 
        data: {
          ...payload,
          // Form sửa không gửi lớp/khoá: giữ nguyên thay vì xoá (báo cáo doanh thu theo lớp/khoá cần chúng)
          classId: parsedData.classId ?? existing.classId ?? null,
          courseId: parsedData.courseId ?? existing.courseId ?? null,
          // Form không có ô ngày thu: giữ ngày cũ, nếu chưa có mà đã thu tiền thì lấy hôm nay (báo cáo doanh thu lọc theo ngày thu)
          paymentDate: parsedData.paymentDate ?? existing.paymentDate ?? (parsedData.paidAmount > 0 ? new Date() : null),
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
        data: {
          ...payload,
          paymentDate: payload.paymentDate ?? (parsedData.paidAmount > 0 ? new Date() : null),
          receiptCode,
          qrPayload,
          createdById: user.id
        }
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
    const historyEntry = `[${formatVietnam(new Date(), "HH:mm:ss dd/MM/yyyy")}] ${user.fullName} - ${parsed.amount.toLocaleString("vi-VN")}đ (${parsed.paymentMethod})${parsed.note ? ` - ${parsed.note}` : ""}`
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
        sessionFee: true,
        course: {
          select: {
            id: true,
            name: true,
            totalSessions: true,
            tuitionFee: true,
            salePrice: true,
            sessionFee: true
          }
        }
      }
    })
    if (!cls || !cls.course) return null

    // Lớp thu học phí theo tháng (có đơn giá/buổi): không thu cả khoá, mà lập phiếu tháng hiện tại (thu trước),
    // chỉ tính các buổi từ ngày vào lớp. Các tháng sau lập theo đợt thu hằng tháng.
    if ((cls.sessionFee ?? cls.course.sessionFee ?? 0) > 0) {
      await prisma.classStudent.upsert({
        where: { classId_studentId: { classId, studentId } },
        update: { status: "ACTIVE" },
        create: { studentId, classId, status: "ACTIVE" }
      })
      await prisma.student.update({ where: { id: studentId }, data: { status: "ACTIVE" } })
      if (!createPayment) return null

      const month = billingMonthKey(new Date())
      const draft = await buildMonthlyBillDraft(studentId, month)
      // Bé đã có phiếu tháng này (đang học lớp khác): kế toán mở phiếu đó, bấm sửa để thêm lớp mới
      if (draft.existingPayment) {
        notifyAdmins(
          "Cần cập nhật phiếu thu tháng",
          `Học viên vừa vào lớp ${cls.name} nhưng đã có phiếu tháng ${formatBillingMonth(month)}: mở phiếu và bấm "Sửa phiếu" để thêm lớp mới`,
          `/admin/payments/${draft.existingPayment.id}`
        )
        return null
      }
      if (billTotal(draft.lines) <= 0) return null

      const saved = await saveMonthlyPaymentRecord({ studentId, month, lines: draft.lines }, actorId)
      notifyAdmins(
        "Phiếu thu tháng mới",
        `Học viên vào lớp ${cls.name}: đã lập phiếu tháng ${formatBillingMonth(month)} ${saved.totalAmount.toLocaleString("vi-VN")}đ`,
        `/admin/payments/${saved.id}`
      )
      return saved
    }

    const totalAmount = cls.tuitionFee ?? (cls.course.salePrice || cls.course.tuitionFee)
    const sessionCount = cls.course.totalSessions || 1
    const receiptCode = await generateReceiptCode()
    let newPayment: { id: string; totalAmount: number } | null = null

    // Tạo dueDate = now + dueDays
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + dueDays)

    // D1 không hỗ trợ transaction tương tác (adapter chạy từng câu riêng, không rollback) nên ghi tuần tự.
    // Người gọi (addStudentToClass) có thể đã tạo bản ghi lớp–học viên trước: dùng upsert để không lỗi trùng khoá
    // (trước đây lỗi này làm hàm trả về null dù phiếu thu đã được tạo, và học viên không được chuyển sang ACTIVE)
    if (createPayment && totalAmount > 0) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { code: true, fullName: true }
      })
      newPayment = await prisma.payment.create({
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
        },
        select: { id: true, totalAmount: true }
      })
    }

    await prisma.classStudent.upsert({
      where: { classId_studentId: { classId, studentId } },
      update: { status: "ACTIVE" },
      create: { studentId, classId, status: "ACTIVE" }
    })

    await prisma.student.update({
      where: { id: studentId },
      data: { status: "ACTIVE" }
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
    if (payment.status === "CANCELLED" || payment.paidAmount <= 0) {
      return { success: false, error: "Phiếu chưa thu tiền hoặc đã huỷ nên không thể hoàn tiền" }
    }

    const historyEntry = `[${formatVietnam(new Date(), "HH:mm:ss dd/MM/yyyy")}] ${user.fullName} - HOÀN TIỀN${reason ? `: ${reason}` : ""}`
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
