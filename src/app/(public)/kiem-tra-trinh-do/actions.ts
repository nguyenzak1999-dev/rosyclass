"use server"

import { prisma } from "@/lib/prisma"
import { notifyLeadSubmitted } from "@/lib/lead-notifications"

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
    if (data.leadId) {
      await prisma.lead.update({
        where: { id: data.leadId },
        data: {
          notes: `Quan tâm khóa: ${data.courseInterest}. Điểm Test Sơ Bộ: ${data.score !== undefined ? `${data.score}/${data.totalQuestions}` : "Chưa làm"}`,
          status: data.score !== undefined ? "TESTED" : "NEW",
        },
      })

      await prisma.placementTest.create({
        data: {
          testDate: new Date(),
          totalScore: data.score ?? null,
          levelResult: data.score !== undefined && data.totalQuestions
            ? `${data.score}/${data.totalQuestions}`
            : null,
          leadId: data.leadId,
        },
      })

      return { success: true, leadId: data.leadId }
    }

    const notes = `Quan tâm khóa: ${data.courseInterest}. Điểm Test Sơ Bộ: ${data.score !== undefined ? `${data.score}/${data.totalQuestions}` : 'Chưa làm'}`

    const lead = await prisma.lead.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        source: "Placement Test Form",
        notes,
        status: data.score !== undefined ? "TESTED" : "NEW"
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
    
    return { success: true, leadId: lead.id }
  } catch (error) {
    console.error("Error creating lead:", error)
    return { success: false, error: "Không thể lưu thông tin bài kiểm tra" }
  }
}
