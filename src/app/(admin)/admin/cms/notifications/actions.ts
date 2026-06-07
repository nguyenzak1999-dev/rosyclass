"use server"

import { revalidatePath } from "next/cache"

import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { getSiteSettings } from "@/lib/get-site-settings"
import { prisma } from "@/lib/prisma"
import { SITE_SETTINGS_SLUG, type LeadNotificationSettings } from "@/lib/site-settings"

export async function saveLeadNotificationSettings(data: LeadNotificationSettings) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    const currentSettings = await getSiteSettings()
    const content = JSON.stringify({
      ...currentSettings,
      leadNotificationSettings: data,
    })

    await prisma.page.upsert({
      where: { slug: SITE_SETTINGS_SLUG },
      update: {
        title: "Site Settings",
        content,
        status: "ACTIVE",
      },
      create: {
        title: "Site Settings",
        slug: SITE_SETTINGS_SLUG,
        content,
        status: "ACTIVE",
      },
    })

    revalidatePath("/")
    revalidatePath("/admin/cms/notifications")
    return { success: true }
  } catch (error) {
    console.error("Save lead notification settings error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Không thể lưu cấu hình thông báo" }
  }
}
