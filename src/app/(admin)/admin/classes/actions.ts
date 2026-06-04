"use server"

import { prisma } from "@/lib/prisma"
import { classSchema, type ClassFormValues } from "@/lib/schemas/class"
import { revalidatePath } from "next/cache"

export async function upsertClass(data: ClassFormValues) {
  try {
    const parsedData = classSchema.parse(data)
    
    if (parsedData.id) {
      await prisma.class.update({
        where: { id: parsedData.id },
        data: { ...parsedData }
      })
    } else {
      await prisma.class.create({
        data: { ...parsedData }
      })
    }

    revalidatePath("/admin/classes")
    return { success: true }
  } catch (error: unknown) {
    console.error("Class upsert error:", error)
    return { success: false, error: (error as any).message || "Có lỗi xảy ra" }
  }
}

export async function deleteClass(id: string) {
  try {
    await prisma.class.delete({ where: { id } })
    revalidatePath("/admin/classes")
    return { success: true }
  } catch (error: unknown) {
    console.error("Class delete error:", error)
    return { success: false, error: "Không thể xóa lớp học này" }
  }
}
