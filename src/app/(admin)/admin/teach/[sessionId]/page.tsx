import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { hasPermission, PERMISSIONS, requireAdminUser } from "@/lib/auth/permissions"
import { formatVietnamDate, parseJsonList } from "@/lib/curriculum"
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

  const [classStudents, attendances, feedbacks, starTotals] = await Promise.all([
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
      students={students}
      canWrite={hasPermission(user, PERMISSIONS.attendanceWrite) && session.status !== "CANCELLED"}
    />
  )
}
