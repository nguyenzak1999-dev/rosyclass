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

export default async function DashboardPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalStudents,
    totalActiveClasses,
    monthlyRevenue,
    weeklyAttendance,
    totalAttendance,
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
    })
  ])

  const presentCount = weeklyAttendance.find(a => a.status === "PRESENT")?._count ?? 0
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

  const revenueAmount = monthlyRevenue._sum.paidAmount ?? 0
  const revenueFormatted = revenueAmount >= 1_000_000
    ? `${(revenueAmount / 1_000_000).toFixed(1)}M đ`
    : `${revenueAmount.toLocaleString('vi-VN')} đ`

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard Tổng Quan</h1>
      
      {/* Metrics Row — Real Data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-chart-1/10 to-transparent border-chart-1/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Học Viên</CardTitle>
            <Users className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Đang học tích cực</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-chart-2/10 to-transparent border-chart-2/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh Thu Tháng</CardTitle>
            <DollarSign className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{revenueFormatted}</div>
            <p className="text-xs text-muted-foreground">Tháng {now.getMonth() + 1}/{now.getFullYear()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-chart-3/10 to-transparent border-chart-3/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lớp Đang Mở</CardTitle>
            <BookOpen className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{totalActiveClasses}</div>
            <p className="text-xs text-muted-foreground">Lớp đang hoạt động</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-chart-4/10 to-transparent border-chart-4/20">
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
        <Card className="col-span-4 border-t-4 border-t-chart-1">
          <CardHeader>
            <CardTitle>Doanh thu theo khóa học</CardTitle>
            <CardDescription>Cơ cấu doanh thu các tháng gần đây</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <CourseRevenueChart />
          </CardContent>
        </Card>
        <Card className="col-span-3 border-t-4 border-t-chart-2">
          <CardHeader>
            <CardTitle>Biến động học viên</CardTitle>
            <CardDescription>Tăng trưởng học viên mới và tổng số</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentGrowthChart />
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3 border-t-4 border-t-chart-3">
          <CardHeader>
            <CardTitle>Tổng quan doanh thu (chung)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
        <Card className="col-span-4 border-t-4 border-t-chart-4">
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
            <CardDescription>Các khoản thanh toán mới nhất.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-t-4 border-t-chart-5">
          <CardHeader>
            <CardTitle>Phân bổ giờ dạy</CardTitle>
            <CardDescription>Giáo viên VN vs Nước Ngoài</CardDescription>
          </CardHeader>
          <CardContent>
            <TeacherHoursChart />
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-chart-1">
          <CardHeader>
            <CardTitle>Tỷ lệ chuyên cần</CardTitle>
            <CardDescription>Biến động trong tuần này</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceChart />
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-chart-2">
          <CardHeader>
            <CardTitle>Phân bổ học viên</CardTitle>
            <CardDescription>Theo các chương trình học</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentDemographicsChart />
          </CardContent>
        </Card>
      </div>
      
      {/* Bottom Chart */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card className="border-t-4 border-t-chart-3">
          <CardHeader>
            <CardTitle>Khách hàng tiềm năng (Leads)</CardTitle>
            <CardDescription>Số lượng leads thu thập 6 tháng gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadsChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
