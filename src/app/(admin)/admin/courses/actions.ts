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
      name: parsedData.name.trim(),
      slug: parsedData.slug.trim(),
      level: parsedData.level,
      // Ô để trống lưu null (không lưu chuỗi rỗng, website kiểm tra null để ẩn mục)
      description: parsedData.description || null,
      targetAudience: parsedData.targetAudience || null,
      learningOutcomes: parsedData.learningOutcomes || null,
      tuitionFee: parsedData.tuitionFee,
      salePrice: parsedData.salePrice || null,
      sessionFee: parsedData.sessionFee || null,
      thumbnail: parsedData.thumbnail || null,
      totalSessions: parsedData.totalSessions,
      sessionDurationMinutes: parsedData.sessionDurationMinutes,
      isPublished: parsedData.isPublished,
      status: parsedData.status,
    }

    if (parsedData.id) {
      const previous = await prisma.course.findUnique({ where: { id: parsedData.id }, select: { slug: true } })
      await prisma.course.update({ where: { id: parsedData.id }, data: payload })
      // Đổi slug: trang cũ cũng phải làm mới
      if (previous && previous.slug !== payload.slug) revalidatePath(`/khoa-hoc/${previous.slug}`)
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
    const course = await prisma.course.findUnique({
      where: { id },
      select: { slug: true, _count: { select: { classes: true, payments: true } } }
    })
    if (!course) return { success: false, error: "Không tìm thấy khóa học" }
    if (course._count.classes > 0 || course._count.payments > 0) {
      return {
        success: false,
        error: `Khóa học đang có ${course._count.classes} lớp và ${course._count.payments} phiếu thu. Hãy chuyển trạng thái sang "Khóa" thay vì xoá.`
      }
    }
    await prisma.course.delete({
      where: { id }
    })
    revalidatePath("/admin/courses")
    revalidatePath("/khoa-hoc")
    revalidatePath(`/khoa-hoc/${course.slug}`)
    return { success: true }
  } catch (error: unknown) {
    console.error("Course delete error:", error)
    return { success: false, error: "Không thể xóa khóa học này" }
  }
}
