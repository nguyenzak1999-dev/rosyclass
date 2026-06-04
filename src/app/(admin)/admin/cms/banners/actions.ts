"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const bannerSchema = z.object({
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  image: z.string().min(1, "Vui lòng nhập URL hình ảnh"),
  buttonText: z.string().optional().nullable(),
  buttonUrl: z.string().optional().nullable(),
  position: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
})

export async function createBanner(data: z.infer<typeof bannerSchema>) {
  try {
    const validatedData = bannerSchema.parse(data)
    
    await prisma.banner.create({
      data: validatedData
    })
    
    revalidatePath("/admin/cms/banners")
    revalidatePath("/")
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Có lỗi xảy ra" }
  }
}

export async function updateBanner(id: string, data: z.infer<typeof bannerSchema>) {
  try {
    const validatedData = bannerSchema.parse(data)
    
    await prisma.banner.update({
      where: { id },
      data: validatedData
    })
    
    revalidatePath("/admin/cms/banners")
    revalidatePath("/")
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Có lỗi xảy ra" }
  }
}

export async function deleteBanner(id: string) {
  try {
    await prisma.banner.delete({
      where: { id }
    })
    
    revalidatePath("/admin/cms/banners")
    revalidatePath("/")
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Không thể xóa banner này" }
  }
}
