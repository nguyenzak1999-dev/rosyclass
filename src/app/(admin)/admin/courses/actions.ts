"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { courseSchema, type CourseFormValues } from "@/lib/schemas/course"
import { revalidatePath } from "next/cache"

export async function upsertCourse(data: CourseFormValues) {
  try {
    await requirePermission(PERMISSIONS.coursesWrite)
    const parsedData = courseSchema.parse(data)
    
    if (parsedData.id) {
      // Update
      await prisma.course.update({
        where: { id: parsedData.id },
        data: {
          name: parsedData.name,
          slug: parsedData.slug,
          level: parsedData.level,
          description: parsedData.description,
          targetAudience: parsedData.targetAudience,
          learningOutcomes: parsedData.learningOutcomes,
          tuitionFee: parsedData.tuitionFee,
          salePrice: parsedData.salePrice,
          thumbnail: parsedData.thumbnail,
          totalSessions: parsedData.totalSessions,
          sessionDurationMinutes: parsedData.sessionDurationMinutes,
          isPublished: parsedData.isPublished,
          status: parsedData.status,
        }
      })
    } else {
      // Create
      await prisma.course.create({
        data: {
          name: parsedData.name,
          slug: parsedData.slug,
          level: parsedData.level,
          description: parsedData.description,
          targetAudience: parsedData.targetAudience,
          learningOutcomes: parsedData.learningOutcomes,
          tuitionFee: parsedData.tuitionFee,
          salePrice: parsedData.salePrice,
          thumbnail: parsedData.thumbnail,
          totalSessions: parsedData.totalSessions,
          sessionDurationMinutes: parsedData.sessionDurationMinutes,
          isPublished: parsedData.isPublished,
          status: parsedData.status,
        }
      })
    }

    revalidatePath("/admin/courses")
    revalidatePath("/khoa-hoc")
    revalidatePath(`/khoa-hoc/${parsedData.slug}`)
    return { success: true }
  } catch (error: unknown) {
    console.error("Course upsert error:", error)
    if ((error as any).code === 'P2002') {
       return { success: false, error: "Đường dẫn (slug) này đã tồn tại" }
    }
    return { success: false, error: (error as any).message || "Có lỗi xảy ra" }
  }
}

export async function deleteCourse(id: string) {
  try {
    await requirePermission(PERMISSIONS.coursesWrite)
    await prisma.course.delete({
      where: { id }
    })
    revalidatePath("/admin/courses")
    return { success: true }
  } catch (error: unknown) {
    console.error("Course delete error:", error)
    return { success: false, error: "Không thể xóa khóa học này" }
  }
}
