"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { studentSchema, type StudentFormValues } from "@/lib/schemas/student"
import { revalidatePath } from "next/cache"
import { getErrorMessage, isPrismaUniqueError } from "@/lib/errors"
import type { Prisma } from "@/generated/prisma/client"

export async function generateStudentCode() {
  await requirePermission(PERMISSIONS.studentsWrite)
  const lastStudent = await prisma.student.findFirst({
    where: {
      code: {
        startsWith: "HV",
      },
    },
    orderBy: {
      code: "desc",
    },
  })

  let nextNum = 1
  if (lastStudent && lastStudent.code) {
    const match = lastStudent.code.match(/HV(\d+)/)
    if (match) {
      nextNum = parseInt(match[1], 10) + 1
    }
  }

  return `HV${String(nextNum).padStart(4, "0")}`
}

/** "" → null để xoá được giá trị; undefined giữ nguyên (form không gửi trường đó) */
function optionalText(value: string | null | undefined) {
  if (value === undefined) return undefined
  return value?.trim() || null
}

export async function upsertStudent(data: StudentFormValues) {
  try {
    await requirePermission(PERMISSIONS.studentsWrite)
    const parsedData = studentSchema.parse(data)

    const payload: Prisma.StudentUncheckedCreateInput = {
      fullName: parsedData.fullName.trim(),
      email: optionalText(parsedData.email),
      phone: optionalText(parsedData.phone),
      dateOfBirth: parsedData.dateOfBirth,
      gender: optionalText(parsedData.gender),
      address: optionalText(parsedData.address),
      currentLevel: optionalText(parsedData.currentLevel),
      learningGoal: optionalText(parsedData.learningGoal),
      source: optionalText(parsedData.source),
      status: parsedData.status,
      notes: optionalText(parsedData.notes),
      parentId: parsedData.parentId,
      tuitionDiscountPercent: parsedData.tuitionDiscountPercent,
      code: parsedData.code || undefined,
    }

    if (parsedData.id) {
      await prisma.student.update({ where: { id: parsedData.id }, data: payload })
    } else {
      if (payload.code) {
        await prisma.student.create({ data: payload })
      } else {
        // Hai người thêm cùng lúc có thể sinh trùng mã: thử lại với mã mới
        for (let attempt = 0; ; attempt++) {
          try {
            await prisma.student.create({ data: { ...payload, code: await generateStudentCode() } })
            break
          } catch (error) {
            if (!isPrismaUniqueError(error) || attempt >= 2) throw error
          }
        }
      }
    }

    revalidatePath("/admin/students")
    if (parsedData.id) revalidatePath(`/admin/students/${parsedData.id}`)
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
    // Phiếu thu giữ khoá ngoại RESTRICT tới học viên: báo rõ thay vì lỗi chung chung
    const paymentCount = await prisma.payment.count({ where: { studentId: id } })
    if (paymentCount > 0) {
      return { success: false, error: `Học viên còn ${paymentCount} phiếu thu học phí, hãy xoá các phiếu thu trước (hoặc chuyển trạng thái sang "Đã nghỉ")` }
    }
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
