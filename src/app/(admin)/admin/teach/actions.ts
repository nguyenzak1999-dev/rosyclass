"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { getErrorMessage } from "@/lib/errors"
import { PRAISE_TAGS } from "@/lib/curriculum"
import { teachSessionSchema, type TeachSessionValues } from "@/lib/schemas/curriculum"

/**
 * Lưu màn hình "Lên lớp": điểm danh + sao/khen/cảm xúc/nhận xét của từng bé.
 *
 * Điểm danh làm giống markAttendance: upsert theo (sessionId, studentId) và chuyển buổi
 * SCHEDULED → COMPLETED khi mọi học viên đang học đều đã có điểm danh. Ghi chú điểm danh
 * nhập ở trang Điểm danh được giữ nguyên. Không dùng $transaction vì D1 không đảm bảo
 * tính nguyên tử; mọi thao tác đều là upsert nên lưu lại lần nữa là an toàn.
 */
export async function saveTeachSession(data: TeachSessionValues) {
  try {
    const user = await requirePermission(PERMISSIONS.attendanceWrite)
    const parsed = teachSessionSchema.parse(data)

    const session = await prisma.classSession.findUnique({
      where: { id: parsed.sessionId },
      select: { id: true, classId: true, status: true },
    })
    if (!session) return { success: false, error: "Không tìm thấy buổi học" }
    if (session.status === "CANCELLED") {
      return { success: false, error: "Buổi học đã bị huỷ, không thể điểm danh" }
    }

    // Chỉ nhận học viên đang học trong lớp hoặc đã được xếp học bù vào buổi này
    const [activeStudents, bookedAttendances] = await Promise.all([
      prisma.classStudent.findMany({
        where: { classId: session.classId, status: "ACTIVE" },
        select: { studentId: true },
      }),
      prisma.attendance.findMany({ where: { sessionId: session.id }, select: { studentId: true } }),
    ])
    const activeIds = new Set(activeStudents.map((row) => row.studentId))
    const allowedIds = new Set([...activeIds, ...bookedAttendances.map((row) => row.studentId)])

    const attendances = parsed.attendances.filter((row) => allowedIds.has(row.studentId))
    const feedbacks = parsed.feedbacks.filter((row) => allowedIds.has(row.studentId))

    for (const row of attendances) {
      await prisma.attendance.upsert({
        where: { sessionId_studentId: { sessionId: session.id, studentId: row.studentId } },
        create: { sessionId: session.id, studentId: row.studentId, status: row.status },
        update: { status: row.status },
      })
    }

    for (const row of feedbacks) {
      const values = {
        stars: row.stars,
        // Giữ thứ tự cố định của các câu khen mẫu, câu tự nhập (nếu có) để sau cùng
        praises: JSON.stringify(Array.from(new Set(row.praises)).sort((a, b) => rank(a) - rank(b))),
        mood: row.mood || null,
        comment: row.comment || null,
      }
      await prisma.sessionFeedback.upsert({
        where: { sessionId_studentId: { sessionId: session.id, studentId: row.studentId } },
        create: { ...values, sessionId: session.id, studentId: row.studentId, createdById: user.id },
        update: values,
      })
    }

    let completed = false
    if (session.status === "SCHEDULED" && activeIds.size > 0) {
      const recorded = await prisma.attendance.count({
        where: { sessionId: session.id, studentId: { in: Array.from(activeIds) } },
      })
      if (recorded >= activeIds.size) {
        await prisma.classSession.update({ where: { id: session.id }, data: { status: "COMPLETED" } })
        completed = true
      }
    }

    revalidatePath(`/admin/teach`)
    revalidatePath(`/admin/teach/${session.id}`)
    revalidatePath(`/admin/attendance/${session.id}`)
    revalidatePath(`/admin/schedules/${session.id}`)
    revalidatePath(`/admin/schedules`)
    revalidatePath(`/admin/classes/${session.classId}`)

    return {
      success: true,
      data: { attendanceCount: attendances.length, feedbackCount: feedbacks.length, completed },
    }
  } catch (error) {
    console.error("Save teach session error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể lưu buổi học") }
  }
}

function rank(praise: string) {
  const index = PRAISE_TAGS.indexOf(praise as (typeof PRAISE_TAGS)[number])
  return index === -1 ? PRAISE_TAGS.length : index
}
