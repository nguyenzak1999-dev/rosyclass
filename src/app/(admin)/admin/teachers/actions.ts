"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { teacherSchema, type TeacherFormValues } from "@/lib/schemas/teacher"
import { revalidatePath } from "next/cache"
import { getErrorMessage, isPrismaUniqueError } from "@/lib/errors"
import type { Prisma } from "@/generated/prisma/client"

// Vai trò quản trị: chỉ SUPER_ADMIN được gán hoặc chỉnh tài khoản mang các vai trò này
const PRIVILEGED_ROLES = ["SUPER_ADMIN", "ADMIN"]

/** Chặn leo thang đặc quyền: trả về thông báo lỗi nếu người thao tác không được đụng tới tài khoản này */
async function privilegeError(actor: { id: string; roleCode: string }, targetUserId: string | undefined, nextRoleCode?: string) {
  const actorIsSuper = actor.roleCode === "SUPER_ADMIN"
  if (nextRoleCode && PRIVILEGED_ROLES.includes(nextRoleCode) && !actorIsSuper) {
    return "Chỉ Super Admin mới gán được vai trò quản trị"
  }
  if (!targetUserId) return null

  const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, role: { select: { code: true } } } })
  if (!target) return null
  if (PRIVILEGED_ROLES.includes(target.role.code) && !actorIsSuper) {
    return "Chỉ Super Admin mới chỉnh được tài khoản quản trị"
  }
  if (target.id === actor.id && nextRoleCode && nextRoleCode !== target.role.code) {
    return "Không thể tự đổi vai trò của chính mình"
  }
  return null
}

export async function upsertTeacher(data: TeacherFormValues) {
  try {
    const actor = await requirePermission(PERMISSIONS.teachersWrite)
    const parsedData = teacherSchema.parse(data)

    const denied = await privilegeError(actor, parsedData.id, parsedData.roleCode)
    if (denied) return { success: false, error: denied }

    // Find role
    const role = await prisma.role.findUnique({
      where: { code: parsedData.roleCode }
    })

    if (!role) {
      return { success: false, error: "Không tìm thấy quyền này trong hệ thống" }
    }

    if (parsedData.id) {
      // Update
      const user = await prisma.user.update({
        where: { id: parsedData.id },
        data: {
          fullName: parsedData.fullName,
          email: parsedData.email,
          phone: parsedData.phone,
          status: parsedData.status,
          roleId: role.id,
          avatar: parsedData.avatar
        }
      })

      if (parsedData.roleCode === "TEACHER") {
        const teacherPayload: Prisma.TeacherUncheckedCreateInput = {
          userId: user.id,
          fullName: parsedData.fullName,
          phone: parsedData.phone || "",
          email: parsedData.email,
          avatar: parsedData.avatar,
          bio: parsedData.bio,
          specialties: parsedData.specialties,
          certificates: parsedData.certificates,
          status: parsedData.status,
          showOnHomepage: parsedData.showOnHomepage ?? false,
          hourlyRate: parsedData.hourlyRate ?? 0,
        }
        await prisma.teacher.upsert({
          where: { userId: user.id },
          update: teacherPayload,
          create: teacherPayload,
        })
      }
    } else {
      // Create
      const user = await prisma.user.create({
        data: {
          fullName: parsedData.fullName,
          email: parsedData.email,
          phone: parsedData.phone,
          status: parsedData.status,
          roleId: role.id,
          avatar: parsedData.avatar,
          passwordHash: "dummy_hash_for_now"
        }
      })

      if (parsedData.roleCode === "TEACHER") {
        await prisma.teacher.create({
          data: {
            userId: user.id,
            fullName: parsedData.fullName,
            phone: parsedData.phone || "",
            email: parsedData.email,
            avatar: parsedData.avatar,
            bio: parsedData.bio,
            specialties: parsedData.specialties,
            certificates: parsedData.certificates,
            status: parsedData.status,
            showOnHomepage: parsedData.showOnHomepage ?? false,
            hourlyRate: parsedData.hourlyRate ?? 0,
          }
        })
      }
    }

    revalidatePath("/admin/teachers")
    return { success: true }
  } catch (error: unknown) {
    console.error("Teacher upsert error:", error)
    if (isPrismaUniqueError(error)) {
      return { success: false, error: "Email này đã được sử dụng" }
    }
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteTeacher(userId: string) {
  try {
    const actor = await requirePermission(PERMISSIONS.teachersWrite)
    if (userId === actor.id) return { success: false, error: "Không thể tự xoá tài khoản của chính mình" }
    const denied = await privilegeError(actor, userId)
    if (denied) return { success: false, error: denied }

    // Delete Teacher profile first if exists
    const teacher = await prisma.teacher.findUnique({
      where: { userId }
    })
    if (teacher) {
      await prisma.teacher.delete({
        where: { id: teacher.id }
      })
    }

    // Then delete User
    await prisma.user.delete({
      where: { id: userId }
    })

    revalidatePath("/admin/teachers")
    return { success: true }
  } catch (error: unknown) {
    console.error("Teacher delete error:", error)
    return { success: false, error: "Không thể xóa nhân sự này do có dữ liệu liên kết" }
  }
}
