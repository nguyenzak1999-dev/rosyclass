"use server"

import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { type SiteSettings } from "@/lib/site-settings"
import { updateStoredSiteSettings } from "@/lib/site-settings-store"
import { revalidatePath } from "next/cache"

export async function saveSiteSettings(data: SiteSettings) {
  try {
    await requirePermission(PERMISSIONS.settingsWrite)
    // Cấu hình thông báo form có action riêng; bỏ khỏi đây để bản cũ trong form không ghi đè
    const { leadNotificationSettings: _ignored, ...patch } = data
    void _ignored
    await updateStoredSiteSettings(patch)

    revalidatePath("/admin/settings/site")
    revalidatePath("/admin/payments")
    return { success: true }
  } catch (error: unknown) {
    console.error("Save site settings error:", error)
    return { success: false, error: "Không thể lưu cài đặt, vui lòng thử lại" }
  }
}
