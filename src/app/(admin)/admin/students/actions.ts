"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { studentSchema, type StudentFormValues } from "@/lib/schemas/student"
import { revalidatePath } from "next/cache"
import { getErrorMessage, isPrismaUniqueError } from "@/lib/errors"
import type { Prisma } from "@prisma/client"

export async function upsertStudent(data: StudentFormValues) {
  try {
    await requirePermission(PERMISSIONS.studentsWrite)
    const parsedData = studentSchema.parse(data)

    const payload: Prisma.StudentUncheckedCreateInput = {
      fullName: parsedData.fullName,
      email: parsedData.email,
      phone: parsedData.phone,
      dateOfBirth: parsedData.dateOfBirth,
      gender: parsedData.gender,
      address: parsedData.address,
      currentLevel: parsedData.currentLevel,
      learningGoal: parsedData.learningGoal,
      source: parsedData.source,
      status: parsedData.status,
      notes: parsedData.notes,
      parentId: parsedData.parentId,
    }

    if (parsedData.id) {
      await prisma.student.update({ where: { id: parsedData.id }, data: payload })
    } else {
      await prisma.student.create({ data: payload })
    }

    revalidatePath("/admin/students")
    return { success: true }
  } catch (error: unknown) {
    console.error("Student upsert error:", error)
    if (isPrismaUniqueError(error)) {
      return { success: false, error: "Dữ liệu này đã tồn tại" }
    }
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteStudent(id: string) {
  try {
    await requirePermission(PERMISSIONS.studentsWrite)
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
