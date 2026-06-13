import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, Award, GraduationCap } from "lucide-react"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import TeacherProfileClient from "./teacher-profile-client"

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, status: true } },
      classes: {
        include: {
          course: { select: { id: true, name: true } },
          _count: { select: { students: { where: { status: "ACTIVE" } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!teacher) {
    return notFound()
  }

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // T2
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const [weeklySessions, monthlyCompletedSessions, upcomingSessions] = await Promise.all([
    prisma.classSession.findMany({
      where: {
        teacherId: teacher.id,
        sessionDate: { gte: weekStart, lte: weekEnd },
        status: { not: "CANCELLED" },
      },
      orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
      include: {
        class: { select: { id: true, name: true } },
        room: { select: { name: true } },
      },
    }),
    prisma.classSession.count({
      where: {
        teacherId: teacher.id,
        sessionDate: { gte: monthStart, lte: monthEnd },
        status: "COMPLETED",
      },
    }),
    prisma.classSession.findMany({
      where: {
        teacherId: teacher.id,
        sessionDate: { gte: now },
        status: "SCHEDULED",
      },
      orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
      take: 10,
      include: {
        class: { select: { id: true, name: true } },
        room: { select: { name: true } },
      },
    }),
  ])

  // Tính lương cơ bản tháng này
  // Mỗi buổi COMPLETED = hourlyRate × sessionDurationMinutes/60
  const sessionsThisMonth = await prisma.classSession.findMany({
    where: {
      teacherId: teacher.id,
      sessionDate: { gte: monthStart, lte: monthEnd },
      status: "COMPLETED",
    },
    include: { class: { select: { course: { select: { sessionDurationMinutes: true } } } } },
  })
  const totalMinutesThisMonth = sessionsThisMonth.reduce(
    (sum, s) => sum + (s.class.course.sessionDurationMinutes || 90),
    0
  )
  const baseSalaryThisMonth = (totalMinutesThisMonth / 60) * teacher.hourlyRate

  // Format data
  const stats = {
    totalClasses: teacher.classes.length,
    activeClasses: teacher.classes.filter(
      (c) => c.status === "ACTIVE" || c.status === "UPCOMING"
    ).length,
    totalStudents: teacher.classes.reduce(
      (sum, c) => sum + c._count.students,
      0
    ),
    weeklySessionsCount: weeklySessions.length,
    monthlyCompleted: monthlyCompletedSessions,
    baseSalaryThisMonth,
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/admin/teachers" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {teacher.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{teacher.fullName}</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              {teacher.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {teacher.phone}
                </span>
              )}
              {teacher.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {teacher.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <TeacherProfileClient
        teacher={JSON.parse(JSON.stringify(teacher))}
        stats={stats}
        weeklySessions={JSON.parse(JSON.stringify(weeklySessions))}
        upcomingSessions={JSON.parse(JSON.stringify(upcomingSessions))}
      />
    </div>
  )
}
