import "server-only"

import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/get-site-settings"
import { isPrismaUniqueError } from "@/lib/errors"
import { HOME_PAGE_SLUG } from "./constants"
import { buildDefaultHomeDocument } from "./defaults"
import { serializePageDocument } from "./document"

/**
 * Trả về id của Page trang chủ; nếu chưa có thì tạo từ các field trang chủ cũ trong SiteSettings.
 * Trang mới tạo ở trạng thái DRAFT nên website vẫn hiển thị như cũ cho tới khi bấm "Xuất bản".
 * Người gọi phải kiểm tra quyền cms.write trước khi tạo.
 */
export async function getOrCreateHomePageId(options: { create: boolean }): Promise<string | null> {
  const existing = await prisma.page.findUnique({ where: { slug: HOME_PAGE_SLUG }, select: { id: true } })
  if (existing) return existing.id
  if (!options.create) return null

  const settings = await getSiteSettings()
  try {
    const page = await prisma.page.create({
      data: {
        title: "Trang chủ",
        slug: HOME_PAGE_SLUG,
        content: serializePageDocument(buildDefaultHomeDocument(settings)),
        seoTitle: null,
        seoDescription: null,
        status: "DRAFT",
      },
      select: { id: true },
    })
    return page.id
  } catch (error) {
    // Hai request tạo cùng lúc: lấy lại bản đã được tạo
    if (isPrismaUniqueError(error)) {
      const page = await prisma.page.findUnique({ where: { slug: HOME_PAGE_SLUG }, select: { id: true } })
      if (page) return page.id
    }
    throw error
  }
}
