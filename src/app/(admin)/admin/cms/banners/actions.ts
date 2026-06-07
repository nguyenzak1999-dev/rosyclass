"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const bannerSchema = z.object({
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  image: z.string().min(1, "Vui lòng nhập URL hình ảnh"),
  buttonText: z.string().optional().nullable(),
  buttonUrl: z.string().optional().nullable(),
  position: z.number().default(0),
  isActive: z.boolean().default(true),
})

export async function createBanner(data: z.infer<typeof bannerSchema>) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    const validatedData = bannerSchema.parse(data)
    
    await prisma.banner.create({
      data: validatedData
    })
    
    revalidatePath("/admin/cms/banners")
    revalidatePath("/admin/cms/hero")
    revalidatePath("/")
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra" }
  }
}

export async function updateBanner(id: string, data: z.infer<typeof bannerSchema>) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    const validatedData = bannerSchema.parse(data)
    
    await prisma.banner.update({
      where: { id },
      data: validatedData
    })
    
    revalidatePath("/admin/cms/banners")
    revalidatePath("/admin/cms/hero")
    revalidatePath("/")
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra" }
  }
}

export async function deleteBanner(id: string) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    await prisma.banner.delete({
      where: { id }
    })
    
    revalidatePath("/admin/cms/banners")
    revalidatePath("/admin/cms/hero")
    revalidatePath("/")
    
    return { success: true }
  } catch {
    return { success: false, error: "Không thể xóa hero này" }
  }
}
