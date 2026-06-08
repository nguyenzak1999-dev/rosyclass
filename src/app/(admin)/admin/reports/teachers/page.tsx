import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { GraduationCap, Clock, DollarSign, TrendingUp, Calendar } from "lucide-react"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import { vi } from "date-fns/locale"
import Link from "next/link"

export const dynamic = "force-dynamic"

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function TeacherWorkloadReportPage() {
  const now = new Date()
  const monthStart = startOfMonth(subMonths(now, 1))
  const monthEnd = endOfMonth(now)

  const teachers = await prisma.teacher.findMany({
    include: {
      classes: {
        where: {
          status: { in: ["ACTIVE", "UPCOMING", "COMPLETED"] },
        },
        select: { id: true, name: true, status: true },
      },
    },
    orderBy: { fullName: "asc" },
  })

  // Lấy tất cả sessions COMPLETED trong tháng vừa qua + hiện tại
  const sessions = await prisma.classSession.findMany({
    where: {
      status: "COMPLETED",
      sessionDate: { gte: monthStart, lte: monthEnd },
    },
    include: {
      class: {
        select: { course: { select: { sessionDurationMinutes: true } } },
      },
    },
  })

  // Group by teacher
  const teacherStats = teachers.map((teacher) => {
    const teacherSessions = sessions.filter((s) => s.teacherId === teacher.id)
    const totalMinutes = teacherSessions.reduce(
      (sum, s) => sum + (s.class.course.sessionDurationMinutes || 90),
      0
    )
    const totalHours = totalMinutes / 60
    const baseSalary = totalHours * teacher.hourlyRate
    return {
      id: teacher.id,
      fullName: teacher.fullName,
      hourlyRate: teacher.hourlyRate,
      status: teacher.status,
      totalClasses: teacher.classes.length,
      activeClasses: teacher.classes.filter(
        (c) => c.status === "ACTIVE" || c.status === "UPCOMING"
      ).length,
      monthlySessions: teacherSessions.length,
      monthlyHours: Math.round(totalHours * 10) / 10,
      monthlySalary: baseSalary,
    }
  })

  // Sort theo lương tháng giảm dần
  teacherStats.sort((a, b) => b.monthlySalary - a.monthlySalary)

  // Total stats
  const totalMonthlySessions = teacherStats.reduce(
    (s, t) => s + t.monthlySessions,
    0
  )
  const totalMonthlyHours = teacherStats.reduce(
    (s, t) => s + t.monthlyHours,
    0
  )
  const totalMonthlySalary = teacherStats.reduce(
    (s, t) => s + t.monthlySalary,
    0
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Báo cáo khối lượng giảng dạy</h1>
        <p className="text-sm text-muted-foreground">
          Tổng quan tháng {format(monthStart, "MM/yyyy")} - {format(monthEnd, "MM/yyyy")} · {totalMonthlySessions} buổi · {totalMonthlyHours.toFixed(1)} giờ
        </p>
      </div>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> Tổng GV
            </CardDescription>
            <CardTitle className="text-3xl">{teachers.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {teachers.filter((t) => t.status === "ACTIVE").length} đang dạy
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Tổng buổi dạy
            </CardDescription>
            <CardTitle className="text-3xl">{totalMonthlySessions}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Trong 2 tháng gần nhất</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Tổng giờ dạy
            </CardDescription>
            <CardTitle className="text-3xl">{totalMonthlyHours.toFixed(1)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Trung bình {(totalMonthlyHours / Math.max(teachers.length, 1)).toFixed(1)} giờ/GV</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Tổng lương
            </CardDescription>
            <CardTitle className="text-3xl text-green-700">{formatVND(totalMonthlySalary)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Lương cơ bản theo hourlyRate</p>
          </CardContent>
        </Card>
      </div>

      {/* Bảng chi tiết */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết từng giáo viên</CardTitle>
          <CardDescription>
            Sắp xếp theo lương tháng giảm dần · Lương = số giờ × hourlyRate
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teacherStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có giáo viên nào.</p>
          ) : (
            <div className="space-y-2">
              {teacherStats.map((t, idx) => {
                const maxSalary = teacherStats[0].monthlySalary
                const percent =
                  maxSalary > 0
                    ? Math.round((t.monthlySalary / maxSalary) * 100)
                    : 0
                return (
                  <Link
                    key={t.id}
                    href={`/admin/teachers/${t.id}`}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {idx + 1}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{t.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{t.fullName}</p>
                        <Badge
                          variant={t.status === "ACTIVE" ? "default" : "outline"}
                          className="text-xs"
                        >
                          {t.status === "ACTIVE" ? "Đang dạy" : "Ngừng dạy"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.activeClasses}/{t.totalClasses} lớp đang mở ·{" "}
                        {t.monthlySessions} buổi · {t.monthlyHours}h
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium">
                        {t.hourlyRate.toLocaleString("vi-VN")}đ/giờ
                      </p>
                      <p className="text-lg font-bold text-green-700">
                        {formatVND(t.monthlySalary)}
                      </p>
                    </div>
                    <div className="w-24 flex-shrink-0">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
