"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { classSchema, type ClassFormValues } from "@/lib/schemas/class"
import { notifyAdmins } from "@/app/(admin)/admin/notifications/actions"
import {
  cancelSessionSchema,
  generateSessionsSchema,
  scheduleSchema,
  updateSessionSchema,
  type CancelSessionFormValues,
  type GenerateSessionsFormValues,
  type ScheduleFormValues,
  type UpdateSessionFormValues,
} from "@/lib/schemas/schedule"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/errors"

export async function upsertClass(data: ClassFormValues) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)
    const parsedData = classSchema.parse(data)

    if (parsedData.id) {
      await prisma.class.update({
        where: { id: parsedData.id },
        data: { ...parsedData }
      })
    } else {
      await prisma.class.create({
        data: { ...parsedData }
      })
    }

    revalidatePath("/admin/classes")
    return { success: true }
  } catch (error: unknown) {
    console.error("Class upsert error:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteClass(id: string) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)
    await prisma.class.delete({ where: { id } })
    revalidatePath("/admin/classes")
    return { success: true }
  } catch (error: unknown) {
    console.error("Class delete error:", error)
    return { success: false, error: "Không thể xóa lớp học này" }
  }
}

export async function addStudentToClass(classId: string, studentId: string) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)
    // Check if already in class
    const existing = await prisma.classStudent.findUnique({
      where: {
        classId_studentId: { classId, studentId }
      }
    })
    
    if (existing) {
      return { success: false, error: "Học viên này đã ở trong lớp" }
    }

    // Check class capacity
    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: { students: { where: { status: 'ACTIVE' } } }
        }
      }
    })

    if (!targetClass) {
      return { success: false, error: "Không tìm thấy lớp học" }
    }

    if (targetClass._count.students >= targetClass.maxStudents) {
      return { success: false, error: "Lớp đã đủ sĩ số tối đa, không thể xếp thêm học viên!" }
    }

    await prisma.classStudent.create({
      data: { classId, studentId }
    })

    // Notify admins
    const [cls, student] = await Promise.all([
      prisma.class.findUnique({ where: { id: classId }, select: { name: true } }),
      prisma.student.findUnique({ where: { id: studentId }, select: { fullName: true } }),
    ])
    if (cls && student) {
      notifyAdmins(
        "Xếp học viên vào lớp",
        `${student.fullName} vừa được xếp vào lớp ${cls.name}`,
        `/admin/classes/${classId}`
      )
    }

    revalidatePath(`/admin/classes/${classId}`)
    return { success: true }
  } catch (error) {
    console.error("Add student to class error:", error)
    return { success: false, error: "Có lỗi xảy ra khi thêm học viên" }
  }
}

export async function removeStudentFromClass(classId: string, studentId: string) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)
    await prisma.classStudent.delete({
      where: {
        classId_studentId: { classId, studentId }
      }
    })

    revalidatePath(`/admin/classes/${classId}`)
    return { success: true }
  } catch (error) {
    console.error("Remove student from class error:", error)
    return { success: false, error: "Có lỗi xảy ra khi xóa học viên khỏi lớp" }
  }
}

// =====================================================================
// PHASE 1 — SCHEDULE & SESSION MANAGEMENT
// =====================================================================

/**
 * Tạo mới 1 ClassSchedule cho lớp. Nếu không truyền teacherId/roomId, kế thừa từ Class.
 */
export async function createClassSchedule(data: ScheduleFormValues) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)
    const parsed = scheduleSchema.parse(data)

    const cls = await prisma.class.findUnique({
      where: { id: parsed.classId },
      select: { id: true, teacherId: true, roomId: true },
    })
    if (!cls) {
      return { success: false, error: "Không tìm thấy lớp học" }
    }

    await prisma.classSchedule.create({
      data: {
        classId: parsed.classId,
        dayOfWeek: parsed.dayOfWeek,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        teacherId: parsed.teacherId ?? cls.teacherId ?? null,
        roomId: parsed.roomId ?? cls.roomId ?? null,
      },
    })

    revalidatePath(`/admin/classes/${parsed.classId}`)
    return { success: true }
  } catch (error) {
    console.error("Create class schedule error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể tạo lịch học") }
  }
}

