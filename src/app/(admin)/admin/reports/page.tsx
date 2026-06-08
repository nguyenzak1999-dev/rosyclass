import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { AttendanceRateChart } from "./components/attendance-rate-chart"
import { EnrollmentChart } from "./components/enrollment-chart"
import { RevenueTrendChart } from "./components/revenue-trend-chart"
import {
  TrendingUp,
  Users,
  Wallet,
  GraduationCap,
  CalendarCheck,
  AlertCircle,
  ArrowRight,
  FileText,
  DollarSign,
  BarChart3,
  Briefcase,
} from "lucide-react"
import Link from "next/link"

function monthStart(date: Date, offset = 0) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1)
}

function buildMonthSeries(now: Date, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = monthStart(now, index - count + 1)
    return {
      label: `T${date.getMonth() + 1}`,
      start: date,
      end: monthStart(date, 1),
    }
  })
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function ReportsPage() {
  const now = new Date()
  const months = buildMonthSeries(now, 6)
  const startDate = months[0].start

  const [payments, students, attendances, leads, activeClasses, debtStats] =
    await Promise.all([
      prisma.payment.findMany({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.student.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, status: true },
      }),
      prisma.attendance.findMany({
        where: {
          session: { sessionDate: { gte: startDate } },
        },
        include: { session: { select: { sessionDate: true } } },
      }),
      prisma.lead.findMany({ select: { status: true, createdAt: true } }),
      prisma.class.findMany({
        where: { status: { in: ["ACTIVE", "UPCOMING"] } },
        include: {
          _count: { select: { students: { where: { status: "ACTIVE" } } } },
        },
      }),
      prisma.payment.aggregate({
        where: {
          remainingAmount: { gt: 0 },
          status: { in: ["UNPAID", "PARTIAL"] },
        },
        _sum: { remainingAmount: true },
        _count: true,
      }),
    ])

  // === KPI Cards (6 tháng gần nhất) ===
  const totalRevenue6m = payments.reduce((s, p) => s + p.totalAmount, 0)
  const totalCollected6m = payments.reduce((s, p) => s + p.paidAmount, 0)
  const totalDebt = debtStats._sum.remainingAmount || 0
  const totalActiveClasses = activeClasses.length
  const totalActiveStudents = activeClasses.reduce(
    (s, c) => s + c._count.students,
    0
  )
  const totalCapacity = activeClasses.reduce((s, c) => s + c.maxStudents, 0)
  const occupancyRate =
    totalCapacity > 0 ? Math.round((totalActiveStudents / totalCapacity) * 100) : 0
  const totalEnrolled6m = students.length
  const totalLeads = leads.length
  const enrolledLeads = leads.filter((l) => l.status === "ENROLLED").length
  const conversionRate =
    totalLeads > 0 ? Math.round((enrolledLeads / totalLeads) * 100) : 0

  // Chuyên cần 6 tháng
  const totalAtt = attendances.length
  const presentAtt = attendances.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE"
  ).length
  const overallAttendanceRate =
    totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0

  // Charts
  const revenueData = months.map((month) => ({
    month: month.label,
    revenue: payments
      .filter((p) => p.createdAt >= month.start && p.createdAt < month.end)
      .reduce((s, p) => s + p.totalAmount, 0),
    collected: payments
      .filter((p) => {
        const date = p.paymentDate || p.createdAt
        return date >= month.start && date < month.end
      })
      .reduce((s, p) => s + p.paidAmount, 0),
  }))

  const enrollmentData = months.map((month) => ({
    month: month.label,
    newStudents: students.filter(
      (s) => s.createdAt >= month.start && s.createdAt < month.end
    ).length,
    droppedOut: students.filter(
      (s) =>
        s.status === "DROPPED" &&
        s.createdAt >= month.start &&
        s.createdAt < month.end
    ).length,
  }))

  const attendanceData = months.map((month) => {
    const rows = attendances.filter(
      (a) =>
        a.session.sessionDate >= month.start && a.session.sessionDate < month.end
    )
    const present = rows.filter(
      (a) => a.status === "PRESENT" || a.status === "LATE"
    ).length
    return {
      month: month.label,
      rate: rows.length > 0 ? Math.round((present / rows.length) * 100) : 0,
    }
  })

  // Sub-reports links
  const subReports = [
    {
      title: "Báo cáo chuyên cần",
      description: "Tỷ lệ điểm danh theo HV, lớp, top HV nghỉ nhiều",
      href: "/admin/reports/attendance",
      icon: CalendarCheck,
      color: "text-blue-700 bg-blue-50",
    },
    {
      title: "Báo cáo doanh thu",
      description: "Doanh thu 6 tháng, top HV, doanh thu theo khóa học",
      href: "/admin/reports/revenue",
      icon: DollarSign,
      color: "text-green-700 bg-green-50",
    },
    {
      title: "Báo cáo công nợ",
      description: "Danh sách HV nợ, quá hạn, sắp đến hạn",
      href: "/admin/reports/debt",
      icon: AlertCircle,
      color: "text-red-700 bg-red-50",
    },
    {
      title: "Báo cáo chuyển đổi Lead",
      description: "Tỷ lệ convert NEW → ENROLLED, theo nguồn",
      href: "/admin/reports/leads",
      icon: FileText,
      color: "text-purple-700 bg-purple-50",
    },
    {
      title: "Báo cáo lấp đầy lớp",
      description: "Lớp đầy/sắp đầy/còn nhiều chỗ, % occupancy",
      href: "/admin/reports/classes",
      icon: BarChart3,
      color: "text-orange-700 bg-orange-50",
    },
    {
      title: "Báo cáo khối lượng GV",
      description: "Tổng buổi dạy, giờ dạy, lương theo tháng",
      href: "/admin/reports/teachers",
      icon: Briefcase,
      color: "text-cyan-700 bg-cyan-50",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Báo cáo hệ thống</h1>
        <p className="text-sm text-muted-foreground">
          Dữ liệu tổng hợp 6 tháng gần nhất từ toàn hệ thống.
        </p>
      </div>

      {/* 6 KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" /> Doanh thu 6 tháng
            </CardDescription>
            <CardTitle className="text-xl">{formatVND(totalRevenue6m)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-700">
              Đã thu {formatVND(totalCollected6m)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Công nợ
            </CardDescription>
            <CardTitle className="text-xl text-red-700">{formatVND(totalDebt)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {debtStats._count} phiếu chưa thanh toán
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> Lớp đang mở
            </CardDescription>
            <CardTitle className="text-xl">{totalActiveClasses}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-700">
              {totalActiveStudents}/{totalCapacity} HV · {occupancyRate}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <CalendarCheck className="w-3.5 h-3.5" /> Chuyên cần TB
            </CardDescription>
            <CardTitle className="text-xl">{overallAttendanceRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {presentAtt}/{totalAtt} lượt
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> HV mới 6 tháng
            </CardDescription>
            <CardTitle className="text-xl">{totalEnrolled6m}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Đã nhập học</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Conversion Lead
            </CardDescription>
            <CardTitle className="text-xl">{conversionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {enrolledLeads}/{totalLeads} leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu</CardTitle>
            <CardDescription>Học phí phát sinh và số tiền đã thu</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart data={revenueData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tuyển sinh</CardTitle>
            <CardDescription>Học viên mới và học viên nghỉ học</CardDescription>
          </CardHeader>
          <CardContent>
            <EnrollmentChart data={enrollmentData} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tỷ lệ chuyên cần</CardTitle>
            <CardDescription>Dựa trên dữ liệu điểm danh theo buổi học</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceRateChart data={attendanceData} />
          </CardContent>
        </Card>
      </div>

      {/* Sub-reports grid */}
      <div>
        <h2 className="mb-3 text-lg font-medium">Báo cáo chi tiết</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {subReports.map((report) => (
            <Link key={report.href} href={report.href}>
              <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${report.color}`}>
                    <report.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{report.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {report.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
