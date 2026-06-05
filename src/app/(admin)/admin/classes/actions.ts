"use server"

import { prisma } from "@/lib/prisma"
import { classSchema, type ClassFormValues } from "@/lib/schemas/class"
import { revalidatePath } from "next/cache"

export async function upsertClass(data: ClassFormValues) {
  try {
    const parsedData = classSchema.parse(data)
    
    if (parsedData.id) {
      await prisma.class.update({
        where: { id: parsedData.id },
        data: { ...parsedData }
      })
    } else {
      await prisma.class.create({
        data: { ...parsedData }
      })
    }

    revalidatePath("/admin/classes")
    return { success: true }
  } catch (error: unknown) {
    console.error("Class upsert error:", error)
    return { success: false, error: (error as any).message || "Có lỗi xảy ra" }
  }
}

export async function deleteClass(id: string) {
  try {
    await prisma.class.delete({ where: { id } })
    revalidatePath("/admin/classes")
    return { success: true }
  } catch (error: unknown) {
    console.error("Class delete error:", error)
    return { success: false, error: "Không thể xóa lớp học này" }
  }
}

export async function addStudentToClass(classId: string, studentId: string) {
  try {
    // Check if already in class
    const existing = await prisma.classStudent.findUnique({
      where: {
        classId_studentId: { classId, studentId }
      }
    })
    
    if (existing) {
      return { success: false, error: "Học viên này đã ở trong lớp" }
    }

    // Check class capacity
    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: { students: { where: { status: 'ACTIVE' } } }
        }
      }
    })

    if (!targetClass) {
      return { success: false, error: "Không tìm thấy lớp học" }
    }

    if (targetClass._count.students >= targetClass.maxStudents) {
      return { success: false, error: "Lớp đã đủ sĩ số tối đa, không thể xếp thêm học viên!" }
    }

    await prisma.classStudent.create({
      data: { classId, studentId }
    })
    
    revalidatePath(`/admin/classes/${classId}`)
    return { success: true }
  } catch (error) {
    console.error("Add student to class error:", error)
    return { success: false, error: "Có lỗi xảy ra khi thêm học viên" }
  }
}

export async function removeStudentFromClass(classId: string, studentId: string) {
  try {
    await prisma.classStudent.delete({
      where: {
        classId_studentId: { classId, studentId }
      }
    })
    
    revalidatePath(`/admin/classes/${classId}`)
    return { success: true }
  } catch (error) {
    console.error("Remove student from class error:", error)
    return { success: false, error: "Có lỗi xảy ra khi xóa học viên khỏi lớp" }
  }
}
