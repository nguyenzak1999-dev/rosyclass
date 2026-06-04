"use server"

import { prisma } from "@/lib/prisma"

export async function submitContactForm(data: {
  fullName: string
  phone: string
  email?: string
  courseInterest?: string
  message?: string
}) {
  try {
    const notes = [
      data.courseInterest ? `Quan tâm khóa: ${data.courseInterest}` : null,
      data.message ? `Lời nhắn: ${data.message}` : null,
    ]
      .filter(Boolean)
      .join("\n")

    await prisma.lead.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        source: "Contact Form",
        notes: notes || null,
        status: "NEW",
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error("Contact form submission error:", error)
    return { success: false, error: "Có lỗi xảy ra, vui lòng thử lại." }
  }
}
