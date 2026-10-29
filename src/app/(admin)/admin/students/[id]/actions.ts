"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/errors"
import { parseVietnamDateKey } from "@/lib/curriculum"
import { upsertPayment } from "@/app/(admin)/admin/payments/actions"

export async function addStudentToClass(studentId: string, classId: string) {
  try {
    await requirePermission(PERMISSIONS.studentsWrite)
    // Check if class is full
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      include: { students: { where: { status: 'ACTIVE' } } }
    })

    if (!cls) return { success: false, error: "Không tìm thấy lớp học" }
    if (cls.students.length >= cls.maxStudents) return { success: false, error: "Lớp đã đầy chỗ" }

    // Check if student is already in this class actively
    const existing = await prisma.classStudent.findUnique({
      where: { classId_studentId: { classId, studentId } }
    })

    if (existing && existing.status === 'ACTIVE') {
      return { success: false, error: "Học viên đã tham gia lớp này rồi" }
    }

    if (existing) {
      await prisma.classStudent.update({
        where: { classId_studentId: { classId, studentId } },
        data: { status: 'ACTIVE', joinedAt: new Date() }
      })
    } else {
      await prisma.classStudent.create({ data: { classId, studentId, status: 'ACTIVE' } })
    }

    // Update student status to ACTIVE
    await prisma.student.update({
      where: { id: studentId },
      data: { status: 'ACTIVE' }
    })

    revalidatePath(`/admin/students/${studentId}`)
    revalidatePath(`/admin/classes/${classId}`)
    revalidatePath("/admin/students")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Có lỗi xảy ra" }
  }
}

export async function removeStudentFromClass(studentId: string, classId: string) {
  try {
    await requirePermission(PERMISSIONS.studentsWrite)
    await prisma.classStudent.update({
      where: { classId_studentId: { classId, studentId } },
      data: { status: 'DROPPED' }
    })
    revalidatePath(`/admin/students/${studentId}`)
    revalidatePath(`/admin/classes/${classId}`)
    revalidatePath("/admin/students")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Có lỗi xảy ra" }
  }
}

export async function createPayment(data: {
  studentId: string
  totalAmount: number
  paidAmount: number
  classId?: string
  paymentMethod: string
  dueDate?: string
  note?: string
}) {
  try {
    if (!(data.totalAmount > 0)) return { success: false, error: "Tổng học phí phải lớn hơn 0" }
    if (data.paidAmount < 0 || data.paidAmount > data.totalAmount) {
      return { success: false, error: "Số tiền đã đóng phải từ 0 đến tổng học phí" }
    }
    // Dùng chung luồng tạo phiếu thu của trang Học phí để có mã phiếu + QR chuyển khoản
    const result = await upsertPayment({
      studentId: data.studentId,
      classId: data.classId || null,
      totalAmount: data.totalAmount,
      paidAmount: data.paidAmount,
      paymentMethod: data.paymentMethod as any,
      status: "UNPAID",
      paymentDate: data.paidAmount > 0 ? new Date() : null,
      dueDate: parseVietnamDateKey(data.dueDate),
      note: data.note?.trim() || undefined,
    })
    if (!result.success) return { success: false, error: result.error || "Không thể tạo hóa đơn" }
    revalidatePath(`/admin/students/${data.studentId}`)
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

const NOTE_ENTITY = "STUDENT_NOTE"

/** Ghi chú theo dõi học viên, lưu vào ActivityLog (entityType STUDENT_NOTE, action = loại ghi chú) */
export async function addStudentNote(studentId: string, data: { type: string; content: string }) {
  try {
    const user = await requirePermission(PERMISSIONS.studentsWrite)
    const content = data.content.trim()
    if (!content) return { success: false, error: "Vui lòng nhập nội dung ghi chú" }
    if (content.length > 2000) return { success: false, error: "Ghi chú tối đa 2000 ký tự" }
    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { id: true } })
    if (!student) return { success: false, error: "Không tìm thấy học viên" }

    await prisma.activityLog.create({
      data: {
        action: data.type || "INTERNAL",
        entityType: NOTE_ENTITY,
        entityId: studentId,
        details: content,
        userId: user.id,
      },
    })
    revalidatePath(`/admin/students/${studentId}`)
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, "Không thể lưu ghi chú") }
  }
}

export async function deleteStudentNote(noteId: string) {
  try {
    await requirePermission(PERMISSIONS.studentsWrite)
    const note = await prisma.activityLog.findUnique({ where: { id: noteId }, select: { id: true, entityType: true, entityId: true } })
    if (!note || note.entityType !== NOTE_ENTITY) return { success: false, error: "Không tìm thấy ghi chú" }
    await prisma.activityLog.delete({ where: { id: note.id } })
    if (note.entityId) revalidatePath(`/admin/students/${note.entityId}`)
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, "Không thể xoá ghi chú") }
  }
}
