import { prisma } from "@/lib/prisma"
import { DEFAULT_SITE_SETTINGS, SITE_SETTINGS_SLUG, type SiteSettings } from "./site-settings"

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: SITE_SETTINGS_SLUG }
    })

    if (page?.content) {
      const parsed = JSON.parse(page.content)
      // Merge với defaults để đảm bảo các field mới luôn có giá trị
      return { ...DEFAULT_SITE_SETTINGS, ...parsed }
    }
  } catch {
    // Trả về mặc định nếu có lỗi
  }

  return DEFAULT_SITE_SETTINGS
}
