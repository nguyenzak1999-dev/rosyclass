"use server"

import { prisma } from "@/lib/prisma"
import { leadSchema, type LeadFormValues } from "@/lib/schemas/lead"
import { revalidatePath } from "next/cache"

export async function upsertLead(data: LeadFormValues) {
  try {
    const parsedData = leadSchema.parse(data)
    
    if (parsedData.id) {
      await prisma.lead.update({
        where: { id: parsedData.id },
        data: { ...parsedData }
      })
    } else {
      await prisma.lead.create({
        data: { ...parsedData }
      })
    }

    revalidatePath("/admin/leads")
    return { success: true }
  } catch (error: unknown) {
    console.error("Lead upsert error:", error)
    return { success: false, error: (error as any).message || "Có lỗi xảy ra" }
  }
}

export async function deleteLead(id: string) {
  try {
    await prisma.lead.delete({ where: { id } })
    revalidatePath("/admin/leads")
    return { success: true }
  } catch (error: unknown) {
    console.error("Lead delete error:", error)
    return { success: false, error: "Không thể xóa khách hàng này" }
  }
}
