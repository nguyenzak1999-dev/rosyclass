"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import {
  leadSchema,
  addLeadNoteSchema,
  bookPlacementTestSchema,
  updateLeadStatusSchema,
  convertLeadToStudentSchema,
  type LeadFormValues,
  type AddLeadNoteFormValues,
  type BookPlacementTestFormValues,
  type UpdateLeadStatusFormValues,
  type ConvertLeadToStudentFormValues,
} from "@/lib/schemas/lead"
import { notifyAdmins } from "@/app/(admin)/admin/notifications/actions"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/errors"

export async function upsertLead(data: LeadFormValues) {
  try {
    await requirePermission(PERMISSIONS.leadsWrite)
    const parsedData = leadSchema.parse(data)

    if (parsedData.id) {
      await prisma.lead.update({
        where: { id: parsedData.id },
        data: { ...parsedData }
      })
    } else {
      await prisma.lead.create({
        data: { ...parsedData }
      })
    }

    revalidatePath("/admin/leads")
    return { success: true }
  } catch (error: unknown) {
    console.error("Lead upsert error:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteLead(id: string) {
  try {
    await requirePermission(PERMISSIONS.leadsWrite)
    await prisma.lead.delete({ where: { id } })
    revalidatePath("/admin/leads")
    return { success: true }
  } catch (error: unknown) {
    console.error("Lead delete error:", error)
    return { success: false, error: "Không thể xóa khách hàng này" }
  }
}

/**
 * Thêm ghi chú cho lead. Lấy user từ session hiện tại (requirePermission đã check).
 */
export async function addLeadNote(data: AddLeadNoteFormValues) {
  try {
    const adminUser = await requirePermission(PERMISSIONS.leadsWrite)
    const parsed = addLeadNoteSchema.parse(data)

    // Tìm User record tương ứng với admin email
    const currentUser = await prisma.user.findUnique({
      where: { email: adminUser.email },
      select: { id: true },
    })
    if (!currentUser) {
      return { success: false, error: "Không tìm thấy tài khoản admin tương ứng" }
    }

    await prisma.leadNote.create({
      data: {
        leadId: parsed.leadId,
        content: parsed.content,
        createdById: currentUser.id,
      },
    })

    revalidatePath(`/admin/leads/${parsed.leadId}`)
    return { success: true }
  } catch (error) {
    console.error("Add lead note error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể thêm ghi chú") }
  }
}

/**
 * Book placement test cho lead - tạo PlacementTest record với testDate.
 * Tự động update Lead.status = PLACEMENT_TEST_BOOKED.
 */
export async function bookPlacementTest(data: BookPlacementTestFormValues) {
  try {
    await requirePermission(PERMISSIONS.leadsWrite)
    const parsed = bookPlacementTestSchema.parse(data)

    const lead = await prisma.lead.findUnique({
      where: { id: parsed.leadId },
      select: { id: true, fullName: true, status: true },
    })
    if (!lead) {
      return { success: false, error: "Không tìm thấy khách hàng" }
    }

    // Tạo PlacementTest
    const test = await prisma.placementTest.create({
      data: {
        leadId: parsed.leadId,
        testDate: new Date(parsed.testDate),
        teacherComment: parsed.notes || null,
      },
    })

    // Update Lead status
    await prisma.lead.update({
      where: { id: parsed.leadId },
      data: { status: "PLACEMENT_TEST_BOOKED" },
    })

    // Notify admin
    notifyAdmins(
      "Lịch placement test mới",
      `Lead ${lead.fullName} đã đặt lịch test vào ${new Date(parsed.testDate).toLocaleDateString("vi-VN")}`,
      `/admin/leads/${parsed.leadId}`
    )

    revalidatePath(`/admin/leads/${parsed.leadId}`)
    revalidatePath("/admin/leads")
    return { success: true, data: { placementTestId: test.id } }
  } catch (error) {
    console.error("Book placement test error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể đặt lịch test") }
  }
}

/**
 * Update lead status + optional note.
 */
export async function updateLeadStatus(data: UpdateLeadStatusFormValues) {
  try {
    await requirePermission(PERMISSIONS.leadsWrite)
    const parsed = updateLeadStatusSchema.parse(data)

    const lead = await prisma.lead.findUnique({
      where: { id: parsed.leadId },
      select: { id: true, fullName: true, status: true },
    })
    if (!lead) {
      return { success: false, error: "Không tìm thấy khách hàng" }
    }

    await prisma.lead.update({
      where: { id: parsed.leadId },
      data: { status: parsed.status },
    })

    // Ghi log nếu có note
    if (parsed.note) {
      const adminUser = await requirePermission(PERMISSIONS.leadsWrite)
      const currentUser = await prisma.user.findUnique({
        where: { email: adminUser.email },
        select: { id: true },
      })
      if (currentUser) {
        await prisma.leadNote.create({
          data: {
            leadId: parsed.leadId,
            content: `[Status: ${lead.status} → ${parsed.status}] ${parsed.note}`,
            createdById: currentUser.id,
          },
        })
      }
    }

    revalidatePath(`/admin/leads/${parsed.leadId}`)
    revalidatePath("/admin/leads")
    return { success: true }
  } catch (error) {
    console.error("Update lead status error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể cập nhật trạng thái") }
  }
}

/**
 * Convert Lead → Student (transaction).
 * - Tạo Student mới từ Lead data
 * - Update Lead.status = ENROLLED
 * - Notify admin
 */
export async function convertLeadToStudent(data: ConvertLeadToStudentFormValues) {
  try {
    await requirePermission(PERMISSIONS.studentsWrite)
    const parsed = convertLeadToStudentSchema.parse(data)

    const lead = await prisma.lead.findUnique({
      where: { id: parsed.leadId },
      include: {
        interestedCourse: { select: { id: true, name: true } },
      },
    })
    if (!lead) {
      return { success: false, error: "Không tìm thấy khách hàng" }
    }
    if (lead.status === "ENROLLED") {
      return { success: false, error: "Lead này đã được chuyển thành học viên" }
    }

    // Tạo student + update lead trong transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Tạo Student
      const student = await tx.student.create({
        data: {
          fullName: parsed.fullName || lead.fullName,
          phone: lead.phone,
          email: parsed.email || lead.email || null,
          currentLevel: parsed.currentLevel || lead.currentLevel || null,
          learningGoal: parsed.learningGoal || lead.learningGoal || null,
          source: lead.source || null,
          status: parsed.status,
          parentId: parsed.parentId || null,
          joinedAt: new Date(),
        },
      })

      // 2. Update lead
      await tx.lead.update({
        where: { id: parsed.leadId },
        data: { status: "ENROLLED" },
      })

      return { studentId: student.id }
    })

    // Notify admin
    notifyAdmins(
      "Convert Lead thành công",
      `Lead ${lead.fullName} đã được chuyển thành học viên`,
      `/admin/students/${result.studentId}`
    )

    revalidatePath(`/admin/leads/${parsed.leadId}`)
    revalidatePath("/admin/leads")
    revalidatePath(`/admin/students/${result.studentId}`)
    return { success: true, data: { studentId: result.studentId } }
  } catch (error) {
    console.error("Convert lead to student error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể chuyển đổi lead") }
  }
}
