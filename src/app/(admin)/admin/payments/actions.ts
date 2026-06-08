"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { paymentSchema, type PaymentFormValues } from "@/lib/schemas/payment"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/errors"

export async function upsertPayment(data: PaymentFormValues) {
  try {
    const user = await requirePermission(PERMISSIONS.paymentsWrite)
    const parsedData = paymentSchema.parse(data)

    const remainingAmount = parsedData.totalAmount - parsedData.paidAmount

    const payload = {
      totalAmount: parsedData.totalAmount,
      paidAmount: parsedData.paidAmount,
      remainingAmount,
      paymentMethod: parsedData.paymentMethod,
      status: parsedData.status,
      note: parsedData.note,
      studentId: parsedData.studentId,
    }

    if (parsedData.id) {
      await prisma.payment.update({ where: { id: parsedData.id }, data: payload })
    } else {
      await prisma.payment.create({ data: { ...payload, createdById: user.id } })
    }

    revalidatePath("/admin/payments")
    return { success: true }
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
