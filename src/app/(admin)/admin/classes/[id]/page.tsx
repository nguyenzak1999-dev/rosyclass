import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ClassDetailClient from "./class-detail-client"
import { buildClassroomSeats } from "./components/classroom-3d/seats"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { hasPermission, PERMISSIONS, requireAdminUser } from "@/lib/auth/permissions"
import { formatVietnamDate, vietnamDateKey, vietnamDayRange } from "@/lib/curriculum"
import { parseReportData } from "@/lib/progress-report"
import type { ClassHomework } from "./components/class-homework-tab"
import type { ClassReport } from "./components/class-reports-tab"

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireAdminUser()
  const canWriteLearning = hasPermission(user, PERMISSIONS.attendanceWrite)
  const classData = await prisma.class.findUnique({
    where: { id },
    include: {
      course: true,
      teacher: true,
      branch: true,
      room: true,
      curriculum: {
        select: {
          id: true,
          name: true,
          gradeLabel: true,
          units: {
            select: { id: true, order: true, title: true, _count: { select: { lessons: true } } },
            orderBy: { order: "asc" },
          },
        },
      },
      students: {
        include: {
          student: true
        }
      },
      schedules: {
        include: { teacher: true, room: true },
        orderBy: { dayOfWeek: "asc" }
      },
      sessions: {
        include: {
          teacher: true,
          room: true,
          lesson: { select: { id: true, order: true, title: true, unit: { select: { order: true, title: true } } } },
          _count: { select: { attendances: true } },
        },
        orderBy: { sessionDate: "asc" }
      },
      classNotes: { orderBy: { createdAt: "desc" }, take: 5 }
    }
  })

  if (!classData) {
    return notFound()
  }

  // Lấy tất cả học viên đang ACTIVE để có thể add vào lớp
  const allStudents = await prisma.student.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, fullName: true, phone: true, email: true }
  })

  // Lookup data cho schedule & session dialogs
  const [teachers, rooms, scores, attendances, feedbacks] = await Promise.all([
    prisma.teacher.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" }
    }),
    prisma.room.findMany({
      where: { isActive: true },
      select: { id: true, name: true, capacity: true },
      orderBy: { name: "asc" }
    }),
    prisma.score.findMany({
      where: { classId: id },
      orderBy: { date: "desc" },
      include: {
        student: { select: { id: true, fullName: true } },
        session: { select: { id: true, sessionDate: true, topic: true } }
      }
    }),
    prisma.attendance.findMany({
      where: { session: { classId: id } },
      select: { studentId: true, status: true, session: { select: { sessionDate: true } } }
    }),
    prisma.sessionFeedback.findMany({
      where: { session: { classId: id } },
      select: { studentId: true, stars: true, session: { select: { sessionDate: true, startTime: true } } }
    })
  ])

  // Bài tập, đánh giá kỹ năng, báo cáo tiến bộ (phân hệ lớp 1)
  const [homeworkRows, skillRows, reportRows] = await Promise.all([
    prisma.homework.findMany({
      where: { classId: id },
      include: {
        session: { select: { sessionDate: true, startTime: true } },
        submissions: { select: { studentId: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.skillAssessment.findMany({
      where: { classId: id },
      select: { studentId: true, unitId: true, skill: true, level: true, note: true },
    }),
    prisma.progressReport.findMany({
      where: { classId: id },
      include: { student: { select: { fullName: true } } },
      orderBy: [{ periodStart: "desc" }, { student: { fullName: "asc" } }],
      take: 500,
    }),
  ])

  const homework: ClassHomework[] = homeworkRows.map((item) => ({
    id: item.id,
    title: item.title,
    instructions: item.instructions,
    kind: item.kind,
    dueDateKey: item.dueDate ? vietnamDateKey(item.dueDate) : "",
    dueLabel: item.dueDate ? formatVietnamDate(item.dueDate) : null,
    sessionId: item.sessionId,
    lessonId: item.lessonId,
    sessionLabel: item.session ? `${formatVietnamDate(item.session.sessionDate)} ${item.session.startTime}` : null,
    createdLabel: formatVietnamDate(item.createdAt),
    submittedIds: item.submissions.map((row) => row.studentId),
    reviewedCount: item.submissions.filter((row) => row.status === "REVIEWED").length,
    pendingCount: item.submissions.filter((row) => row.status === "SUBMITTED").length,
  }))

  const reports: ClassReport[] = reportRows.map((report) => {
    const data = parseReportData(report.data)
    return {
      id: report.id,
      studentName: report.student.fullName,
      title: report.title,
      fromKey: vietnamDateKey(report.periodStart),
      toKey: vietnamDateKey(report.periodEnd),
      periodLabel: `${formatVietnamDate(report.periodStart)} – ${formatVietnamDate(report.periodEnd)}`,
      status: report.status,
      teacherComment: report.teacherComment ?? "",
      summary: {
        attendanceRate: data?.attendance.rate ?? null,
        sessions: data?.attendance.sessions ?? 0,
        stars: data?.stars.total ?? 0,
        homeworkSubmitted: data?.homework.submitted ?? 0,
        homeworkAssigned: data?.homework.assigned ?? 0,
        skills: data?.skills.length ?? 0,
      },
    }
  })

  // Unit mặc định khi đánh giá kỹ năng: Unit của buổi gần nhất đã qua có gắn bài
  const todayEnd = vietnamDayRange().end
  const lastTaught = [...classData.sessions]
    .reverse()
    .find((session) => session.lesson && session.status !== "CANCELLED" && session.sessionDate < todayEnd)
  const units = classData.curriculum?.units ?? []
  const defaultUnitId =
    units.find((unit) => lastTaught?.lesson && unit.order === lastTaught.lesson.unit.order)?.id ?? units[0]?.id ?? null

  const homeworkSessions = classData.sessions
    .filter((session) => session.status !== "CANCELLED")
    .map((session) => ({
      id: session.id,
      label: `${formatVietnamDate(session.sessionDate)} ${session.startTime}${
        session.lesson ? ` · Unit ${session.lesson.unit.order} – Bài ${session.lesson.order}` : session.topic ? ` · ${session.topic}` : ""
      }`,
    }))

  const classroomSeats = buildClassroomSeats({
    students: classData.students,
    attendances,
    scores,
    feedbacks,
  })

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/classes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Lớp học: {classData.name}</h2>
          <p className="text-muted-foreground text-sm">
            Khóa học: {classData.course.name} | Trạng thái: {classData.status}
          </p>
        </div>
      </div>

      <ClassDetailClient
        classData={classData as any}
        allStudents={allStudents}
        teachers={teachers}
        rooms={rooms}
        scores={JSON.parse(JSON.stringify(scores))}
        classroom={{
          className: classData.name,
          courseName: classData.course.name,
          teacherName: classData.teacher?.fullName ?? null,
          roomName: classData.room?.name ?? null,
          seats: classroomSeats,
        }}
        learning={{
          canWrite: canWriteLearning,
          homework,
          homeworkSessions,
          skillAssessments: skillRows,
          units: units.map((unit) => ({ id: unit.id, order: unit.order, title: unit.title })),
          defaultUnitId,
          reports,
        }}
      />
    </div>
  )
}
