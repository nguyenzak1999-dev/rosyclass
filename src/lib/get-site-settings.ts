import { prisma } from "@/lib/prisma"
import { DEFAULT_SITE_SETTINGS, SITE_SETTINGS_SLUG, type SiteSettings } from "./site-settings"

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const fetchSettings = prisma.page.findUnique({
      where: { slug: SITE_SETTINGS_SLUG }
    });
    
    // Timeout sau 3 giây để tránh treo Build trên Vercel hoặc sập web
    const timeoutPromise = new Promise<null>((resolve) => 
      setTimeout(() => resolve(null), 3000)
    );

    const page = await Promise.race([fetchSettings, timeoutPromise]);

    if (page && page.content) {
      const parsed = JSON.parse(page.content);
      return { ...DEFAULT_SITE_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error("Lỗi lấy cấu hình web:", error);
  }

  return DEFAULT_SITE_SETTINGS
}
