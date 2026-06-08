"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import {
  markAttendanceSchema,
  createMakeUpSessionSchema,
  scoreSchema,
  type MarkAttendanceFormValues,
  type CreateMakeUpSessionFormValues,
  type ScoreFormValues,
} from "@/lib/schemas/attendance"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/errors"

/**
 * Lưu điểm danh hàng loạt cho 1 buổi học.
 * - Upsert từng HV (idempotent nhờ @@unique)
 * - Nếu tất cả HV đã điểm danh → set session.status = COMPLETED
 * - HV đã DROPPED khỏi ClassStudent → bỏ qua (UI đã filter)
 */
export async function markAttendance(data: MarkAttendanceFormValues) {
  try {
    await requirePermission(PERMISSIONS.attendanceWrite)
    const parsed = markAttendanceSchema.parse(data)

    const session = await prisma.classSession.findUnique({
      where: { id: parsed.sessionId },
      select: {
        id: true,
        classId: true,
        status: true,
        _count: { select: { attendances: true } },
      },
    })
    if (!session) {
      return { success: false, error: "Không tìm thấy buổi học" }
    }
    if (session.status === "CANCELLED") {
      return {
        success: false,
        error: "Buổi học đã bị huỷ, không thể điểm danh",
      }
    }

    // Lấy tổng số HV ACTIVE trong lớp
    const totalActiveStudents = await prisma.classStudent.count({
      where: { classId: session.classId, status: "ACTIVE" },
    })

    // Lưu từng attendance (upsert)
    // Dùng transaction để đảm bảo all-or-nothing
    await prisma.$transaction(
      parsed.attendances.map((row) =>
        prisma.attendance.upsert({
          where: {
            sessionId_studentId: {
              sessionId: session.id,
              studentId: row.studentId,
            },
          },
          create: {
            sessionId: session.id,
            studentId: row.studentId,
            status: row.status,
            note: row.note || null,
          },
          update: {
            status: row.status,
            note: row.note || null,
          },
        })
      )
    )

    // Nếu đã điểm danh đủ số HV ACTIVE → set session COMPLETED
    if (
      totalActiveStudents > 0 &&
      parsed.attendances.length >= totalActiveStudents &&
      session.status === "SCHEDULED"
    ) {
      await prisma.classSession.update({
        where: { id: session.id },
        data: { status: "COMPLETED" },
      })
    }

    revalidatePath(`/admin/attendance/${session.id}`)
    revalidatePath(`/admin/schedules/${session.id}`)
    revalidatePath(`/admin/schedules`)
    revalidatePath(`/admin/classes/${session.classId}`)

    return {
      success: true,
      data: { count: parsed.attendances.length },
    }
  } catch (error) {
    console.error("Mark attendance error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể lưu điểm danh") }
  }
}

/**
 * Tạo buổi make-up (phụ đạo) cho 1 lớp.
 * Copy teacher/room/scheduleId từ session gốc.
 */
export async function createMakeUpSession(data: CreateMakeUpSessionFormValues) {
  try {
    await requirePermission(PERMISSIONS.schedulesWrite)
    const parsed = createMakeUpSessionSchema.parse(data)

    const original = await prisma.classSession.findUnique({
      where: { id: parsed.originalSessionId },
      select: {
        id: true,
        classId: true,
        teacherId: true,
        roomId: true,
        scheduleId: true,
      },
    })
    if (!original) {
      return { success: false, error: "Không tìm thấy buổi học gốc" }
    }

    // Tạo buổi make-up — Prisma sẽ reject nếu trùng (classId, sessionDate, startTime)
    const makeUp = await prisma.classSession.create({
      data: {
        classId: original.classId,
        scheduleId: original.scheduleId,
        teacherId: original.teacherId,
        roomId: original.roomId,
        sessionDate: new Date(parsed.sessionDate),
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        status: "MAKE_UP",
        topic: parsed.topic
          ? `[Phụ đạo] ${parsed.topic}`
          : "[Phụ đạo]",
      },
    })

    // Tạo sẵn attendance MAKE_UP cho tất cả HV ACTIVE trong lớp
    const activeStudents = await prisma.classStudent.findMany({
      where: { classId: original.classId, status: "ACTIVE" },
      select: { studentId: true },
    })
    if (activeStudents.length > 0) {
      await prisma.attendance.createMany({
        data: activeStudents.map((s) => ({
          sessionId: makeUp.id,
          studentId: s.studentId,
          status: "MAKE_UP" as const,
        })),
      })
    }

    revalidatePath(`/admin/classes/${original.classId}`)
    revalidatePath(`/admin/schedules`)
    return { success: true, data: { id: makeUp.id } }
  } catch (error) {
    console.error("Create make-up session error:", error)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return {
        success: false,
        error: "Đã có buổi học khác cùng giờ cho lớp này. Vui lòng chọn giờ khác.",
      }
    }
    return {
      success: false,
      error: getErrorMessage(error, "Không thể tạo buổi phụ đạo"),
    }
  }
}

/**
 * Lưu/cập nhật 1 điểm số cho HV.
 */
export async function upsertScore(data: ScoreFormValues) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)
    const parsed = scoreSchema.parse(data)

    if (parsed.value > parsed.maxValue) {
      return { success: false, error: "Điểm không được vượt quá điểm tối đa" }
    }

    if (parsed.id) {
      await prisma.score.update({
        where: { id: parsed.id },
        data: {
          type: parsed.type,
          value: parsed.value,
          maxValue: parsed.maxValue,
          note: parsed.note || null,
          date: parsed.date || undefined,
          sessionId: parsed.sessionId || null,
        },
      })
    } else {
      await prisma.score.create({
        data: {
          studentId: parsed.studentId,
          classId: parsed.classId,
          sessionId: parsed.sessionId || null,
          type: parsed.type,
          value: parsed.value,
          maxValue: parsed.maxValue,
          note: parsed.note || null,
          date: parsed.date || new Date(),
        },
      })
    }

    revalidatePath(`/admin/classes/${parsed.classId}`)
    revalidatePath(`/admin/students/${parsed.studentId}`)
    return { success: true }
  } catch (error) {
    console.error("Upsert score error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể lưu điểm") }
  }
}

/**
 * Xoá 1 score record.
 */
export async function deleteScore(id: string, classId: string) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)
    await prisma.score.delete({ where: { id } })
    revalidatePath(`/admin/classes/${classId}`)
    return { success: true }
  } catch (error) {
    console.error("Delete score error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể xoá điểm") }
  }
}
