"use server"

import { prisma } from "@/lib/prisma"
import { parentSchema, type ParentFormValues } from "@/lib/schemas/parent"
import { revalidatePath } from "next/cache"

export async function upsertParent(data: ParentFormValues) {
  try {
    const parsedData = parentSchema.parse(data)
    
    if (parsedData.id) {
      await prisma.parent.update({
        where: { id: parsedData.id },
        data: { ...parsedData }
      })
    } else {
      await prisma.parent.create({
        data: { ...parsedData }
      })
    }

    revalidatePath("/admin/parents")
    return { success: true }
  } catch (error: unknown) {
    console.error("Parent upsert error:", error)
    return { success: false, error: (error as any).message || "Có lỗi xảy ra" }
  }
}

export async function deleteParent(id: string) {
  try {
    await prisma.parent.delete({ where: { id } })
    revalidatePath("/admin/parents")
    return { success: true }
  } catch (error: unknown) {
    console.error("Parent delete error:", error)
    return { success: false, error: "Không thể xóa phụ huynh này" }
  }
}
