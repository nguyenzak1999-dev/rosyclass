"use server"

import { prisma } from "@/lib/prisma"
import { notifyLeadSubmitted } from "@/lib/lead-notifications"

export async function submitRegistrationForm(data: {
  studentName: string
  phone: string
  email?: string
  dateOfBirth?: string
  courseInterest?: string
  currentLevel?: string
  learningGoal?: string
  parentName?: string
  parentPhone?: string
  hearAboutUs?: string
  notes?: string
}) {
  try {
    const notesParts = [
      data.currentLevel ? `Trình độ hiện tại: ${data.currentLevel}` : null,
      data.hearAboutUs ? `Biết đến qua: ${data.hearAboutUs}` : null,
      data.notes ? `Ghi chú: ${data.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n")

    // Find course by name if provided
    let interestedCourseId: string | undefined
    if (data.courseInterest) {
      const course = await prisma.course.findFirst({
        where: { name: data.courseInterest, isPublished: true },
        select: { id: true },
      })
      interestedCourseId = course?.id
    }

    const lead = await prisma.lead.create({
      data: {
        fullName: data.studentName,
        phone: data.phone,
        email: data.email || null,
        parentName: data.parentName || null,
        parentPhone: data.parentPhone || null,
        learningGoal: data.learningGoal || null,
        source: "Registration Form",
        status: "NEW",
        notes: notesParts || null,
        interestedCourseId: interestedCourseId || null,
      },
    })

    await notifyLeadSubmitted({
      formKey: "registration",
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      courseInterest: data.courseInterest,
      notes: notesParts,
      leadId: lead.id,
    })

    return { success: true }
  } catch (error) {
    console.error("Registration form submission error:", error)
    return { success: false, error: "Có lỗi xảy ra, vui lòng thử lại." }
  }
}

export async function getPublishedCourses() {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      select: { id: true, name: true, level: true },
      orderBy: { name: "asc" },
    })
    return courses
  } catch {
    return []
  }
}
