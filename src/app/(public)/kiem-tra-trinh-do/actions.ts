"use server"

import { prisma } from "@/lib/prisma"

export async function submitPlacementTestLead(data: {
  fullName: string
  phone: string
  email?: string
  courseInterest: string
  score?: number
  totalQuestions?: number
}) {
  try {
    const lead = await prisma.lead.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        source: "Placement Test Form",
        notes: `Quan tâm khóa: ${data.courseInterest}. Điểm Test Sơ Bộ: ${data.score !== undefined ? `${data.score}/${data.totalQuestions}` : 'Chưa làm'}`,
        status: data.score !== undefined ? "TESTED" : "NEW"
      }
    })
    
    return { success: true, leadId: lead.id }
  } catch (error: any) {
    console.error("Error creating lead:", error)
    return { success: false, error: "Failed to create lead" }
  }
}
