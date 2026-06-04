"use server"

import { prisma } from "@/lib/prisma"
import { branchSchema, type BranchFormValues } from "@/lib/schemas/branch"
import { revalidatePath } from "next/cache"

export async function upsertBranch(data: BranchFormValues) {
  try {
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
    return { success: false, error: (error as any).message || "Có lỗi xảy ra" }
  }
}

export async function deleteBranch(id: string) {
  try {
    await prisma.branch.delete({ where: { id } })
    revalidatePath("/admin/settings/branches")
    return { success: true }
  } catch (error: unknown) {
    console.error("Branch delete error:", error)
    return { success: false, error: "Không thể xóa chi nhánh này" }
  }
}
