"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addStudentToClass(studentId: string, classId: string) {
  try {
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
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Có lỗi xảy ra" }
  }
}

export async function removeStudentFromClass(studentId: string, classId: string) {
  try {
    await prisma.classStudent.update({
      where: { classId_studentId: { classId, studentId } },
      data: { status: 'DROPPED' }
    })
    revalidatePath(`/admin/students/${studentId}`)
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
    await prisma.payment.create({
      data: {
        studentId: data.studentId,
        classId: data.classId,
        totalAmount: data.totalAmount,
        paidAmount: data.paidAmount,
        remainingAmount: data.totalAmount - data.paidAmount,
        paymentMethod: data.paymentMethod as any,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        paymentDate: data.paidAmount > 0 ? new Date() : null,
        status: data.paidAmount === 0 ? 'UNPAID' : data.paidAmount >= data.totalAmount ? 'PAID' : 'PARTIAL',
        note: data.note,
        createdById: "system", // TODO: use real user
      }
    })
    revalidatePath(`/admin/students/${data.studentId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Có lỗi xảy ra" }
  }
}
