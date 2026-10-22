"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { getErrorMessage, isPrismaUniqueError } from "@/lib/errors"
import { parseVietnamDateKey } from "@/lib/curriculum"
import {
  homeworkSchema,
  recordInClassSchema,
  reviewSubmissionSchema,
  type HomeworkFormValues,
  type RecordInClassValues,
  type ReviewSubmissionValues,
} from "@/lib/schemas/homework"

function revalidateHomework(classId: string, sessionId?: string | null) {
  revalidatePath("/admin/homework")
  revalidatePath(`/admin/classes/${classId}`)
  if (sessionId) revalidatePath(`/admin/teach/${sessionId}`)
}

export async function upsertHomework(data: HomeworkFormValues) {
  try {
    const user = await requirePermission(PERMISSIONS.attendanceWrite)
    const parsed = homeworkSchema.parse(data)

    const classExists = await prisma.class.findUnique({ where: { id: parsed.classId }, select: { id: true } })
    if (!classExists) return { success: false, error: "Không tìm thấy lớp học" }

    let lessonId = parsed.lessonId
    if (parsed.sessionId) {
      const session = await prisma.classSession.findUnique({
        where: { id: parsed.sessionId },
        select: { classId: true, lessonId: true },
      })
      if (!session || session.classId !== parsed.classId) return { success: false, error: "Buổi học không thuộc lớp này" }
      lessonId = lessonId ?? session.lessonId
    }
    if (lessonId) {
      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } })
      if (!lesson) lessonId = null
    }

    const values = {
      title: parsed.title,
      instructions: parsed.instructions,
      kind: parsed.kind,
      dueDate: parseVietnamDateKey(parsed.dueDate),
      sessionId: parsed.sessionId,
      lessonId,
    }

    let homework
    if (parsed.id) {
      const existing = await prisma.homework.findUnique({ where: { id: parsed.id }, select: { classId: true } })
      if (!existing || existing.classId !== parsed.classId) return { success: false, error: "Không tìm thấy bài tập" }
      homework = await prisma.homework.update({ where: { id: parsed.id }, data: values })
    } else {
      homework = await prisma.homework.create({ data: { ...values, classId: parsed.classId, createdById: user.id } })
    }

    revalidateHomework(parsed.classId, parsed.sessionId)
    return { success: true, data: { id: homework.id } }
  } catch (error) {
    console.error("Upsert homework error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể lưu bài tập") }
  }
}

export async function deleteHomework(id: string) {
  try {
    await requirePermission(PERMISSIONS.attendanceWrite)
    const homework = await prisma.homework.findUnique({ where: { id }, select: { classId: true, sessionId: true } })
    if (!homework) return { success: false, error: "Không tìm thấy bài tập" }

    // Bài nộp bị xoá theo (ON DELETE CASCADE); file trên Cloudinary được giữ lại
    await prisma.homework.delete({ where: { id } })
    revalidateHomework(homework.classId, homework.sessionId)
    return { success: true }
  } catch (error) {
    console.error("Delete homework error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể xoá bài tập") }
  }
}

/** Chấm bài: sticker + một câu nhận xét → Đã chấm (chấm lại được) */
export async function reviewSubmission(data: ReviewSubmissionValues) {
  try {
    const user = await requirePermission(PERMISSIONS.attendanceWrite)
    const parsed = reviewSubmissionSchema.parse(data)
    if (!parsed.sticker && !parsed.teacherComment) {
      return { success: false, error: "Chọn một sticker hoặc viết nhận xét cho bé" }
    }

    const submission = await prisma.homeworkSubmission.findUnique({
      where: { id: parsed.submissionId },
      select: { id: true, homework: { select: { classId: true, sessionId: true } } },
    })
    if (!submission) return { success: false, error: "Không tìm thấy bài nộp" }

    await prisma.homeworkSubmission.update({
      where: { id: submission.id },
      data: {
        sticker: parsed.sticker,
        teacherComment: parsed.teacherComment,
        status: "REVIEWED",
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
    })

    revalidateHomework(submission.homework.classId, submission.homework.sessionId)
    return { success: true }
  } catch (error) {
    console.error("Review submission error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể chấm bài") }
  }
}

/**
 * Ghi nhận các bé đã làm bài trên lớp (không có ảnh/ghi âm).
 * Bé đã có bài nộp thì giữ nguyên bài của phụ huynh, không ghi đè.
 */
export async function recordInClassCompletion(data: RecordInClassValues) {
  try {
    const user = await requirePermission(PERMISSIONS.attendanceWrite)
    const parsed = recordInClassSchema.parse(data)

    const homework = await prisma.homework.findUnique({
      where: { id: parsed.homeworkId },
      select: { id: true, classId: true, sessionId: true },
    })
    if (!homework) return { success: false, error: "Không tìm thấy bài tập" }

    const [members, existing] = await Promise.all([
      prisma.classStudent.findMany({ where: { classId: homework.classId }, select: { studentId: true } }),
      prisma.homeworkSubmission.findMany({ where: { homeworkId: homework.id }, select: { studentId: true } }),
    ])
    const memberIds = new Set(members.map((row) => row.studentId))
    const submittedIds = new Set(existing.map((row) => row.studentId))

    let created = 0
    let skipped = 0
    const now = new Date()
    for (const studentId of new Set(parsed.studentIds)) {
      if (!memberIds.has(studentId)) continue
      if (submittedIds.has(studentId)) {
        skipped++
        continue
      }
      try {
        await prisma.homeworkSubmission.create({
          data: {
            homeworkId: homework.id,
            studentId,
            submittedBy: "TEACHER",
            sticker: parsed.sticker,
            status: "REVIEWED",
            reviewedById: user.id,
            reviewedAt: now,
          },
        })
        created++
      } catch (error) {
        // Phụ huynh vừa nộp đúng lúc này
        if (!isPrismaUniqueError(error)) throw error
        skipped++
      }
    }

    revalidateHomework(homework.classId, homework.sessionId)
    return { success: true, data: { created, skipped } }
  } catch (error) {
    console.error("Record in-class homework error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể ghi nhận bài tập") }
  }
}
