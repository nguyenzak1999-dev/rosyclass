import "server-only"

import { getSiteSettings } from "@/lib/get-site-settings"
import type { LeadFormKey, LeadNotificationSettings } from "@/lib/site-settings"

type LeadNotificationPayload = {
  formKey: LeadFormKey
  fullName: string
  phone: string
  email?: string | null
  courseInterest?: string | null
  notes?: string | null
  leadId?: string
}

export type LeadNotificationChannel = "telegram" | "email"

export type LeadNotificationResult = {
  attempted: LeadNotificationChannel[]
  succeeded: LeadNotificationChannel[]
  failed: {
    channel: LeadNotificationChannel
    error: string
  }[]
  skipped: string[]
}

const placeholderKeys = [
  "formLabel",
  "fullName",
  "phone",
  "email",
  "courseInterest",
  "notes",
  "leadId",
] as const

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function renderTemplate(template: string, values: Record<(typeof placeholderKeys)[number], string>, mode: "text" | "html") {
  return placeholderKeys.reduce((content, key) => {
    const value = mode === "html" ? escapeHtml(values[key]) : values[key]
    return content.replaceAll(`{{${key}}}`, value)
  }, template)
}

async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error("Thiếu TELEGRAM_BOT_TOKEN")
  if (!chatId) throw new Error("Thiếu Telegram Chat ID")
  if (!text.trim()) throw new Error("Nội dung Telegram đang trống")

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Telegram notification failed: ${response.status} ${message}`)
  }
}

async function sendCustomerEmail({
  from,
  replyTo,
  to,
  subject,
  html,
}: {
  from: string
  replyTo?: string
  to: string
  subject: string
  html: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("Thiếu RESEND_API_KEY")
  if (!to) throw new Error("Thiếu email người nhận")
  if (!subject.trim()) throw new Error("Tiêu đề email đang trống")
  if (!html.trim()) throw new Error("Nội dung email đang trống")

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo || undefined,
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Customer email failed: ${response.status} ${message}`)
  }
}

export async function sendLeadNotification(
  payload: LeadNotificationPayload,
  options?: {
    settings?: LeadNotificationSettings
    channels?: LeadNotificationChannel[]
  }
): Promise<LeadNotificationResult> {
  const settings = options?.settings ? { leadNotificationSettings: options.settings } : await getSiteSettings()
  const notificationSettings = settings.leadNotificationSettings
  const formSettings = notificationSettings?.forms[payload.formKey]
  const channels = options?.channels || ["telegram", "email"]
  const result: LeadNotificationResult = {
    attempted: [],
    succeeded: [],
    failed: [],
    skipped: [],
  }

  if (!notificationSettings) {
    result.skipped.push("Chưa có cấu hình thông báo")
    return result
  }

  if (!formSettings?.enabled) {
    result.skipped.push("Form đang tắt thông báo")
    return result
  }

  const values = {
    formLabel: formSettings.label,
    fullName: payload.fullName,
    phone: payload.phone,
    email: payload.email || "Không có",
    courseInterest: payload.courseInterest || "Chưa chọn",
    notes: payload.notes || "",
    leadId: payload.leadId || "",
  }

  if (channels.includes("telegram") && notificationSettings.telegramEnabled && formSettings.telegramEnabled) {
    const text = renderTemplate(notificationSettings.telegramMessageTemplate, values, "text")
    result.attempted.push("telegram")
    try {
      await sendTelegramMessage(notificationSettings.telegramChatId, text)
      result.succeeded.push("telegram")
    } catch (error) {
      result.failed.push({
        channel: "telegram",
        error: error instanceof Error ? error.message : "Không thể gửi Telegram",
      })
    }
  } else if (channels.includes("telegram")) {
    result.skipped.push("Telegram đang tắt ở cấu hình tổng hoặc cấu hình form")
  }

  if (channels.includes("email") && notificationSettings.emailEnabled && formSettings.emailEnabled && payload.email) {
    const subject = renderTemplate(formSettings.customerEmailSubject, values, "text")
    const html = renderTemplate(formSettings.customerEmailHtml, values, "html")
    result.attempted.push("email")
    try {
      await sendCustomerEmail({
        from: notificationSettings.emailFrom,
        replyTo: notificationSettings.replyToEmail,
        to: payload.email,
        subject,
        html,
      })
      result.succeeded.push("email")
    } catch (error) {
      result.failed.push({
        channel: "email",
        error: error instanceof Error ? error.message : "Không thể gửi email",
      })
    }
  } else if (channels.includes("email")) {
    result.skipped.push(payload.email ? "Email đang tắt ở cấu hình tổng hoặc cấu hình form" : "Thiếu email người nhận")
  }

  return result
}

export async function notifyLeadSubmitted(payload: LeadNotificationPayload) {
  const result = await sendLeadNotification(payload)

  if (result.failed.length > 0) {
    console.error("Lead notification errors:", result.failed)
  }
}
