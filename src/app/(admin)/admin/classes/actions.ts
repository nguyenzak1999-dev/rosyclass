"use server"

import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { classSchema, type ClassFormValues } from "@/lib/schemas/class"
import * as z from "zod"
import { notifyAdmins } from "@/lib/admin-notifications"
import { createPaymentForStudent } from "@/app/(admin)/admin/payments/actions"
import {
  cancelSessionSchema,
  extraSessionSchema,
  generateSessionsSchema,
  scheduleSchema,
  updateSessionSchema,
  type CancelSessionFormValues,
  type ExtraSessionFormValues,
  type GenerateSessionsFormValues,
  type ScheduleFormValues,
  type UpdateSessionFormValues
} from "@/lib/schemas/schedule"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/errors"
import { DAY_MS, formatVietnamDate, parseVietnamDateKey, toVietnamWallClock, vietnamDateKey, vietnamDayRange } from "@/lib/curriculum"
import { revalidatePublicSite } from "@/lib/public-cache"

const addStudentToClassSchema = z.object({
  classId: z.string().min(1, "Lớp học là bắt buộc"),
  studentId: z.string().min(1, "Học viên là bắt buộc"),
  createPayment: z.coerce.boolean<boolean>().default(true)
})

export async function upsertClass(data: ClassFormValues) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)
    const parsedData = classSchema.parse(data)
    const { id, studentIds, ...classData } = parsedData
    let classId = id

    if (id) {
      await prisma.class.update({
        where: { id },
        data: classData
      })
    } else {
      const createdClass = await prisma.class.create({
        data: classData
      })
      classId = createdClass.id
    }

    if (classId) {
      // D1 không hỗ trợ interactive transaction nên tính chênh lệch trước rồi chạy batch.
      // Chỉ gỡ HV đang ACTIVE bị bỏ chọn; giữ bản ghi DROPPED/COMPLETED làm lịch sử
      const selectedIds = new Set(studentIds)
      const existing = await prisma.classStudent.findMany({
        where: { classId },
        select: { studentId: true, status: true }
      })
      const existingById = new Map(existing.map((item) => [item.studentId, item.status]))
      const removeIds = existing
        .filter((item) => item.status === "ACTIVE" && !selectedIds.has(item.studentId))
        .map((item) => item.studentId)
      // HV từng nghỉ/chuyển lớp được chọn lại → kích hoạt lại thay vì tạo trùng
      const reactivateIds = studentIds.filter((studentId) => {
        const status = existingById.get(studentId)
        return status !== undefined && status !== "ACTIVE"
      })
      // SQLite/D1 không hỗ trợ skipDuplicates, nên tự lọc học viên đã có trong lớp
      const newStudentIds = studentIds.filter((studentId) => !existingById.has(studentId))

      const operations: Prisma.PrismaPromise<unknown>[] = []
      if (removeIds.length > 0) {
        operations.push(prisma.classStudent.deleteMany({ where: { classId, studentId: { in: removeIds } } }))
      }
      if (reactivateIds.length > 0) {
        operations.push(
          prisma.classStudent.updateMany({
            where: { classId, studentId: { in: reactivateIds } },
            data: { status: "ACTIVE", joinedAt: new Date() }
          })
        )
      }
      if (newStudentIds.length > 0) {
        operations.push(
          prisma.classStudent.createMany({
            data: newStudentIds.map((studentId) => ({
              classId,
              studentId,
              status: "ACTIVE" as const
            }))
          })
        )
      }
      if (operations.length > 0) {
        await prisma.$transaction(operations)
      }
    }

    revalidatePublicSite()

    revalidatePath("/admin/classes")
    if (classId) {
      revalidatePath(`/admin/classes/${classId}`)
    }
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
    revalidatePublicSite()
    revalidatePath("/admin/classes")
    return { success: true }
  } catch (error: unknown) {
    console.error("Class delete error:", error)
    return { success: false, error: "Không thể xóa lớp học này" }
  }
}

