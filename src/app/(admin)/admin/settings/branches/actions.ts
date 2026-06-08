"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { branchSchema, type BranchFormValues } from "@/lib/schemas/branch"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/errors"

export async function upsertBranch(data: BranchFormValues) {
  try {
    await requirePermission(PERMISSIONS.settingsWrite)
    const parsedData = branchSchema.parse(data)

    if (parsedData.id) {
      await prisma.branch.update({
        where: { id: parsedData.id },
        data: { ...parsedData }
      })
    } else {
      await prisma.branch.create({
        data: { ...parsedData }
      })
    }

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
    await prisma.branch.delete({ where: { id } })
    revalidatePath("/admin/settings/branches")
    return { success: true }
  } catch (error: unknown) {
    console.error("Branch delete error:", error)
    return { success: false, error: "Không thể xóa chi nhánh này" }
  }
}
