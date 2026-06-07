import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { AttendanceRateChart } from "./components/attendance-rate-chart"
import { EnrollmentChart } from "./components/enrollment-chart"
import { RevenueTrendChart } from "./components/revenue-trend-chart"

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

export default async function ReportsPage() {
  const now = new Date()
  const months = buildMonthSeries(now, 6)
  const startDate = months[0].start

  const [payments, students, attendances] = await Promise.all([
    prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    }),
    prisma.student.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
    }),
    prisma.attendance.findMany({
      where: {
        session: {
          sessionDate: {
            gte: startDate,
          },
        },
      },
      include: {
        session: {
          select: {
            sessionDate: true,
          },
        },
      },
    }),
  ])

  const revenueData = months.map((month) => ({
    month: month.label,
    revenue: payments
      .filter((payment) => payment.createdAt >= month.start && payment.createdAt < month.end)
      .reduce((sum, payment) => sum + payment.totalAmount, 0),
    collected: payments
      .filter((payment) => {
        const date = payment.paymentDate || payment.createdAt
        return date >= month.start && date < month.end
      })
      .reduce((sum, payment) => sum + payment.paidAmount, 0),
  }))

  const enrollmentData = months.map((month) => ({
    month: month.label,
    newStudents: students.filter((student) => student.createdAt >= month.start && student.createdAt < month.end).length,
    droppedOut: students.filter(
      (student) => student.status === "DROPPED" && student.createdAt >= month.start && student.createdAt < month.end
    ).length,
  }))

  const attendanceData = months.map((month) => {
    const rows = attendances.filter(
      (attendance) => attendance.session.sessionDate >= month.start && attendance.session.sessionDate < month.end
    )
    const present = rows.filter((attendance) => attendance.status === "PRESENT" || attendance.status === "LATE").length
    return {
      month: month.label,
      rate: rows.length > 0 ? Math.round((present / rows.length) * 100) : 0,
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Báo cáo hệ thống</h1>
        <p className="text-sm text-muted-foreground">Dữ liệu tổng hợp 6 tháng gần nhất từ CMS và hệ thống vận hành.</p>
      </div>

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
    </div>
  )
}
