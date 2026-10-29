import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatVietnam, vietnamDayRange, vietnamMonthStart } from "@/lib/curriculum"
import { vi } from "date-fns/locale"
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Users, Calendar } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AttendanceReportPage() {
  const now = new Date()
  const monthStart = vietnamMonthStart(now, -1)
  // Mốc cuối (không tính): 00:00 giờ VN ngày 1 tháng sau
  const nextMonthStart = vietnamMonthStart(now, 1)
  const monthEnd = new Date(nextMonthStart.getTime() - 1)

  // Lấy tất cả sessions COMPLETED trong 2 tháng gần nhất + attendances
  const [sessions, classes, students] = await Promise.all([
    prisma.classSession.findMany({
      where: {
        // Chỉ các buổi đã diễn ra (tới hết hôm nay): buổi tương lai chưa điểm danh làm sai số buổi
        sessionDate: { gte: monthStart, lt: vietnamDayRange(now, 1).start },
        status: { in: ["COMPLETED", "SCHEDULED", "MAKE_UP"] },
      },
      include: {
        class: { select: { id: true, name: true, course: { select: { name: true } } } },
        attendances: {
          select: {
            studentId: true,
            status: true,
            student: { select: { id: true, fullName: true } },
          },
        },
      },
    }),
    prisma.class.findMany({
      select: {
        id: true,
        name: true,
        course: { select: { name: true } },
        _count: { select: { students: { where: { status: "ACTIVE" } } } },
      },
    }),
    prisma.student.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true },
    }),
  ])

  // === Thống kê tổng quan ===
  const totalAttendances = sessions.flatMap((s) => s.attendances)
  const presentCount = totalAttendances.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE"
  ).length
  const absentWithPermission = totalAttendances.filter(
    (a) => a.status === "ABSENT_WITH_PERMISSION"
  ).length
  const absentWithoutPermission = totalAttendances.filter(
    (a) => a.status === "ABSENT_WITHOUT_PERMISSION"
  ).length
  const overallRate =
    totalAttendances.length > 0
      ? Math.round((presentCount / totalAttendances.length) * 100)
      : 0

  // === Thống kê theo lớp ===
  const classStats = classes
    .map((cls) => {
      const classSessions = sessions.filter((s) => s.class.id === cls.id)
      const classAttendances = classSessions.flatMap((s) => s.attendances)
      const classPresent = classAttendances.filter(
        (a) => a.status === "PRESENT" || a.status === "LATE"
      ).length
      const classAbsent = classAttendances.filter(
        (a) => a.status === "ABSENT_WITHOUT_PERMISSION"
      ).length
      const rate =
        classAttendances.length > 0
          ? Math.round((classPresent / classAttendances.length) * 100)
          : 0
      return {
        classId: cls.id,
        className: cls.name,
        courseName: cls.course.name,
        totalStudents: cls._count.students,
        totalSessions: classSessions.length,
        totalAttendances: classAttendances.length,
        present: classPresent,
        absent: classAbsent,
        rate,
      }
    })
    .filter((c) => c.totalSessions > 0) // chỉ lấy lớp có buổi học
    .sort((a, b) => b.rate - a.rate)

  // === Thống kê theo học viên (top nghỉ nhiều) ===
  const studentAbsentMap = new Map<string, { student: { id: string; fullName: string }; present: number; absent: number; late: number; total: number }>()
  for (const a of totalAttendances) {
    const key = a.studentId
    const existing = studentAbsentMap.get(key) || {
      student: a.student,
      present: 0,
      absent: 0,
      late: 0,
      total: 0,
    }
    existing.total += 1
    if (a.status === "PRESENT") existing.present += 1
    else if (a.status === "LATE") existing.late += 1
    else if (a.status === "ABSENT_WITHOUT_PERMISSION") existing.absent += 1
    studentAbsentMap.set(key, existing)
  }

  const studentStats = Array.from(studentAbsentMap.values())
    .map((s) => ({
      ...s,
      rate: s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0,
    }))
    .sort((a, b) => b.absent - a.absent || a.rate - b.rate)
    .slice(0, 10)

  // === Alert: HV nghỉ >= 3 lần không phép ===
  const studentsAtRisk = studentStats.filter((s) => s.absent >= 3).slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Báo cáo chuyên cần</h1>
        <p className="text-sm text-muted-foreground">
          Từ {formatVietnam(monthStart, "dd/MM/yyyy")} đến {formatVietnam(monthEnd, "dd/MM/yyyy")} · Dữ liệu từ{" "}
          {sessions.length} buổi học
        </p>
      </div>

      {/* Tổng quan */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tỷ lệ chuyên cần</CardDescription>
            <CardTitle className="text-3xl">{overallRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={overallRate} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Có mặt / Đi muộn</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-6 h-6" />
              {presentCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              / {totalAttendances.length} lượt điểm danh
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vắng không phép</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2 text-red-700">
              <XCircle className="w-6 h-6" />
              {absentWithoutPermission}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">lượt</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vắng có phép</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="w-6 h-6" />
              {absentWithPermission}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">lượt</p>
          </CardContent>
        </Card>
      </div>

      {/* Cảnh báo HV nghỉ nhiều */}
      {studentsAtRisk.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Cảnh báo: Học viên vắng không phép ≥ 3 lần
            </CardTitle>
            <CardDescription>
              Cần liên hệ với phụ huynh / học viên để tìm hiểu nguyên nhân
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {studentsAtRisk.map((s) => (
                <div
                  key={s.student.id}
                  className="flex items-center justify-between p-3 bg-background border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-red-100 text-red-700">
                        {s.student.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/admin/students/${s.student.id}`}
                        className="font-medium hover:underline text-primary"
                      >
                        {s.student.fullName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Vắng KP: {s.absent} / Tổng: {s.total} buổi
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">{s.rate}% chuyên cần</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Thống kê theo lớp */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Tỷ lệ chuyên cần theo lớp
            </CardTitle>
            <CardDescription>
              {classStats.length} lớp có buổi học trong khoảng thời gian này
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classStats.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {classStats.map((c) => {
                  const color =
                    c.rate >= 80
                      ? "bg-green-500"
                      : c.rate >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  return (
                    <Link
                      key={c.classId}
                      href={`/admin/classes/${c.classId}`}
                      className="block p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{c.className}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.courseName} · {c.totalSessions} buổi · {c.totalStudents} HV
                          </p>
                        </div>
                        <Badge
                          variant={
                            c.rate >= 80
                              ? "default"
                              : c.rate >= 60
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {c.rate}%
                        </Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} transition-all`}
                          style={{ width: `${c.rate}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" /> {c.present}
                        </span>
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-600" /> {c.absent}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top HV nghỉ nhiều nhất */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Top 10 HV cần chú ý
            </CardTitle>
            <CardDescription>Sắp xếp theo số lần vắng không phép</CardDescription>
          </CardHeader>
          <CardContent>
            {studentStats.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu điểm danh.
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {studentStats.map((s) => (
                  <Link
                    key={s.student.id}
                    href={`/admin/students/${s.student.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {s.student.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{s.student.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.present} có mặt · {s.late} muộn · {s.absent} vắng KP
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        s.rate >= 80
                          ? "default"
                          : s.rate >= 60
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {s.rate}%
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
