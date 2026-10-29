import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, Award, GraduationCap } from "lucide-react"
import { vietnamDayRange, vietnamMonthStart, vietnamWeekStart } from "@/lib/curriculum"
import { calculateSessionHours } from "@/lib/payroll-utils"
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
  // Mốc theo giờ VN; mốc cuối không tính (00:00 thứ Hai tuần sau / ngày 1 tháng sau)
  const weekStart = vietnamWeekStart(now)
  const weekEnd = vietnamWeekStart(now, 1)
  const monthStart = vietnamMonthStart(now)
  const monthEnd = vietnamMonthStart(now, 1)

  const [weeklySessions, monthlyCompletedSessions, upcomingSessions] = await Promise.all([
    prisma.classSession.findMany({
      where: {
        teacherId: teacher.id,
        sessionDate: { gte: weekStart, lt: weekEnd },
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
        sessionDate: { gte: monthStart, lt: monthEnd },
        status: "COMPLETED",
      },
    }),
    prisma.classSession.findMany({
      where: {
        teacherId: teacher.id,
        // Từ đầu ngày hôm nay (giờ VN): buổi hôm nay lưu lúc 00:00 nên lọc "gte: now" sẽ bỏ sót
        sessionDate: { gte: vietnamDayRange(now).start },
        status: { in: ["SCHEDULED", "MAKE_UP"] },
      },
      orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
      take: 10,
      include: {
        class: { select: { id: true, name: true } },
        room: { select: { name: true } },
      },
    }),
  ])

  // Tính lương cơ bản tháng này: giờ dạy thực tế (giờ bắt đầu → kết thúc) của các buổi COMPLETED, giống bảng lương
  const sessionsThisMonth = await prisma.classSession.findMany({
    where: {
      teacherId: teacher.id,
      sessionDate: { gte: monthStart, lt: monthEnd },
      status: "COMPLETED",
    },
    select: { startTime: true, endTime: true },
  })
  const totalHoursThisMonth = sessionsThisMonth.reduce(
    (sum, s) => sum + calculateSessionHours(s.startTime, s.endTime),
    0
  )
  const baseSalaryThisMonth = totalHoursThisMonth * teacher.hourlyRate

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
