import "server-only"

import { getSiteSettings } from "@/lib/get-site-settings"
import type { LeadFormKey } from "@/lib/site-settings"

type LeadNotificationPayload = {
  formKey: LeadFormKey
  fullName: string
  phone: string
  email?: string | null
  courseInterest?: string | null
  notes?: string | null
  leadId?: string
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
  if (!token || !chatId || !text.trim()) return

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
  if (!apiKey || !to || !subject.trim() || !html.trim()) return

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

export async function notifyLeadSubmitted(payload: LeadNotificationPayload) {
  const settings = await getSiteSettings()
  const notificationSettings = settings.leadNotificationSettings
  const formSettings = notificationSettings?.forms[payload.formKey]

  if (!notificationSettings || !formSettings?.enabled) return

  const values = {
    formLabel: formSettings.label,
    fullName: payload.fullName,
    phone: payload.phone,
    email: payload.email || "Không có",
    courseInterest: payload.courseInterest || "Chưa chọn",
    notes: payload.notes || "",
    leadId: payload.leadId || "",
  }

  const jobs: Promise<void>[] = []

  if (notificationSettings.telegramEnabled && formSettings.telegramEnabled) {
    const text = renderTemplate(notificationSettings.telegramMessageTemplate, values, "text")
    jobs.push(sendTelegramMessage(notificationSettings.telegramChatId, text))
  }

  if (notificationSettings.emailEnabled && formSettings.emailEnabled && payload.email) {
    const subject = renderTemplate(formSettings.customerEmailSubject, values, "text")
    const html = renderTemplate(formSettings.customerEmailHtml, values, "html")
    jobs.push(
      sendCustomerEmail({
        from: notificationSettings.emailFrom,
        replyTo: notificationSettings.replyToEmail,
        to: payload.email,
        subject,
        html,
      })
    )
  }

  if (jobs.length === 0) return

  const results = await Promise.allSettled(jobs)
  const failures = results.filter((result) => result.status === "rejected")
  if (failures.length > 0) {
    console.error("Lead notification errors:", failures)
  }
}
