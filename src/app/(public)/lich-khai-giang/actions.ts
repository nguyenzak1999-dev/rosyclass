"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { notifyLeadSubmitted } from "@/lib/lead-notifications"

const classRegistrationSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().max(200).optional(),
  classId: z.string().min(1).max(100),
})

export async function submitClassRegistration(data: {
  fullName: string
  phone: string
  email?: string
  className: string
  classId: string
  courseId: string
}) {
  try {
    const parsed = classRegistrationSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: "Ba mẹ vui lòng điền họ tên và số điện thoại hợp lệ nhé!" }
    }

    // Lấy tên lớp / khoá từ DB, không tin dữ liệu trình duyệt gửi lên (courseId sai sẽ làm lỗi khoá ngoại)
    const cls = await prisma.class.findUnique({
      where: { id: parsed.data.classId },
      select: { id: true, name: true, courseId: true, course: { select: { name: true } } },
    })
    if (!cls) {
      return { success: false, error: "Lớp này không còn mở đăng ký, ba mẹ vui lòng chọn lớp khác." }
    }
    const className = cls.name || cls.course.name
    const notes = `Đăng ký lớp: ${className} (ID: ${cls.id})`

    const lead = await prisma.lead.create({
      data: {
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        source: "Class Schedule Form",
        notes,
        interestedCourseId: cls.courseId,
        status: "NEW",
      },
    })

    await notifyLeadSubmitted({
      formKey: "classSchedule",
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      courseInterest: className,
      notes,
      leadId: lead.id,
    })

    return { success: true }
  } catch (error) {
    console.error("Class registration error:", error)
    return { success: false, error: "Có lỗi xảy ra, vui lòng thử lại." }
  }
}
