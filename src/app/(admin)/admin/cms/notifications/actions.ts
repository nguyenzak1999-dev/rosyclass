"use server"

import { revalidatePath } from "next/cache"

import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { sendLeadNotification, type LeadNotificationChannel } from "@/lib/lead-notifications"
import { updateStoredSiteSettings } from "@/lib/site-settings-store"
import { type LeadFormKey, type LeadNotificationSettings } from "@/lib/site-settings"

export async function saveLeadNotificationSettings(data: LeadNotificationSettings) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)
    await updateStoredSiteSettings({ leadNotificationSettings: data })

    revalidatePath("/admin/cms/notifications")
    return { success: true }
  } catch (error) {
    console.error("Save lead notification settings error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Không thể lưu cấu hình thông báo" }
  }
}

export async function testLeadNotification(data: {
  settings: LeadNotificationSettings
  formKey: LeadFormKey
  channel: LeadNotificationChannel
  testEmail?: string
}) {
  try {
    await requirePermission(PERMISSIONS.cmsWrite)

    const result = await sendLeadNotification(
      {
        formKey: data.formKey,
        fullName: "Khách hàng test",
        phone: "0900000000",
        email: data.channel === "email" ? data.testEmail : "test@example.com",
        courseInterest: "Khóa học test",
        notes: "Đây là thông báo test từ CMS RosyClass.",
        leadId: "TEST-LEAD",
      },
      {
        settings: data.settings,
        channels: [data.channel],
      }
    )

    if (result.succeeded.includes(data.channel)) {
      return { success: true, message: data.channel === "telegram" ? "Đã gửi test Telegram" : "Đã gửi test email" }
    }

    const failed = result.failed.find((item) => item.channel === data.channel)
    const skipped = result.skipped[0]
    return { success: false, error: failed?.error || skipped || "Không gửi được thông báo test" }
  } catch (error) {
    console.error("Test lead notification error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Không thể test thông báo" }
  }
}
