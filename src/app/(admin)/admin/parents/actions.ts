"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { parentSchema, type ParentFormValues } from "@/lib/schemas/parent"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/errors"
import { getSiteUrl } from "@/lib/seo"
import { generateParentToken, hashParentToken } from "@/lib/auth/parent-session"
import { createParentLinkSchema, type CreateParentLinkValues } from "@/lib/schemas/homework"

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

// ------------------------------------------------------
// Link đăng nhập cổng phụ huynh
// ------------------------------------------------------

/**
 * Tạo link đăng nhập cho phụ huynh. Token chỉ trả về một lần ở đây;
 * DB chỉ giữ SHA-256 nên không xem lại được link cũ (mất thì tạo link mới).
 */
export async function createParentAccessLink(data: CreateParentLinkValues) {
  try {
    const user = await requirePermission(PERMISSIONS.parentsWrite)
    const parsed = createParentLinkSchema.parse(data)

    const parent = await prisma.parent.findUnique({ where: { id: parsed.parentId }, select: { id: true } })
    if (!parent) return { success: false, error: "Không tìm thấy phụ huynh" }

    const token = generateParentToken()
    const expiresAt = parsed.validDays > 0 ? new Date(Date.now() + parsed.validDays * 24 * 60 * 60 * 1000) : null
    await prisma.parentAccessToken.create({
      data: {
        parentId: parent.id,
        tokenHash: await hashParentToken(token),
        label: parsed.label,
        expiresAt,
        createdById: user.id,
      },
    })

    revalidatePath(`/admin/parents/${parent.id}`)
    return {
      success: true,
      data: { url: `${getSiteUrl()}/phu-huynh/dang-nhap?t=${token}`, expiresAt: expiresAt?.toISOString() ?? null },
    }
  } catch (error) {
    console.error("Create parent access link error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể tạo link") }
  }
}

/** Thu hồi link: phụ huynh đang mở cổng bằng link này bị đăng xuất ngay ở lượt tải trang kế tiếp */
export async function revokeParentAccessLink(tokenId: string) {
  try {
    await requirePermission(PERMISSIONS.parentsWrite)
    const token = await prisma.parentAccessToken.findUnique({ where: { id: tokenId }, select: { id: true, parentId: true, revokedAt: true } })
    if (!token) return { success: false, error: "Không tìm thấy link" }
    if (!token.revokedAt) {
      await prisma.parentAccessToken.update({ where: { id: token.id }, data: { revokedAt: new Date() } })
    }
    revalidatePath(`/admin/parents/${token.parentId}`)
    return { success: true }
  } catch (error) {
    console.error("Revoke parent access link error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể thu hồi link") }
  }
}
