"use server"

import { prisma } from "@/lib/prisma"
import { studentSchema, type StudentFormValues } from "@/lib/schemas/student"
import { revalidatePath } from "next/cache"

export async function upsertStudent(data: StudentFormValues) {
  try {
    const parsedData = studentSchema.parse(data)
    
    if (parsedData.id) {
      // Update
      await prisma.user.update({
        where: { id: parsedData.id },
        data: {
          fullName: parsedData.fullName,
          email: parsedData.email,
          phone: parsedData.phone,
          status: parsedData.status as any,
        }
      })
    } else {
      // Create
      // Find role STUDENT
      const studentRole = await prisma.role.findUnique({
        where: { code: 'STUDENT' }
      })

      if (!studentRole) {
        return { success: false, error: "Không tìm thấy quyền STUDENT trong hệ thống" }
      }

      await prisma.user.create({
        data: {
          fullName: parsedData.fullName,
          email: parsedData.email,
          phone: parsedData.phone,
          status: parsedData.status as any,
          roleId: studentRole.id,
          passwordHash: "dummy_hash_for_now" // Should integrate Supabase Admin API to create auth user
        }
      })
    }

    revalidatePath("/admin/students")
    return { success: true }
  } catch (error: unknown) {
    console.error("Student upsert error:", error)
    if ((error as any).code === 'P2002') {
       return { success: false, error: "Email này đã được sử dụng" }
    }
    return { success: false, error: (error as any).message || "Có lỗi xảy ra" }
  }
}
