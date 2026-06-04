"use server"

import { prisma } from "@/lib/prisma"
import { teacherSchema, type TeacherFormValues } from "@/lib/schemas/teacher"
import { revalidatePath } from "next/cache"

export async function upsertTeacher(data: TeacherFormValues) {
  try {
    const parsedData = teacherSchema.parse(data)
    
    // Find role
    const role = await prisma.role.findUnique({
      where: { code: parsedData.roleCode }
    })

    if (!role) {
      return { success: false, error: "Không tìm thấy quyền này trong hệ thống" }
    }

    if (parsedData.id) {
      // Update
      const user = await prisma.user.update({
        where: { id: parsedData.id },
        data: {
          fullName: parsedData.fullName,
          email: parsedData.email,
          phone: parsedData.phone,
          status: parsedData.status as any,
          roleId: role.id,
          avatar: parsedData.avatar
        }
      })

      if (parsedData.roleCode === "TEACHER") {
        await prisma.teacher.upsert({
          where: { userId: user.id },
          update: {
            fullName: parsedData.fullName,
            phone: parsedData.phone || "",
            email: parsedData.email,
            avatar: parsedData.avatar,
            bio: parsedData.bio,
            specialties: parsedData.specialties,
            certificates: parsedData.certificates
          },
          create: {
            userId: user.id,
            fullName: parsedData.fullName,
            phone: parsedData.phone || "",
            email: parsedData.email,
            avatar: parsedData.avatar,
            bio: parsedData.bio,
            specialties: parsedData.specialties,
            certificates: parsedData.certificates
          }
        })
      }
    } else {
      // Create
      const user = await prisma.user.create({
        data: {
          fullName: parsedData.fullName,
          email: parsedData.email,
          phone: parsedData.phone,
          status: parsedData.status as any,
          roleId: role.id,
          avatar: parsedData.avatar,
          passwordHash: "dummy_hash_for_now"
        }
      })

      if (parsedData.roleCode === "TEACHER") {
        await prisma.teacher.create({
          data: {
            userId: user.id,
            fullName: parsedData.fullName,
            phone: parsedData.phone || "",
            email: parsedData.email,
            avatar: parsedData.avatar,
            bio: parsedData.bio,
            specialties: parsedData.specialties,
            certificates: parsedData.certificates
          }
        })
      }
    }

    revalidatePath("/admin/teachers")
    return { success: true }
  } catch (error: unknown) {
    console.error("Teacher upsert error:", error)
    if ((error as any).code === 'P2002') {
       return { success: false, error: "Email này đã được sử dụng" }
    }
    return { success: false, error: (error as any).message || "Có lỗi xảy ra" }
  }
}
