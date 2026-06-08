"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { courseSchema, type CourseFormValues } from "@/lib/schemas/course"
import { revalidatePath } from "next/cache"
import { getErrorMessage, isPrismaUniqueError } from "@/lib/errors"

export async function upsertCourse(data: CourseFormValues) {
  try {
    await requirePermission(PERMISSIONS.coursesWrite)
    const parsedData = courseSchema.parse(data)

    const payload = {
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

    if (parsedData.id) {
      await prisma.course.update({ where: { id: parsedData.id }, data: payload })
    } else {
      await prisma.course.create({ data: payload })
    }

    revalidatePath("/admin/courses")
    revalidatePath("/khoa-hoc")
    revalidatePath(`/khoa-hoc/${parsedData.slug}`)
    return { success: true }
  } catch (error: unknown) {
    console.error("Course upsert error:", error)
    if (isPrismaUniqueError(error)) {
      return { success: false, error: "Đường dẫn (slug) này đã tồn tại" }
    }
    return { success: false, error: getErrorMessage(error) }
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
