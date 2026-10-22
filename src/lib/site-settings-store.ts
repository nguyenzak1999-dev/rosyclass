import "server-only"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { SITE_SETTINGS_SLUG, type SiteSettings } from "@/lib/site-settings"

/**
 * Ghi một phần cài đặt website, giữ nguyên các trường khác.
 * Đọc thẳng từ DB (không dùng getSiteSettings vì hàm đó trả về giá trị mặc định khi lỗi
 * hoặc quá giờ, ghi lại sẽ xoá logo, liên hệ, tài khoản ngân hàng...). Đọc lỗi thì không ghi.
 */
export async function updateStoredSiteSettings(patch: Partial<SiteSettings>) {
  const existing = await prisma.page.findUnique({ where: { slug: SITE_SETTINGS_SLUG }, select: { content: true } })
  const stored: Partial<SiteSettings> = existing?.content ? JSON.parse(existing.content) : {}
  const content = JSON.stringify({ ...stored, ...patch })

  await prisma.page.upsert({
    where: { slug: SITE_SETTINGS_SLUG },
    update: { content, status: "ACTIVE" },
    create: { title: "Cài đặt website", slug: SITE_SETTINGS_SLUG, content, status: "ACTIVE" },
  })

  // Footer, liên hệ, SEO nằm ở layout nên phải làm mới mọi trang, không chỉ trang chủ
  revalidatePath("/", "layout")
}