/**
 * Cập nhật 1 ClassSchedule.
 */
export async function updateClassSchedule(data: ScheduleFormValues) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)
    const parsed = scheduleSchema.parse(data)
    if (!parsed.id) {
      return { success: false, error: "Thiếu ID lịch học" }
    }

    const existing = await prisma.classSchedule.findUnique({
      where: { id: parsed.id },
      select: { classId: true },
    })
    if (!existing) {
      return { success: false, error: "Không tìm thấy lịch học" }
    }

    await prisma.classSchedule.update({
      where: { id: parsed.id },
      data: {
        dayOfWeek: parsed.dayOfWeek,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        teacherId: parsed.teacherId ?? null,
        roomId: parsed.roomId ?? null,
      },
    })

    revalidatePath(`/admin/classes/${existing.classId}`)
    return { success: true }
  } catch (error) {
    console.error("Update class schedule error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể cập nhật lịch học") }
  }
}

/**
 * Xoá 1 ClassSchedule. KHÔNG cascade xoá sessions đã sinh (giữ sessions cũ).
 */
export async function deleteClassSchedule(scheduleId: string) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)

    const existing = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      select: { classId: true },
    })
    if (!existing) {
      return { success: false, error: "Không tìm thấy lịch học" }
    }

    await prisma.classSchedule.delete({ where: { id: scheduleId } })
    revalidatePath(`/admin/classes/${existing.classId}`)
    return { success: true }
  } catch (error) {
    console.error("Delete class schedule error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể xoá lịch học") }
  }
}

/**
 * Sinh ClassSession từ các ClassSchedule của 1 lớp trong khoảng [fromDate, toDate].
 *
 * Logic:
 * 1. Lấy tất cả ClassSchedule của class
 * 2. Lặp từng ngày trong range, nếu trùng dayOfWeek thì tạo ClassSession
 * 3. Dùng createMany + skipDuplicates để chống trùng (dựa vào @@unique)
 * 4. Nếu replaceExisting=true: xoá SCHEDULED sessions trong range trước (giữ sessions có attendance)
 *
 * Trả về số buổi đã tạo.
 */
export async function generateSessions(data: GenerateSessionsFormValues) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)
    const parsed = generateSessionsSchema.parse(data)

    const cls = await prisma.class.findUnique({
      where: { id: parsed.classId },
      select: { id: true, teacherId: true, roomId: true },
    })
    if (!cls) {
      return { success: false, error: "Không tìm thấy lớp học" }
    }

    const schedules = await prisma.classSchedule.findMany({
      where: { classId: parsed.classId },
    })
    if (schedules.length === 0) {
      return { success: false, error: "Lớp chưa có lịch học cố định nào. Hãy tạo lịch trước." }
    }

    // Chuẩn hoá range: từ 00:00 fromDate đến 23:59 toDate
    const from = new Date(parsed.fromDate)
    from.setHours(0, 0, 0, 0)
    const to = new Date(parsed.toDate)
    to.setHours(23, 59, 59, 999)

    // Nếu replaceExisting, xoá SCHEDULED sessions chưa có attendance
    if (parsed.replaceExisting) {
      const futureScheduled = await prisma.classSession.findMany({
        where: {
          classId: parsed.classId,
          sessionDate: { gte: from, lte: to },
          status: "SCHEDULED",
          attendances: { none: {} },
        },
        select: { id: true },
      })
      if (futureScheduled.length > 0) {
        await prisma.classSession.deleteMany({
          where: { id: { in: futureScheduled.map((s) => s.id) } },
        })
      }
    }

    // Sinh sessions mới
    const toCreate: {
      classId: string
      scheduleId: string
      sessionDate: Date
      startTime: string
      endTime: string
      teacherId: string | null
      roomId: string | null
    }[] = []

    const cursor = new Date(from)
    while (cursor <= to) {
      const dayOfWeek = cursor.getDay() // 0 = CN, 1 = T2, ..., 6 = T7
      const matchingSchedules = schedules.filter((s) => s.dayOfWeek === dayOfWeek)
      for (const schedule of matchingSchedules) {
        toCreate.push({
          classId: cls.id,
          scheduleId: schedule.id,
          sessionDate: new Date(cursor),
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          teacherId: schedule.teacherId ?? cls.teacherId ?? null,
          roomId: schedule.roomId ?? cls.roomId ?? null,
        })
      }
      cursor.setDate(cursor.getDate() + 1)
    }

    if (toCreate.length === 0) {
      return { success: true, data: { count: 0 } }
    }

    const result = await prisma.classSession.createMany({
      data: toCreate,
      skipDuplicates: true, // chống trùng nhờ @@unique
    })

    revalidatePath(`/admin/classes/${parsed.classId}`)
    revalidatePath(`/admin/schedules`)
    return { success: true, data: { count: result.count } }
  } catch (error) {
    console.error("Generate sessions error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể sinh buổi học") }
  }
}