export async function addStudentToClass(
  classIdOrData:
    | string
    | { classId: string; studentId: string; createPayment?: boolean },
  studentIdArg?: string
) {
  try {
    const user = await requirePermission(PERMISSIONS.classesWrite)
    const parsed = addStudentToClassSchema.parse(
      typeof classIdOrData === "string"
        ? { classId: classIdOrData, studentId: studentIdArg, createPayment: true }
        : classIdOrData
    )
    const { classId, studentId } = parsed

    // Check if already in class
    const existing = await prisma.classStudent.findUnique({
      where: {
        classId_studentId: { classId, studentId }
      }
    })

    if (existing?.status === "ACTIVE") {
      return { success: false, error: "Học viên này đã ở trong lớp" }
    }

    // Check class capacity
    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        course: { select: { id: true, name: true } },
        _count: {
          select: { students: { where: { status: "ACTIVE" } } }
        }
      }
    })

    if (!targetClass) {
      return { success: false, error: "Không tìm thấy lớp học" }
    }

    if (targetClass._count.students >= targetClass.maxStudents) {
      return { success: false, error: "Lớp đã đủ sĩ số tối đa, không thể xếp thêm học viên!" }
    }

    if (existing) {
      // HV từng nghỉ/chuyển khỏi lớp → kích hoạt lại bản ghi cũ (khoá @@unique classId + studentId)
      await prisma.classStudent.update({
        where: { classId_studentId: { classId, studentId } },
        data: { status: "ACTIVE", joinedAt: new Date() }
      })
    } else {
      await prisma.classStudent.create({
        data: { classId, studentId }
      })
    }
    // HV đã có lớp → chuyển khỏi danh sách "chờ xếp lớp"
    await prisma.student.updateMany({
      where: { id: studentId, status: { not: "ACTIVE" } },
      data: { status: "ACTIVE" }
    })

    // Tự động tạo payment cho HV (nếu course có học phí > 0)
    const payment = await createPaymentForStudent(
      studentId,
      classId,
      14,
      user.id,
      parsed.createPayment
    )

    // Notify admins
    const [cls, student] = await Promise.all([
      prisma.class.findUnique({ where: { id: classId }, select: { name: true } }),
      prisma.student.findUnique({ where: { id: studentId }, select: { fullName: true } })
    ])
    if (cls && student) {
      notifyAdmins(
        "Xếp học viên vào lớp",
        payment
          ? `${student.fullName} vừa được xếp vào lớp ${cls.name} (đã tạo phiếu thu ${payment.totalAmount.toLocaleString("vi-VN")}đ)`
          : `${student.fullName} vừa được xếp vào lớp ${cls.name} (đã tạo enrollment)`,
        `/admin/classes/${classId}`
      )
    }

    revalidatePublicSite()

    revalidatePath(`/admin/classes/${classId}`)
    revalidatePath(`/admin/students/${studentId}`)
    revalidatePath("/admin/classes/arrange")
    revalidatePath("/admin/payments")
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

    revalidatePublicSite()

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
      select: { id: true, teacherId: true, roomId: true }
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
        roomId: parsed.roomId ?? cls.roomId ?? null
      }
    })

    revalidatePublicSite()

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
      select: { classId: true }
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
        roomId: parsed.roomId ?? null
      }
    })

    revalidatePublicSite()

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
      select: { classId: true }
    })
    if (!existing) {
      return { success: false, error: "Không tìm thấy lịch học" }
    }

    await prisma.classSchedule.delete({ where: { id: scheduleId } })
    revalidatePublicSite()
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
 * 3. Lọc các buổi đã tồn tại (theo @@unique) rồi createMany phần còn lại
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
      select: { id: true, teacherId: true, roomId: true }
    })
    if (!cls) {
      return { success: false, error: "Không tìm thấy lớp học" }
    }

    const schedules = await prisma.classSchedule.findMany({
      where: { classId: parsed.classId }
    })
    if (schedules.length === 0) {
      return { success: false, error: "Lớp chưa có lịch học cố định nào. Hãy tạo lịch trước." }
    }

    // Chuẩn hoá range theo giờ Việt Nam: [00:00 fromDate, 00:00 ngày sau toDate)
    // Worker chạy UTC nên không dùng setHours/getDay theo giờ máy
    const from = parseVietnamDateKey(parsed.fromDate)
    const toStart = parseVietnamDateKey(parsed.toDate)
    if (!from || !toStart) {
      return { success: false, error: "Khoảng ngày không hợp lệ" }
    }
    const to = new Date(toStart.getTime() + DAY_MS)

    // Nếu replaceExisting, xoá SCHEDULED sessions chưa có attendance
    if (parsed.replaceExisting) {
      const futureScheduled = await prisma.classSession.findMany({
        where: {
          classId: parsed.classId,
          sessionDate: { gte: from, lt: to },
          status: "SCHEDULED",
          attendances: { none: {} }
        },
        select: { id: true }
      })
      if (futureScheduled.length > 0) {
        await prisma.classSession.deleteMany({
          where: { id: { in: futureScheduled.map((s) => s.id) } }
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

    // sessionDate = 00:00 giờ VN của ngày học (giống dữ liệu đang có)
    for (let time = from.getTime(); time < to.getTime(); time += DAY_MS) {
      const sessionDate = new Date(time)
      const dayOfWeek = toVietnamWallClock(sessionDate).getDay() // 0 = CN, 1 = T2, ..., 6 = T7
      const matchingSchedules = schedules.filter((s) => s.dayOfWeek === dayOfWeek)
      for (const schedule of matchingSchedules) {
        toCreate.push({
          classId: cls.id,
          scheduleId: schedule.id,
          sessionDate,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          teacherId: schedule.teacherId ?? cls.teacherId ?? null,
          roomId: schedule.roomId ?? cls.roomId ?? null
        })
      }
    }

    if (toCreate.length === 0) {
      return { success: true, data: { count: 0 } }
    }

    // SQLite/D1 không hỗ trợ skipDuplicates: bỏ các buổi trùng ngày (giờ VN) + giờ bắt đầu.
    // So theo ngày VN thay vì mốc thời gian vì buổi cũ có thể lưu 00:00 UTC hoặc 00:00 giờ VN
    const existingSessions = await prisma.classSession.findMany({
      where: { classId: cls.id, sessionDate: { gte: from, lt: to } },
      select: { sessionDate: true, startTime: true }
    })
    const sessionKey = (sessionDate: Date, startTime: string) => `${vietnamDateKey(sessionDate)}|${startTime}`
    const existingKeys = new Set(existingSessions.map((s) => sessionKey(s.sessionDate, s.startTime)))
    const uniqueToCreate = toCreate.filter((session) => {
      const key = sessionKey(session.sessionDate, session.startTime)
      if (existingKeys.has(key)) return false
      existingKeys.add(key)
      return true
    })

    const result = uniqueToCreate.length > 0
      ? await prisma.classSession.createMany({ data: uniqueToCreate })
      : { count: 0 }

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
      include: { _count: { select: { attendances: true } } }
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

    // Đổi bài: chỉ cho chọn bài thuộc chương trình mà lớp đang dùng
    const lessonChanged = parsed.lessonId !== undefined && parsed.lessonId !== existing.lessonId
    if (lessonChanged && parsed.lessonId) {
      const [lesson, cls] = await Promise.all([
        prisma.lesson.findUnique({ where: { id: parsed.lessonId }, select: { unit: { select: { curriculumId: true } } } }),
        prisma.class.findUnique({ where: { id: existing.classId }, select: { curriculumId: true } }),
      ])
      if (!lesson || !cls?.curriculumId || lesson.unit.curriculumId !== cls.curriculumId) {
        return { success: false, error: "Bài học không thuộc chương trình của lớp" }
      }
    }

    // Đổi ngày/giờ: không cho trùng buổi khác của lớp cùng ngày (giờ VN) + giờ bắt đầu.
    // @@unique không bắt được khi hai buổi lưu mốc 00:00 khác múi giờ
    if (parsed.sessionDate || parsed.startTime) {
      const day = vietnamDayRange(parsed.sessionDate ?? existing.sessionDate)
      const clash = await prisma.classSession.findFirst({
        where: {
          classId: existing.classId,
          id: { not: existing.id },
          startTime: parsed.startTime ?? existing.startTime,
          sessionDate: { gte: day.start, lt: day.end },
          status: { not: "CANCELLED" }
        },
        select: { id: true }
      })
      if (clash) {
        return { success: false, error: "Lớp đã có buổi học khác cùng ngày và giờ bắt đầu" }
      }
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
        lessonId: lessonChanged ? parsed.lessonId : undefined
      }
    })

    revalidatePath(`/admin/classes/${existing.classId}`)
    revalidatePath(`/admin/schedules`)
    revalidatePath(`/admin/schedules/${existing.id}`)
    revalidatePath(`/admin/teach/${existing.id}`)

    const warning =
      existing._count.attendances > 0 ? "Đã cập nhật buổi học. Lưu ý: buổi này đã có điểm danh." : undefined
    return { success: true, data: { warning } }
  } catch (error) {
    console.error("Update session error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể cập nhật buổi học") }
  }
}

