"use server"

import { prisma } from "@/lib/prisma"
import { SITE_SETTINGS_SLUG, type SiteSettings } from "@/lib/site-settings"
import { revalidatePath } from "next/cache"

export async function saveSiteSettings(data: SiteSettings) {
  try {
    const content = JSON.stringify(data)

    const existing = await prisma.page.findUnique({
      where: { slug: SITE_SETTINGS_SLUG }
    })

    if (existing) {
      await prisma.page.update({
        where: { slug: SITE_SETTINGS_SLUG },
        data: {
          title: "Site Settings",
          content,
          status: "ACTIVE"
        }
      })
    } else {
      await prisma.page.create({
        data: {
          title: "Site Settings",
          slug: SITE_SETTINGS_SLUG,
          content,
          status: "ACTIVE"
        }
      })
    }

    revalidatePath("/")
    revalidatePath("/admin/settings/site")
    return { success: true }
  } catch (error: any) {
    console.error("Save site settings error:", error)
    return { success: false, error: error.message || "Không thể lưu cài đặt" }
  }
}
