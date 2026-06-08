import { prisma } from "@/lib/prisma"
import {
  DEFAULT_LEAD_NOTIFICATION_SETTINGS,
  DEFAULT_SITE_SETTINGS,
  SITE_SETTINGS_SLUG,
  type LeadNotificationSettings,
  type SiteSettings,
} from "./site-settings"

function mergeLeadNotificationSettings(settings?: Partial<LeadNotificationSettings>): LeadNotificationSettings {
  return {
    ...DEFAULT_LEAD_NOTIFICATION_SETTINGS,
    ...settings,
    forms: {
      contact: {
        ...DEFAULT_LEAD_NOTIFICATION_SETTINGS.forms.contact,
        ...settings?.forms?.contact,
      },
      registration: {
        ...DEFAULT_LEAD_NOTIFICATION_SETTINGS.forms.registration,
        ...settings?.forms?.registration,
      },
      placementTest: {
        ...DEFAULT_LEAD_NOTIFICATION_SETTINGS.forms.placementTest,
        ...settings?.forms?.placementTest,
      },
      classSchedule: {
        ...DEFAULT_LEAD_NOTIFICATION_SETTINGS.forms.classSchedule,
        ...settings?.forms?.classSchedule,
      },
    },
  }
}

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
      return {
        ...DEFAULT_SITE_SETTINGS,
        ...parsed,
        leadNotificationSettings: mergeLeadNotificationSettings(parsed.leadNotificationSettings),
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.warn(`[site-settings] Không thể lấy cấu hình web. Đang dùng cấu hình mặc định. ${message}`)
  }

  return {
    ...DEFAULT_SITE_SETTINGS,
    leadNotificationSettings: mergeLeadNotificationSettings(DEFAULT_SITE_SETTINGS.leadNotificationSettings),
  }
}