/**
 * Thêm một buổi học ngoài lịch tuần, chủ yếu cho buổi học với giáo viên nước ngoài (1 buổi/tháng).
 * Phiếu thu tháng tính buổi này: đơn giá buổi + phụ thu.
 */
export async function createExtraSession(data: ExtraSessionFormValues) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)
    const parsed = extraSessionSchema.parse(data)
    const sessionDate = parseVietnamDateKey(parsed.sessionDate)
    if (!sessionDate) return { success: false, error: "Ngày học không hợp lệ" }

    const cls = await prisma.class.findUnique({
      where: { id: parsed.classId },
      select: { id: true, roomId: true, teacherId: true },
    })
    if (!cls) return { success: false, error: "Không tìm thấy lớp học" }

    const day = vietnamDayRange(sessionDate)
    const clash = await prisma.classSession.findFirst({
      where: {
        classId: cls.id,
        startTime: parsed.startTime,
        sessionDate: { gte: day.start, lt: day.end },
        status: { not: "CANCELLED" },
      },
      select: { id: true },
    })
    if (clash) return { success: false, error: "Lớp đã có buổi học khác cùng ngày và giờ bắt đầu" }

    const session = await prisma.classSession.create({
      data: {
        classId: cls.id,
        sessionDate,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        roomId: cls.roomId,
        teacherId: parsed.teacherId || (parsed.isForeignTeacher ? null : cls.teacherId),
        topic: parsed.topic?.trim() || (parsed.isForeignTeacher ? "Học với giáo viên nước ngoài" : null),
        isForeignTeacher: parsed.isForeignTeacher,
        surcharge: parsed.isForeignTeacher ? parsed.surcharge : 0,
      },
      select: { id: true },
    })

    revalidatePath(`/admin/classes/${cls.id}`)
    revalidatePath("/admin/schedules")
    revalidatePath("/admin/attendance")
    return { success: true, data: { id: session.id } }
  } catch (error) {
    console.error("Create extra session error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể thêm buổi học") }
  }
}

