"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { parentSchema, type ParentFormValues } from "@/lib/schemas/parent"
import { revalidatePath } from "next/cache"

export async function upsertParent(data: ParentFormValues) {
  try {
    await requirePermission(PERMISSIONS.parentsWrite)
    const parsedData = parentSchema.parse(data)
    
    const { studentIds, ...restData } = parsedData
    
    if (parsedData.id) {
      await prisma.parent.update({
        where: { id: parsedData.id },
        data: { 
          ...restData,
          ...(studentIds ? {
            students: {
              set: studentIds.map(id => ({ id }))
            }
          } : {})
        }
      })
    } else {
      await prisma.parent.create({
        data: { 
          ...restData,
          ...(studentIds && studentIds.length > 0 ? {
            students: {
              connect: studentIds.map(id => ({ id }))
            }
          } : {})
        }
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
    await requirePermission(PERMISSIONS.parentsWrite)
    await prisma.parent.delete({ where: { id } })
    revalidatePath("/admin/parents")
    return { success: true }
  } catch (error: unknown) {
    console.error("Parent delete error:", error)
    return { success: false, error: "Không thể xóa phụ huynh này" }
  }
}
