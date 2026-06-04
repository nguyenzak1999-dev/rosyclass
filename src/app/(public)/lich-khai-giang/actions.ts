"use server"

import { prisma } from "@/lib/prisma"

export async function submitClassRegistration(data: {
  fullName: string
  phone: string
  email?: string
  className: string
  classId: string
}) {
  try {
    await prisma.lead.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        source: "Class Schedule Form",
        notes: `Đăng ký lớp: ${data.className} (ID: ${data.classId})`,
        status: "NEW",
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error("Class registration error:", error)
    return { success: false, error: "Có lỗi xảy ra, vui lòng thử lại." }
  }
}
