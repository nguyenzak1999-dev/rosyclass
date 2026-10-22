import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewChart } from "./components/overview-chart"
import { RecentSales } from "./components/recent-sales"
import { StudentDemographicsChart } from "./components/student-demographics-chart"
import { AttendanceChart } from "./components/attendance-chart"
import { LeadsChart } from "./components/leads-chart"
import { CourseRevenueChart } from "./components/course-revenue-chart"
import { StudentGrowthChart } from "./components/student-growth-chart"
import { TeacherHoursChart } from "./components/teacher-hours-chart"
import { Users, BookOpen, DollarSign, BarChart2 } from "lucide-react"
import { AGE_GROUP_LABELS, courseAgeGroup } from "@/lib/course-levels"

const dayNames = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function monthStart(date: Date, offset = 0) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1)
}

function buildMonthSeries(now: Date, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = monthStart(now, index - count + 1)
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: `T${date.getMonth() + 1}`,
      longLabel: `Tháng ${date.getMonth() + 1}`,
      start: date,
      end: monthStart(date, 1),
    }
  })
}

function getCourseGroup(level?: string | null) {
  const group = courseAgeGroup(level)
  if (group === "one-on-one") return "oneOnOne"
  if (group === "primary") return "primarySchool"
  return group
}

function getCourseGroupLabel(level?: string | null) {
  return AGE_GROUP_LABELS[courseAgeGroup(level)]
}

