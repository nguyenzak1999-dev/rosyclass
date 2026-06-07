"use server"

import { prisma } from "@/lib/prisma"
import { notifyLeadSubmitted } from "@/lib/lead-notifications"

export async function submitClassRegistration(data: {
  fullName: string
  phone: string
  email?: string
  className: string
  classId: string
  courseId: string
}) {
  try {
    const notes = `Đăng ký lớp: ${data.className} (ID: ${data.classId})`

    const lead = await prisma.lead.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        source: "Class Schedule Form",
        notes,
        interestedCourseId: data.courseId,
        status: "NEW",
      },
    })

    await notifyLeadSubmitted({
      formKey: "classSchedule",
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      courseInterest: data.className,
      notes,
      leadId: lead.id,
    })

    return { success: true }
  } catch (error) {
    console.error("Class registration error:", error)
    return { success: false, error: "Có lỗi xảy ra, vui lòng thử lại." }
  }
}
