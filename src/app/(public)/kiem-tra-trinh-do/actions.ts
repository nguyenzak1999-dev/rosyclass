"use server"

import { env } from "cloudflare:workers"
import { prisma } from "@/lib/prisma"
import { notifyLeadSubmitted } from "@/lib/lead-notifications"

const SOURCE = "Placement Test Form"
const RESULT_WINDOW_MS = 2 * 60 * 60 * 1000

// Trình duyệt chỉ nhận token có chữ ký thay cho id lead thô, để không ai sửa được lead khác
async function sign(value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.AUTH_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`placement:${value}`)))
  return Array.from(mac, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

async function issueLeadToken(leadId: string) {
  return `${leadId}.${await sign(leadId)}`
}

async function readLeadToken(token: string | undefined) {
  if (!token) return null
  const [leadId, mac] = token.split(".")
  if (!leadId || !mac || mac !== (await sign(leadId))) return null
  return leadId
}

export async function submitPlacementTestLead(data: {
  leadId?: string
  fullName: string
  phone: string
  email?: string
  courseInterest: string
  score?: number
  totalQuestions?: number
}) {
  try {
    const fullName = data.fullName?.trim().slice(0, 120)
    const phone = data.phone?.trim().slice(0, 20)
    if (!data.leadId && (!fullName || !phone)) {
      return { success: false, error: "Ba mẹ vui lòng điền họ tên của bé và số điện thoại nhé!" }
    }
    // Điểm do trình duyệt gửi: chỉ nhận số câu đúng hợp lệ (0..tổng số câu)
    const totalQuestions = Number.isInteger(data.totalQuestions) && data.totalQuestions! > 0 ? data.totalQuestions! : undefined
    const score = totalQuestions !== undefined && Number.isInteger(data.score) && data.score! >= 0
      ? Math.min(data.score!, totalQuestions)
      : undefined
    const notes = `Quan tâm khóa: ${data.courseInterest}. Điểm Test Sơ Bộ: ${score !== undefined ? `${score}/${totalQuestions}` : 'Chưa làm'}`

    const existingId = await readLeadToken(data.leadId)
    if (data.leadId && !existingId) {
      return { success: false, error: "Phiên làm bài không hợp lệ, ba mẹ vui lòng làm lại" }
    }
    if (existingId) {
      const existing = await prisma.lead.findUnique({
        where: { id: existingId },
        select: { id: true, source: true, createdAt: true, notes: true, status: true },
      })
      // Chỉ cập nhật lead vừa tạo từ chính form này, chưa được tư vấn viên xử lý
      if (
        !existing ||
        existing.source !== SOURCE ||
        Date.now() - existing.createdAt.getTime() > RESULT_WINDOW_MS ||
        !["NEW", "TESTED"].includes(existing.status)
      ) {
        return { success: false, error: "Phiên làm bài đã hết hạn, ba mẹ vui lòng làm lại" }
      }

      const resultNote = score !== undefined ? `Kết quả bài kiểm tra: ${score}/${totalQuestions}` : ""
      await prisma.lead.update({
        where: { id: existing.id },
        data: {
          // Ghi nối thêm, không ghi đè ghi chú cũ
          notes: [existing.notes, resultNote].filter(Boolean).join("\n"),
          status: score !== undefined ? "TESTED" : existing.status,
        },
      })

      if (score !== undefined) {
        await prisma.placementTest.create({
          data: {
            testDate: new Date(),
            // CRM chấm theo thang 10 (nhập điểm cũng giới hạn 0–10): quy số câu đúng về thang 10
            totalScore: Math.round((score / totalQuestions!) * 100) / 10,
            levelResult: `${score}/${totalQuestions}`,
            leadId: existing.id,
          },
        })
      }

      // Không gửi thông báo lần hai: đã báo lúc ba mẹ để lại thông tin, kết quả xem trong CRM
      return { success: true, leadId: data.leadId }
    }

    const lead = await prisma.lead.create({
      data: {
        fullName: fullName!,
        phone: phone!,
        email: data.email?.trim() || null,
        source: SOURCE,
        notes,
        status: score !== undefined ? "TESTED" : "NEW"
      }
    })

    await notifyLeadSubmitted({
      formKey: "placementTest",
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      courseInterest: data.courseInterest,
      notes,
      leadId: lead.id,
    })

    return { success: true, leadId: await issueLeadToken(lead.id) }
  } catch (error) {
    console.error("Error creating lead:", error)
    return { success: false, error: "Không thể lưu thông tin bài kiểm tra" }
  }
}
