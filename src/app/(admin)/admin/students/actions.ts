"use server"

import { prisma } from "@/lib/prisma"
import { studentSchema, type StudentFormValues } from "@/lib/schemas/student"
import { revalidatePath } from "next/cache"

export async function upsertStudent(data: StudentFormValues) {
  try {
    const parsedData = studentSchema.parse(data)
    
    if (parsedData.id) {
      // Update
      await prisma.student.update({
        where: { id: parsedData.id },
        data: {
          fullName: parsedData.fullName,
          email: parsedData.email,
          phone: parsedData.phone,
          dateOfBirth: parsedData.dateOfBirth,
          gender: parsedData.gender,
          address: parsedData.address,
          currentLevel: parsedData.currentLevel,
          learningGoal: parsedData.learningGoal,
          source: parsedData.source,
          status: parsedData.status as any,
          notes: parsedData.notes,
          parentId: parsedData.parentId,
        }
      })
    } else {
      // Create
      await prisma.student.create({
        data: {
          fullName: parsedData.fullName,
          email: parsedData.email,
          phone: parsedData.phone,
          dateOfBirth: parsedData.dateOfBirth,
          gender: parsedData.gender,
          address: parsedData.address,
          currentLevel: parsedData.currentLevel,
          learningGoal: parsedData.learningGoal,
          source: parsedData.source,
          status: parsedData.status as any,
          notes: parsedData.notes,
          parentId: parsedData.parentId,
        }
      })
    }

    revalidatePath("/admin/students")
    return { success: true }
  } catch (error: unknown) {
    console.error("Student upsert error:", error)
    if ((error as any).code === 'P2002') {
       return { success: false, error: "Dữ liệu này đã tồn tại" }
    }
    return { success: false, error: (error as any).message || "Có lỗi xảy ra" }
  }
}

export async function deleteStudent(id: string) {
  try {
    await prisma.student.delete({
      where: { id }
    })
    revalidatePath("/admin/students")
    return { success: true }
  } catch (error: unknown) {
    console.error("Student delete error:", error)
    return { success: false, error: "Không thể xóa học viên này" }
  }
}