export default async function DashboardPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthSeries = buildMonthSeries(now, 12)
  const sixMonthSeries = buildMonthSeries(now, 6)
  const twelveMonthsAgo = monthSeries[0].start
  const sevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = startOfDay(new Date(now.getTime() - (6 - index) * 24 * 60 * 60 * 1000))
    return {
      date,
      label: dayNames[date.getDay()],
      key: date.toISOString().slice(0, 10),
    }
  })

  const [
    totalStudents,
    totalActiveClasses,
    monthlyRevenue,
    weeklyAttendance,
    totalAttendance,
    payments,
    recentPayments,
    students,
    leads,
    classStudents,
    sessions,
  ] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.class.count({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({
      where: { status: "PAID", paymentDate: { gte: startOfMonth } },
      _sum: { paidAmount: true }
    }),
    prisma.attendance.groupBy({
      by: ["status"],
      where: {
        session: {
          sessionDate: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      _count: true
    }),
    prisma.attendance.count({
      where: {
        session: {
          sessionDate: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }
    }),
    prisma.payment.findMany({
      where: {
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      include: {
        course: {
          select: {
            level: true,
          },
        },
      },
    }),
    prisma.payment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        student: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    }),
    prisma.student.findMany({
      where: {
        createdAt: {
          lte: now,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
    }),
    prisma.lead.findMany({
      where: {
        createdAt: {
          gte: sixMonthSeries[0].start,
        },
      },
      select: {
        createdAt: true,
      },
    }),
    prisma.classStudent.findMany({
      include: {
        class: {
          include: {
            course: {
              select: {
                level: true,
              },
            },
          },
        },
      },
    }),
    prisma.classSession.findMany({
      where: {
        sessionDate: {
          gte: twelveMonthsAgo,
        },
        status: {
          in: ["SCHEDULED", "COMPLETED"],
        },
      },
      include: {
        class: {
          include: {
            course: {
              select: {
                level: true,
              },
            },
          },
        },
      },
    }),
  ])

  const presentCount = weeklyAttendance.find(a => a.status === "PRESENT")?._count ?? 0
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

  const revenueAmount = monthlyRevenue._sum.paidAmount ?? 0
  const revenueFormatted = revenueAmount >= 1_000_000
    ? `${(revenueAmount / 1_000_000).toFixed(1)}M đ`
    : `${revenueAmount.toLocaleString('vi-VN')} đ`

  const overviewData = monthSeries.map((month) => ({
    name: month.label,
    total: payments
      .filter((payment) => {
        const date = payment.paymentDate || payment.createdAt
        return date >= month.start && date < month.end
      })
      .reduce((sum, payment) => sum + payment.paidAmount, 0),
  }))

  const courseRevenueData = sixMonthSeries.map((month) => {
    const base = {
      month: month.longLabel,
      preschool: 0,
      primarySchool: 0,
      oneOnOne: 0,
      other: 0,
    }

    payments.forEach((payment) => {
      const date = payment.paymentDate || payment.createdAt
      if (date < month.start || date >= month.end) return
      const group = getCourseGroup(payment.course?.level)
      base[group] += payment.paidAmount / 1_000_000
    })

    return base
  })

  const studentGrowthData = sixMonthSeries.map((month) => ({
    month: month.longLabel,
    newStudents: students.filter((student) => student.createdAt >= month.start && student.createdAt < month.end).length,
    totalStudents: students.filter((student) => student.createdAt < month.end).length,
  }))

  const leadsData = sixMonthSeries.map((month) => ({
    month: month.label,
    leads: leads.filter((lead) => lead.createdAt >= month.start && lead.createdAt < month.end).length,
  }))

  const weeklyAttendanceRows = await prisma.attendance.findMany({
    where: {
      session: {
        sessionDate: {
          gte: sevenDays[0].date,
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
  })

  const realAttendanceData = sevenDays.map((day) => {
    const dayRows = weeklyAttendanceRows.filter(
      (attendance) => startOfDay(attendance.session.sessionDate).toISOString().slice(0, 10) === day.key
    )
    const present = dayRows.filter((attendance) => attendance.status === "PRESENT" || attendance.status === "LATE").length
    return {
      day: day.label,
      rate: dayRows.length > 0 ? Math.round((present / dayRows.length) * 100) : 0,
    }
  })

  const demographicsMap = new Map<string, number>()
  classStudents.forEach((item) => {
    const label = getCourseGroupLabel(item.class.course.level)
    demographicsMap.set(label, (demographicsMap.get(label) || 0) + 1)
  })
  const studentDemographicsData = Array.from(demographicsMap.entries()).map(([name, value]) => ({ name, value }))

  const teacherHoursMap = new Map<string, number>()
  sessions.forEach((session) => {
    const label = getCourseGroupLabel(session.class.course.level)
    const [startHour = 0, startMinute = 0] = session.startTime.split(":").map(Number)
    const [endHour = startHour, endMinute = startMinute] = session.endTime.split(":").map(Number)
    const minutes = Math.max((endHour * 60 + endMinute) - (startHour * 60 + startMinute), 0)
    teacherHoursMap.set(label, (teacherHoursMap.get(label) || 0) + minutes / 60)
  })
  const teacherHoursData = Array.from(teacherHoursMap.entries()).map(([subject, hours]) => ({
    subject,
    hours: Number(hours.toFixed(1)),
  }))

  const recentSalesData = recentPayments.map((payment) => ({
    id: payment.id,
    studentName: payment.student.fullName,
    studentEmail: payment.student.email,
    amount: payment.paidAmount,
  }))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard Tổng Quan</h1>
      
      {/* Metrics Row — Real Data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Học Viên</CardTitle>
            <Users className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Đang học tích cực</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh Thu Tháng</CardTitle>
            <DollarSign className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{revenueFormatted}</div>
            <p className="text-xs text-muted-foreground">Tháng {now.getMonth() + 1}/{now.getFullYear()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lớp Đang Mở</CardTitle>
            <BookOpen className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{totalActiveClasses}</div>
            <p className="text-xs text-muted-foreground">Lớp đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ đi học</CardTitle>
            <BarChart2 className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">{attendanceRate > 0 ? `${attendanceRate}%` : "—"}</div>
            <p className="text-xs text-muted-foreground">7 ngày gần nhất</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Doanh thu theo khóa học</CardTitle>
            <CardDescription>Cơ cấu doanh thu các tháng gần đây</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <CourseRevenueChart data={courseRevenueData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Biến động học viên</CardTitle>
            <CardDescription>Tăng trưởng học viên mới và tổng số</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentGrowthChart data={studentGrowthData} />
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Tổng quan doanh thu (chung)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={overviewData} />
          </CardContent>
        </Card>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
            <CardDescription>Các khoản thanh toán mới nhất.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales data={recentSalesData} />
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ giờ dạy</CardTitle>
            <CardDescription>Theo chương trình học trong 12 tháng gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <TeacherHoursChart data={teacherHoursData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ chuyên cần</CardTitle>
            <CardDescription>Biến động trong tuần này</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceChart data={realAttendanceData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ học viên</CardTitle>
            <CardDescription>Theo các chương trình học</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentDemographicsChart data={studentDemographicsData} />
          </CardContent>
        </Card>
      </div>
      
      {/* Bottom Chart */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Khách hàng tiềm năng (Leads)</CardTitle>
            <CardDescription>Số lượng leads thu thập 6 tháng gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadsChart data={leadsData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