/**
 * Cập nhật 1 ClassSession (đổi ngày/giờ/phòng/giáo viên/topic/notes).
 * Nếu session đã có attendance, vẫn cho sửa nhưng trả về warning.
 */
export async function updateSession(data: UpdateSessionFormValues) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)
    const parsed = updateSessionSchema.parse(data)

    const existing = await prisma.classSession.findUnique({
      where: { id: parsed.id },
      include: { _count: { select: { attendances: true } } },
    })
    if (!existing) {
      return { success: false, error: "Không tìm thấy buổi học" }
    }
    if (existing.status === "CANCELLED") {
      return { success: false, error: "Buổi học đã bị huỷ, không thể sửa" }
    }
    if (existing.status === "COMPLETED" && (parsed.sessionDate || parsed.startTime || parsed.endTime)) {
      return { success: false, error: "Buổi học đã hoàn thành, chỉ sửa được chủ đề/ghi chú" }
    }

    await prisma.classSession.update({
      where: { id: parsed.id },
      data: {
        sessionDate: parsed.sessionDate ?? undefined,
        startTime: parsed.startTime ?? undefined,
        endTime: parsed.endTime ?? undefined,
        roomId: parsed.roomId ?? null,
        teacherId: parsed.teacherId ?? null,
        topic: parsed.topic ?? null,
        notes: parsed.notes ?? null,
      },
    })

    revalidatePath(`/admin/classes/${existing.classId}`)
    revalidatePath(`/admin/schedules`)
    revalidatePath(`/admin/schedules/${existing.id}`)

    const warning =
      existing._count.attendances > 0
        ? "Đã cập nhật buổi học. Lưu ý: buổi này đã có điểm danh."
        : undefined
    return { success: true, data: { warning } }
  } catch (error) {
    console.error("Update session error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể cập nhật buổi học") }
  }
}

/**
 * Huỷ 1 ClassSession. Nếu đã có attendance, vẫn cho huỷ nhưng trả warning.
 */
export async function cancelSession(data: CancelSessionFormValues) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)
    const parsed = cancelSessionSchema.parse(data)

    const existing = await prisma.classSession.findUnique({
      where: { id: parsed.id },
      include: { _count: { select: { attendances: true } } },
    })
    if (!existing) {
      return { success: false, error: "Không tìm thấy buổi học" }
    }
    if (existing.status === "CANCELLED") {
      return { success: false, error: "Buổi học đã được huỷ trước đó" }
    }

    const newNotes = parsed.reason
      ? existing.notes
        ? `${existing.notes}\n[HUỶ] ${parsed.reason}`
        : `[HUỶ] ${parsed.reason}`
      : existing.notes

    await prisma.classSession.update({
      where: { id: parsed.id },
      data: {
        status: "CANCELLED",
        notes: newNotes,
      },
    })

    // Notify admins
    const cls = await prisma.class.findUnique({
      where: { id: existing.classId },
      select: { name: true },
    })
    if (cls) {
      notifyAdmins(
        "Buổi học bị huỷ",
        `Buổi học ngày ${new Date(existing.sessionDate).toLocaleDateString("vi-VN")} của lớp ${cls.name} đã bị huỷ${parsed.reason ? `: ${parsed.reason}` : ""}`,
        `/admin/schedules/${existing.id}`
      )
    }

    revalidatePath(`/admin/classes/${existing.classId}`)
    revalidatePath(`/admin/schedules`)
    revalidatePath(`/admin/schedules/${existing.id}`)

    const warning =
      existing._count.attendances > 0
        ? "Đã huỷ buổi học. Lưu ý: buổi này đã có điểm danh, vui lòng xử lý lại."
        : undefined
    return { success: true, data: { warning } }
  } catch (error) {
    console.error("Cancel session error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể huỷ buổi học") }
  }
}

