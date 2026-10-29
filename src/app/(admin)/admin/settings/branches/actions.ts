"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { branchSchema, type BranchFormValues } from "@/lib/schemas/branch"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/errors"
import { revalidatePublicSite } from "@/lib/public-cache"

export async function upsertBranch(data: BranchFormValues) {
  try {
    await requirePermission(PERMISSIONS.settingsWrite)
    const { id, ...fields } = branchSchema.parse(data)
    const payload = {
      name: fields.name.trim(),
      phone: fields.phone?.trim() || null,
      address: fields.address?.trim() || null,
      isActive: fields.isActive,
    }

    if (id) {
      await prisma.branch.update({ where: { id }, data: payload })
    } else {
      await prisma.branch.create({ data: payload })
    }

    revalidatePublicSite()

    revalidatePath("/admin/settings/branches")
    return { success: true }
  } catch (error: unknown) {
    console.error("Branch upsert error:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteBranch(id: string) {
  try {
    await requirePermission(PERMISSIONS.settingsWrite)
    const branch = await prisma.branch.findUnique({
      where: { id },
      select: { _count: { select: { rooms: true, classes: true } } }
    })
    if (!branch) return { success: false, error: "Không tìm thấy chi nhánh" }
    if (branch._count.rooms > 0 || branch._count.classes > 0) {
      return {
        success: false,
        error: `Chi nhánh đang có ${branch._count.rooms} phòng và ${branch._count.classes} lớp. Hãy bỏ chọn "Đang hoạt động" thay vì xoá.`
      }
    }
    await prisma.branch.delete({ where: { id } })
    revalidatePublicSite()
    revalidatePath("/admin/settings/branches")
    return { success: true }
  } catch (error: unknown) {
    console.error("Branch delete error:", error)
    return { success: false, error: "Không thể xóa chi nhánh này" }
  }
}
