"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { paymentSchema, type PaymentFormValues } from "@/lib/schemas/payment"
import { revalidatePath } from "next/cache"

export async function upsertPayment(data: PaymentFormValues) {
  try {
    await requirePermission(PERMISSIONS.paymentsWrite)
    const parsedData = paymentSchema.parse(data)
    
    // We need a dummy user for createdById since auth is not fully set up in this context
    const firstUser = await prisma.user.findFirst()
    const createdById = firstUser?.id || ""

    const remainingAmount = parsedData.totalAmount - parsedData.paidAmount

    if (parsedData.id) {
      await prisma.payment.update({
        where: { id: parsedData.id },
        data: {
          totalAmount: parsedData.totalAmount,
          paidAmount: parsedData.paidAmount,
          remainingAmount,
          paymentMethod: parsedData.paymentMethod as any,
          status: parsedData.status as any,
          note: parsedData.note,
          studentId: parsedData.studentId,
        }
      })
    } else {
      await prisma.payment.create({
        data: {
          totalAmount: parsedData.totalAmount,
          paidAmount: parsedData.paidAmount,
          remainingAmount,
          paymentMethod: parsedData.paymentMethod as any,
          status: parsedData.status as any,
          note: parsedData.note,
          studentId: parsedData.studentId,
          createdById
        }
      })
    }

    revalidatePath("/admin/payments")
    return { success: true }
  } catch (error: unknown) {
    console.error("Payment upsert error:", error)
    return { success: false, error: (error as any).message || "Có lỗi xảy ra" }
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
