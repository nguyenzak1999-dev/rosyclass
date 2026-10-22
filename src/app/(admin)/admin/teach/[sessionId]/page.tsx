import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { hasPermission, PERMISSIONS, requireAdminUser } from "@/lib/auth/permissions"
import { formatVietnamDate, parseJsonList, vietnamDateKey, vietnamDayRange } from "@/lib/curriculum"
import { TeachClient, type TeachLesson, type TeachStudent } from "./teach-client"

export const dynamic = "force-dynamic"

export default async function TeachSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const user = await requireAdminUser()

  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    include: {
      class: { select: { id: true, name: true, course: { select: { name: true } } } },
      teacher: { select: { fullName: true } },
      room: { select: { name: true } },
      lesson: {
        include: {
          unit: {
            select: {
              order: true,
              title: true,
              objectives: true,
              vocabulary: true,
              sentencePatterns: true,
              phonics: true,
              songUrl: true,
            },
          },
        },
      },
    },
  })
  if (!session) notFound()

  const [classStudents, attendances, feedbacks, starTotals, homeworkRows, nextSession] = await Promise.all([
    prisma.classStudent.findMany({
      where: { classId: session.classId, status: "ACTIVE" },
      select: { student: { select: { id: true, fullName: true } } },
      orderBy: { student: { fullName: "asc" } },
    }),
    prisma.attendance.findMany({
      where: { sessionId: session.id },
      select: { studentId: true, status: true, student: { select: { id: true, fullName: true } } },
    }),
    prisma.sessionFeedback.findMany({
      where: { sessionId: session.id },
      select: { studentId: true, stars: true, praises: true, mood: true, comment: true },
    }),
    prisma.sessionFeedback.groupBy({
      by: ["studentId"],
      where: { session: { classId: session.classId } },
      _sum: { stars: true },
    }),
    prisma.homework.findMany({
      where: { sessionId: session.id },
      select: { id: true, title: true, instructions: true, kind: true, dueDate: true, _count: { select: { submissions: true } } },
      orderBy: { createdAt: "asc" },
    }),
    // Hạn nộp mặc định: buổi học kế tiếp của lớp
    prisma.classSession.findFirst({
      where: {
        classId: session.classId,
        sessionDate: { gte: vietnamDayRange(session.sessionDate, 1).start },
        status: { not: "CANCELLED" },
      },
      select: { sessionDate: true },
      orderBy: { sessionDate: "asc" },
    }),
  ])

  const attendanceById = new Map(attendances.map((row) => [row.studentId, row]))
  const feedbackById = new Map(feedbacks.map((row) => [row.studentId, row]))
  const totalById = new Map(starTotals.map((row) => [row.studentId, row._sum.stars ?? 0]))

  const roster = classStudents.map(({ student }) => ({ ...student, isGuest: false }))
  const rosterIds = new Set(roster.map((student) => student.id))
  // Bé lớp khác được xếp học bù vào buổi này
  for (const row of attendances) {
    if (!rosterIds.has(row.studentId)) roster.push({ ...row.student, isGuest: true })
  }

  const students: TeachStudent[] = roster.map((student) => {
    const feedback = feedbackById.get(student.id)
    return {
      id: student.id,
      fullName: student.fullName,
      isGuest: student.isGuest,
      status: attendanceById.get(student.id)?.status ?? null,
      hasFeedback: Boolean(feedback),
      stars: feedback?.stars ?? 0,
      praises: parseJsonList(feedback?.praises),
      mood: feedback?.mood ?? null,
      comment: feedback?.comment ?? "",
      totalStars: totalById.get(student.id) ?? 0,
    }
  })

  const lesson: TeachLesson | null = session.lesson
    ? {
        title: session.lesson.title,
        order: session.lesson.order,
        objectives: session.lesson.objectives,
        activities: session.lesson.activities,
        materials: session.lesson.materials,
        mediaUrl: session.lesson.mediaUrl,
        homework: session.lesson.homework,
        unit: {
          order: session.lesson.unit.order,
          title: session.lesson.unit.title,
          objectives: session.lesson.unit.objectives,
          vocabulary: parseJsonList(session.lesson.unit.vocabulary),
          sentencePatterns: parseJsonList(session.lesson.unit.sentencePatterns),
          phonics: session.lesson.unit.phonics,
          songUrl: session.lesson.unit.songUrl,
        },
      }
    : null

  return (
    <TeachClient
      session={{
        id: session.id,
        classId: session.class.id,
        className: session.class.name,
        courseName: session.class.course.name,
        dateLabel: formatVietnamDate(session.sessionDate, { weekday: "long" }),
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        topic: session.topic,
        teacherName: session.teacher?.fullName ?? null,
        roomName: session.room?.name ?? null,
      }}
      lesson={lesson}
      lessonRef={
        session.lesson
          ? {
              id: session.lesson.id,
              title: session.lesson.title,
              order: session.lesson.order,
              unitOrder: session.lesson.unit.order,
              homework: session.lesson.homework,
            }
          : null
      }
      homework={homeworkRows.map((item) => ({
        id: item.id,
        title: item.title,
        instructions: item.instructions,
        kind: item.kind,
        dueDateKey: item.dueDate ? vietnamDateKey(item.dueDate) : "",
        submitted: item._count.submissions,
      }))}
      nextSessionDateKey={nextSession ? vietnamDateKey(nextSession.sessionDate) : ""}
      students={students}
      canWrite={hasPermission(user, PERMISSIONS.attendanceWrite) && session.status !== "CANCELLED"}
    />
  )
}