// =====================================================================
// PHASE 4 — CLASS ARRANGEMENT & TRANSFER
// =====================================================================

export type ClassSuggestion = {
  classId: string
  className: string
  courseName: string
  courseLevel: string
  teacherName: string | null
  branchName: string | null
  roomName: string | null
  currentStudents: number
  maxStudents: number
  score: number
  reason: string
  hasScheduleConflict: boolean
  conflictWith: string | null
}

/**
 * Gợi ý top 5 lớp phù hợp cho 1 học viên.
 *
 * Tiêu chí chấm điểm:
 * - +50 cùng Course.level
 * - +20 cùng Branch
 * - +10 còn slot
 * - -30 trùng dayOfWeek với lớp HV đang học
 * - Lọc bỏ lớp HV đang học (ACTIVE)
 */
export async function suggestClassesForStudent(studentId: string) {
  try {
    await requirePermission(PERMISSIONS.classesRead)

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        fullName: true,
        currentLevel: true,
        classStudents: {
          where: { status: "ACTIVE" },
          include: {
            class: {
              select: {
                id: true,
                branchId: true,
                schedules: { select: { dayOfWeek: true } },
              },
            },
          },
        },
      },
    })
    if (!student) {
      return { success: false, error: "Không tìm thấy học viên" }
    }

    // Tập các dayOfWeek HV đang học + branchIds
    const studentDays = new Set<number>()
    const enrolledClassIds = new Set<string>()
    const studentBranchIds = new Set<string>()
    for (const cs of student.classStudents) {
      enrolledClassIds.add(cs.class.id)
      if (cs.class.branchId) studentBranchIds.add(cs.class.branchId)
      for (const s of cs.class.schedules) {
        studentDays.add(s.dayOfWeek)
      }
    }

    // Lấy tất cả lớp có thể xếp (UPCOMING + ACTIVE)
    const candidates = await prisma.class.findMany({
      where: {
        status: { in: ["UPCOMING", "ACTIVE"] },
        id: { notIn: Array.from(enrolledClassIds) },
      },
      include: {
        course: { select: { name: true, level: true } },
        teacher: { select: { fullName: true } },
        branch: { select: { name: true } },
        room: { select: { name: true } },
        schedules: { select: { dayOfWeek: true } },
        _count: {
          select: { students: { where: { status: "ACTIVE" } } },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Chấm điểm từng lớp
    const suggestions: ClassSuggestion[] = candidates
      .map((cls) => {
        let score = 0
        const reasons: string[] = []

        // +50 cùng level
        if (student.currentLevel && cls.course.level === student.currentLevel) {
          score += 50
          reasons.push(`+ cùng level (${student.currentLevel})`)
        }

        // +20 cùng branch (lấy từ lớp HV đang học)
        if (cls.branchId && studentBranchIds.has(cls.branchId)) {
          score += 20
          reasons.push("+ cùng chi nhánh")
        }

        // +10 còn slot
        const currentStudents = cls._count.students
        const remaining = cls.maxStudents - currentStudents
        if (remaining > 0) {
          score += 10
          reasons.push(`+ còn ${remaining} chỗ trống`)
        }

        // -30 trùng dayOfWeek
        let hasConflict = false
        let conflictWith: string | null = null
        if (studentDays.size > 0) {
          const classDays = cls.schedules.map((s) => s.dayOfWeek)
          const conflicts = classDays.filter((d) => studentDays.has(d))
          if (conflicts.length > 0) {
            score -= 30
            hasConflict = true
            const dayLabel = conflicts
              .map((d) => ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d])
              .join(", ")
            conflictWith = `Trùng ${dayLabel} với lớp đang học`
            reasons.push("- trùng lịch học hiện tại")
          }
        }

        return {
          classId: cls.id,
          className: cls.name,
          courseName: cls.course.name,
          courseLevel: cls.course.level,
          teacherName: cls.teacher?.fullName || null,
          branchName: cls.branch?.name || null,
          roomName: cls.room?.name || null,
          currentStudents,
          maxStudents: cls.maxStudents,
          score,
          reason: reasons.join(" · ") || "Không có yếu tố phù hợp đặc biệt",
          hasScheduleConflict: hasConflict,
          conflictWith,
        }
      })
      // Loại lớp đầy (currentStudents >= maxStudents)
      .filter((s) => s.currentStudents < s.maxStudents)
      // Sort theo score giảm dần
      .sort((a, b) => b.score - a.score)
      // Top 5
      .slice(0, 5)

    return { success: true, data: { suggestions, student } }
  } catch (error) {
    console.error("Suggest classes error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể gợi ý lớp") }
  }
}

