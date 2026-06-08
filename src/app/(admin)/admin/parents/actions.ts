"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { parentSchema, type ParentFormValues } from "@/lib/schemas/parent"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/errors"

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
    return { success: false, error: getErrorMessage(error) }
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

/**
 * Liên kết 1 học viên với phụ huynh (ghi đè nếu HV đã có PH khác).
 */
export async function linkStudentToParent(parentId: string, studentId: string) {
  try {
    await requirePermission(PERMISSIONS.parentsWrite)

    // Validate
    const [parent, student] = await Promise.all([
      prisma.parent.findUnique({ where: { id: parentId }, select: { id: true, fullName: true } }),
      prisma.student.findUnique({ where: { id: studentId }, select: { id: true, fullName: true, parentId: true } }),
    ])
    if (!parent) return { success: false, error: "Không tìm thấy phụ huynh" }
    if (!student) return { success: false, error: "Không tìm thấy học viên" }
    if (student.parentId === parentId) {
      return { success: false, error: "Học viên đã liên kết với phụ huynh này" }
    }

    // Ghi đè parentId của HV
    await prisma.student.update({
      where: { id: studentId },
      data: { parentId: parentId },
    })

    revalidatePath(`/admin/parents/${parentId}`)
    revalidatePath(`/admin/students/${studentId}`)
    revalidatePath("/admin/parents")
    return { success: true }
  } catch (error) {
    console.error("Link student to parent error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể liên kết") }
  }
}

/**
 * Hủy liên kết HV với PH (set parentId = null).
 */
export async function unlinkStudentFromParent(parentId: string, studentId: string) {
  try {
    await requirePermission(PERMISSIONS.parentsWrite)

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, parentId: true },
    })
    if (!student) return { success: false, error: "Không tìm thấy học viên" }
    if (student.parentId !== parentId) {
      return { success: false, error: "Học viên không thuộc phụ huynh này" }
    }

    await prisma.student.update({
      where: { id: studentId },
      data: { parentId: null },
    })

    revalidatePath(`/admin/parents/${parentId}`)
    revalidatePath(`/admin/students/${studentId}`)
    revalidatePath("/admin/parents")
    return { success: true }
  } catch (error) {
    console.error("Unlink student from parent error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể hủy liên kết") }
  }
}
