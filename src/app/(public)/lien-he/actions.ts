"use server"

import { prisma } from "@/lib/prisma"
import { notifyLeadSubmitted } from "@/lib/lead-notifications"

export async function submitContactForm(data: {
  fullName: string
  phone: string
  email?: string
  courseInterest?: string
  message?: string
}) {
  try {
    // Form công khai: kiểm tra lại ở server, không chỉ dựa vào trình duyệt
    const fullName = data.fullName?.trim().slice(0, 120)
    const phone = data.phone?.trim().slice(0, 20)
    if (!fullName || !phone) {
      return { success: false, error: "Ba mẹ vui lòng điền họ tên và số điện thoại nhé!" }
    }

    const notes = [
      data.courseInterest ? `Quan tâm khóa: ${data.courseInterest}` : null,
      data.message ? `Lời nhắn: ${data.message}` : null,
    ]
      .filter(Boolean)
      .join("\n")

    const lead = await prisma.lead.create({
      data: {
        fullName,
        phone,
        email: data.email?.trim() || null,
        source: "Contact Form",
        notes: notes || null,
        status: "NEW",
      },
    })

    await notifyLeadSubmitted({
      formKey: "contact",
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      courseInterest: data.courseInterest,
      notes,
      leadId: lead.id,
    })

    return { success: true }
  } catch (error) {
    console.error("Contact form submission error:", error)
    return { success: false, error: "Có lỗi xảy ra, vui lòng thử lại." }
  }
}