/**
 * Gán lần lượt các bài của chương trình (theo Unit.order rồi Lesson.order) cho các buổi học của lớp.
 *
 * - Chỉ xét buổi chưa huỷ và không phải buổi phụ đạo (MAKE_UP), sắp theo ngày + giờ.
 * - Bắt đầu từ buổi chưa có bài đầu tiên nằm SAU buổi cuối cùng đã có bài,
 *   và tiếp tục từ bài kế tiếp sau bài của buổi đó. Buổi trống xen giữa (vd. buổi ôn tập
 *   đã được bỏ bài) được giữ nguyên để không làm xáo trộn thứ tự.
 * - Buổi bị huỷ không được tính, nên nghỉ lễ thì bài tự dồn sang buổi sau.
 */
export async function assignLessonsToSessions(classId: string) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)

    const cls = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, curriculumId: true }
    })
    if (!cls) return { success: false, error: "Không tìm thấy lớp học" }
    if (!cls.curriculumId) {
      return { success: false, error: "Lớp chưa gắn chương trình học. Hãy chọn chương trình trong form sửa lớp." }
    }

    const [units, sessions] = await Promise.all([
      prisma.curriculumUnit.findMany({
        where: { curriculumId: cls.curriculumId },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: {
          lessons: { orderBy: [{ order: "asc" }, { createdAt: "asc" }], select: { id: true } }
        }
      }),
      prisma.classSession.findMany({
        where: { classId, status: { notIn: ["CANCELLED", "MAKE_UP"] } },
        orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
        select: { id: true, lessonId: true }
      })
    ])

    const lessonIds = units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id))
    if (lessonIds.length === 0) {
      return { success: false, error: "Chương trình học chưa có bài nào" }
    }

    let lastAssignedIndex = -1
    for (let i = sessions.length - 1; i >= 0; i--) {
      if (sessions[i].lessonId) {
        lastAssignedIndex = i
        break
      }
    }
    // Bài cuối đã gắn không thuộc chương trình hiện tại (lớp vừa đổi chương trình) → bắt đầu lại từ bài 1
    const lastLessonPosition =
      lastAssignedIndex >= 0 ? lessonIds.indexOf(sessions[lastAssignedIndex].lessonId as string) : -1

    let nextLesson = lastLessonPosition + 1
    let assigned = 0
    for (const session of sessions.slice(lastAssignedIndex + 1)) {
      if (nextLesson >= lessonIds.length) break
      await prisma.classSession.update({
        where: { id: session.id },
        data: { lessonId: lessonIds[nextLesson] }
      })
      nextLesson++
      assigned++
    }

    const sessionsWithoutLesson = sessions.length - lastAssignedIndex - 1 - assigned

    revalidatePath(`/admin/classes/${classId}`)
    revalidatePath(`/admin/schedules`)
    revalidatePath(`/admin/teach`)
    return {
      success: true,
      data: {
        assigned,
        /** Số buổi còn trống vì chương trình đã hết bài */
        sessionsWithoutLesson,
        lessonsRemaining: lessonIds.length - nextLesson
      }
    }
  } catch (error) {
    console.error("Assign lessons error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể gán bài cho buổi học") }
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
      include: { _count: { select: { attendances: true } } }
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
        notes: newNotes
      }
    })

    // Notify admins
    const cls = await prisma.class.findUnique({
      where: { id: existing.classId },
      select: { name: true }
    })
    if (cls) {
      notifyAdmins(
        "Buổi học bị huỷ",
        `Buổi học ngày ${formatVietnamDate(existing.sessionDate)} của lớp ${cls.name} đã bị huỷ${parsed.reason ? `: ${parsed.reason}` : ""}`,
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
  courseId: string
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
                schedules: { select: { dayOfWeek: true } }
              }
            }
          }
        }
      }
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
        id: { notIn: Array.from(enrolledClassIds) }
      },
      include: {
        course: { select: { name: true, level: true } },
        teacher: { select: { fullName: true } },
        branch: { select: { name: true } },
        room: { select: { name: true } },
        schedules: { select: { dayOfWeek: true } },
        _count: {
          select: { students: { where: { status: "ACTIVE" } } }
        }
      },
      orderBy: { createdAt: "desc" }
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
            const dayLabel = conflicts.map((d) => ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d]).join(", ")
            conflictWith = `Trùng ${dayLabel} với lớp đang học`
            reasons.push("- trùng lịch học hiện tại")
          }
        }

        return {
          classId: cls.id,
          className: cls.name,
          courseId: cls.courseId,
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
          conflictWith
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
export async function transferStudentToClass(studentId: string, fromClassId: string, toClassId: string) {
  try {
    await requirePermission(PERMISSIONS.classesWrite)

    if (fromClassId === toClassId) {
      return { success: false, error: "Lớp nguồn và lớp đích phải khác nhau" }
    }

    const [student, fromClass, toClass, existingInTarget] = await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true, fullName: true }
      }),
      prisma.class.findUnique({
        where: { id: fromClassId },
        select: { id: true, name: true, maxStudents: true }
      }),
      prisma.class.findUnique({
        where: { id: toClassId },
        select: {
          id: true,
          name: true,
          maxStudents: true,
          _count: { select: { students: { where: { status: "ACTIVE" } } } }
        }
      }),
      prisma.classStudent.findUnique({
        where: { classId_studentId: { classId: toClassId, studentId } }
      })
    ])

    if (!student) return { success: false, error: "Không tìm thấy học viên" }
    if (!fromClass) return { success: false, error: "Không tìm thấy lớp nguồn" }
    if (!toClass) return { success: false, error: "Không tìm thấy lớp đích" }

    if (existingInTarget?.status === "ACTIVE") {
      return {
        success: false,
        error: `Học viên đã ở trong lớp ${toClass.name}`
      }
    }

    if (toClass._count.students >= toClass.maxStudents) {
      return {
        success: false,
        error: `Lớp ${toClass.name} đã đủ sĩ số tối đa`
      }
    }

    // Lấy thông tin lớp nguồn trong ClassStudent để ghi chú
    const sourceClassStudent = await prisma.classStudent.findUnique({
      where: { classId_studentId: { classId: fromClassId, studentId } }
    })
    if (!sourceClassStudent || sourceClassStudent.status !== "ACTIVE") {
      return {
        success: false,
        error: `Học viên không ở trong lớp ${fromClass.name} (đang ACTIVE)`
      }
    }

    // Batch transaction: set nguồn DROPPED + tạo mới ở đích (D1 không hỗ trợ interactive transaction)
    await prisma.$transaction([
      // 1. Cập nhật lớp nguồn: ACTIVE → DROPPED
      prisma.classStudent.update({
        where: { classId_studentId: { classId: fromClassId, studentId } },
        data: {
          status: "DROPPED"
        }
      }),
      // 2. Tạo mới ở lớp đích; nếu đã có record cũ (DROPPED) → update lại ACTIVE
      existingInTarget
        ? prisma.classStudent.update({
            where: { classId_studentId: { classId: toClassId, studentId } },
            data: {
              status: "ACTIVE",
              joinedAt: new Date()
            }
          })
        : prisma.classStudent.create({
            data: {
              classId: toClassId,
              studentId,
              status: "ACTIVE"
            }
          })
    ])

    revalidatePublicSite()

    revalidatePath(`/admin/classes/${fromClassId}`)
    revalidatePath(`/admin/classes/${toClassId}`)
    revalidatePath(`/admin/classes/arrange`)
    revalidatePath(`/admin/students/${studentId}`)

    return {
      success: true,
      data: { fromClassName: fromClass.name, toClassName: toClass.name }
    }
  } catch (error) {
    console.error("Transfer student error:", error)
    return { success: false, error: getErrorMessage(error, "Không thể chuyển lớp") }
  }
}
