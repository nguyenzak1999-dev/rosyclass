import "server-only"

import { prisma } from "@/lib/prisma"
import { parseJsonList } from "@/lib/curriculum"
import type { ProgressReportData } from "@/lib/progress-report"

const PRESENT_STATUSES = new Set(["PRESENT", "LATE", "MAKE_UP"])

function topCounts(counts: Map<string, number>, limit: number) {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "vi"))
    .slice(0, limit)
}

/**
 * Tổng hợp số liệu báo cáo tiến bộ cho các bé của một lớp trong kỳ [start, endExclusive).
 * Lọc bằng quan hệ (session.classId…) thay vì danh sách id dài: D1 giới hạn 100 tham số mỗi câu SQL.
 */
export async function buildProgressReportData(
  classId: string,
  studentIds: string[],
  start: Date,
  endExclusive: Date,
  now = new Date()
): Promise<Map<string, ProgressReportData>> {
  const sessionFilter = {
    classId,
    sessionDate: { gte: start, lt: endExclusive },
    status: { not: "CANCELLED" as const },
  }

  const [classInfo, sessions, attendances, feedbacks, homework, assessments, students] = await Promise.all([
    prisma.class.findUnique({
      where: { id: classId },
      select: { name: true, course: { select: { name: true } }, teacher: { select: { fullName: true } } },
    }),
    prisma.classSession.findMany({
      where: sessionFilter,
      select: {
        id: true,
        sessionDate: true,
        status: true,
        lesson: { select: { order: true, title: true, unit: { select: { order: true } } } },
      },
      orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
    }),
    prisma.attendance.findMany({
      where: { session: sessionFilter },
      select: { studentId: true, status: true },
    }),
    prisma.sessionFeedback.findMany({
      where: { session: sessionFilter },
      select: { studentId: true, stars: true, praises: true },
    }),
    prisma.homework.findMany({
      where: { classId, createdAt: { gte: start, lt: endExclusive } },
      select: { id: true, submissions: { select: { studentId: true, status: true, sticker: true } } },
    }),
    prisma.skillAssessment.findMany({
      where: { classId, updatedAt: { lt: endExclusive } },
      select: {
        studentId: true,
        skill: true,
        level: true,
        note: true,
        updatedAt: true,
        unit: { select: { order: true, title: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.student.findMany({ where: { classStudents: { some: { classId } } }, select: { id: true, fullName: true } }),
  ])

  const nameById = new Map(students.map((student) => [student.id, student.fullName]))
  // Buổi đã diễn ra: đã hoàn thành hoặc đã qua ngày
  const heldSessions = sessions.filter((session) => session.status === "COMPLETED" || session.sessionDate.getTime() < now.getTime())
  const lessons = Array.from(
    new Set(
      heldSessions
        .filter((session) => session.lesson)
        .map((session) => `Unit ${session.lesson!.unit.order} – Bài ${session.lesson!.order}: ${session.lesson!.title}`)
    )
  )

  const result = new Map<string, ProgressReportData>()
  for (const studentId of studentIds) {
    const own = attendances.filter((row) => row.studentId === studentId)
    const count = (status: string) => own.filter((row) => row.status === status).length
    const attended = own.filter((row) => PRESENT_STATUSES.has(row.status)).length

    const ownFeedback = feedbacks.filter((row) => row.studentId === studentId)
    const totalStars = ownFeedback.reduce((sum, row) => sum + row.stars, 0)
    const praiseCounts = new Map<string, number>()
    for (const row of ownFeedback) {
      for (const praise of parseJsonList(row.praises)) praiseCounts.set(praise, (praiseCounts.get(praise) ?? 0) + 1)
    }

    const ownSubmissions = homework.flatMap((item) => item.submissions.filter((row) => row.studentId === studentId))
    const stickerCounts = new Map<string, number>()
    for (const row of ownSubmissions) if (row.sticker) stickerCounts.set(row.sticker, (stickerCounts.get(row.sticker) ?? 0) + 1)

    // Mức mới nhất của từng kỹ năng (đã sắp xếp updatedAt giảm dần)
    const latestBySkill = new Map<string, (typeof assessments)[number]>()
    for (const row of assessments) {
      if (row.studentId === studentId && !latestBySkill.has(row.skill)) latestBySkill.set(row.skill, row)
    }

    result.set(studentId, {
      version: 1,
      studentName: nameById.get(studentId) ?? "",
      className: classInfo?.name ?? "",
      courseName: classInfo?.course.name ?? null,
      teacherName: classInfo?.teacher?.fullName ?? null,
      attendance: {
        sessions: heldSessions.length,
        present: count("PRESENT"),
        late: count("LATE"),
        excused: count("ABSENT_WITH_PERMISSION"),
        absent: count("ABSENT_WITHOUT_PERMISSION"),
        makeUp: count("MAKE_UP"),
        recorded: own.length,
        rate: own.length > 0 ? Math.round((attended / own.length) * 100) : null,
      },
      stars: {
        total: totalStars,
        average: ownFeedback.length > 0 ? Math.round((totalStars / ownFeedback.length) * 10) / 10 : null,
        feedbackCount: ownFeedback.length,
      },
      topPraises: topCounts(praiseCounts, 3).map(([praise, count]) => ({ praise, count })),
      homework: {
        assigned: homework.length,
        submitted: ownSubmissions.length,
        reviewed: ownSubmissions.filter((row) => row.status === "REVIEWED").length,
        stickers: topCounts(stickerCounts, 5).map(([sticker, count]) => ({ sticker, count })),
      },
      skills: Array.from(latestBySkill.values()).map((row) => ({
        skill: row.skill,
        level: row.level,
        unitLabel: `Unit ${row.unit.order}: ${row.unit.title}`,
        note: row.note,
      })),
      lessons,
      generatedAt: now.toISOString(),
    })
  }
  return result
}
