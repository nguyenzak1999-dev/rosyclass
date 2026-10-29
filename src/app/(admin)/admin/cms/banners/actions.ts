"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { isSafeImage, isSafeLink } from "@/lib/page-builder/fields"

const bannerSchema = z.object({
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  image: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập URL hình ảnh")
    .refine(isSafeImage, "Ảnh phải là đường dẫn nội bộ (/...) hoặc http(s)://"),
  buttonText: z.string().optional().nullable(),
  buttonUrl: z
    .string()
    .trim()
    .refine(isSafeLink, "Liên kết phải bắt đầu bằng /, #, http(s)://, mailto: hoặc tel:")
    .optional()
    .nullable(),
  position: z.number({ error: "Vị trí phải là số" }).int("Vị trí phải là số nguyên").default(0),
  isActive: z.boolean().default(true),
})

type BannerInput = z.input<typeof bannerSchema>

// Chuỗi rỗng từ form lưu thành null như các cột tuỳ chọn khác
function toBannerData(input: BannerInput) {
  const result = bannerSchema.safeParse(input)
  if (!result.success) return { error: result.error.issues[0]?.message || "Dữ liệu banner không hợp lệ" } as const
  const data = result.data
  return {
    data: {
      title: data.title?.trim() || null,
      subtitle: data.subtitle?.trim() || null,
      image: data.image,
      buttonText: data.buttonText?.trim() || null,
      buttonUrl: data.buttonUrl || null,
      position: data.position,
      isActive: data.isActive,
    },
  } as const
}

function revalidateBannerPaths() {
  revalidatePath("/admin/cms/banners")
  // Banner hiển thị ở khối Hero của trang chủ
  revalidatePath("/")
}

export async function createBanner(input: BannerInput) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    const parsed = toBannerData(input)
    if ("error" in parsed) return { success: false, error: parsed.error }

    await prisma.banner.create({ data: parsed.data })

    revalidateBannerPaths()
    return { success: true }
  } catch (error) {
    console.error("Banner create error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra" }
  }
}

export async function updateBanner(id: string, input: BannerInput) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    const parsed = toBannerData(input)
    if ("error" in parsed) return { success: false, error: parsed.error }

    await prisma.banner.update({
      where: { id },
      data: parsed.data,
    })

    revalidateBannerPaths()
    return { success: true }
  } catch (error) {
    console.error("Banner update error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra" }
  }
}

export async function deleteBanner(id: string) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    await prisma.banner.delete({
      where: { id }
    })

    revalidateBannerPaths()
    return { success: true }
  } catch (error) {
    console.error("Banner delete error:", error)
    return { success: false, error: "Không thể xóa hero này" }
  }
}