/**
 * Chuyển học viên từ lớp A sang lớp B.
 * - Set ClassStudent(A).status = DROPPED + ghi chú
 * - Tạo ClassStudent(B).status = ACTIVE
 * - Tất cả trong 1 Prisma transaction
 */
export async function transferStudentToClass(
  studentId: string,
  fromClassId: string,
  toClassId: string
) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)

    if (fromClassId === toClassId) {
      return { success: false, error: "Lớp nguồn và lớp đích phải khác nhau" }
    }

    const [student, fromClass, toClass, existingInTarget] = await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true, fullName: true },
      }),
      prisma.class.findUnique({
        where: { id: fromClassId },
        select: { id: true, name: true, maxStudents: true },
      }),
      prisma.class.findUnique({
        where: { id: toClassId },
        select: {
          id: true,
          name: true,
          maxStudents: true,
          _count: { select: { students: { where: { status: "ACTIVE" } } } },
        },
      }),
      prisma.classStudent.findUnique({
        where: { classId_studentId: { classId: toClassId, studentId } },
      }),
    ])

    if (!student) return { success: false, error: "Không tìm thấy học viên" }
    if (!fromClass) return { success: false, error: "Không tìm thấy lớp nguồn" }
    if (!toClass) return { success: false, error: "Không tìm thấy lớp đích" }

    if (existingInTarget?.status === "ACTIVE") {
      return {
        success: false,
        error: `Học viên đã ở trong lớp ${toClass.name}`,
      }
    }

    if (toClass._count.students >= toClass.maxStudents) {
      return {
        success: false,
        error: `Lớp ${toClass.name} đã đủ sĩ số tối đa`,
      }
    }

    // Lấy thông tin lớp nguồn trong ClassStudent để ghi chú
    const sourceClassStudent = await prisma.classStudent.findUnique({
      where: { classId_studentId: { classId: fromClassId, studentId } },
    })
    if (!sourceClassStudent || sourceClassStudent.status !== "ACTIVE") {
      return {
        success: false,
        error: `Học viên không ở trong lớp ${fromClass.name} (đang ACTIVE)`,
      }
    }

    // Transaction: set nguồn DROPPED + tạo mới ở đích
    await prisma.$transaction(async (tx) => {
      // 1. Cập nhật lớp nguồn: ACTIVE → DROPPED
      await tx.classStudent.update({
        where: { classId_studentId: { classId: fromClassId, studentId } },
        data: {
          status: "DROPPED",
        },
      })

      // 2. Tạo mới ở lớp đích
      if (existingInTarget) {
        // Nếu đã có record cũ (DROPPED) → update lại ACTIVE
        await tx.classStudent.update({
          where: { classId_studentId: { classId: toClassId, studentId } },
          data: {
            status: "ACTIVE",
            joinedAt: new Date(),
          },
        })
      } else {
        await tx.classStudent.create({
          data: {
            classId: toClassId,
            studentId,
            status: "ACTIVE",
          },
        })
      }
    })

    revalidatePath(`/admin/classes/${fromClassId}`)
    revalidatePath(`/admin/classes/${toClassId}`)
    revalidatePath(`/admin/classes/arrange`)
    revalidatePath(`/admin/students/${studentId}`)

    return {
      success: true,
      data: { fromClassName: fromClass.name, toClassName: toClass.name },
    }
  } catch (error) {
    console.error("Transfer student error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể chuyển lớp") }
  }
}
