import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { startOfMonth, endOfMonth, subMonths, addMonths, format } from "date-fns"
import { TrendingUp, Wallet, BarChart3 } from "lucide-react"
import { RevenueTrendChart } from "../components/revenue-trend-chart"

export const dynamic = "force-dynamic"

function buildMonthSeries(now: Date, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const start = startOfMonth(addMonths(subMonths(now, count - 1), index))
    const end = addMonths(start, 1)
    return { start, end, label: `T${start.getMonth() + 1}` }
  })
}

export default async function RevenueReportPage() {
  const now = new Date()
  const months = buildMonthSeries(now, 6)

  const [allPayments, courses] = await Promise.all([
    prisma.payment.findMany({
      where: { createdAt: { gte: months[0].start } },
      include: {
        student: { select: { id: true, fullName: true } },
        course: { select: { name: true } },
        class: { select: { name: true } },
      },
    }),
    prisma.course.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  // Stats theo tháng
  const chartData = months.map((month) => {
    const inMonth = allPayments.filter(
      (p) => p.createdAt >= month.start && p.createdAt < month.end
    )
    const totalAmount = inMonth.reduce((s, p) => s + p.totalAmount, 0)
    const paidAmount = inMonth.reduce((s, p) => s + p.paidAmount, 0)
    const refundAmount = inMonth
      .filter((p) => p.status === "REFUNDED")
      .reduce((s, p) => s + p.paidAmount, 0)
    return {
      month: month.label,
      totalAmount,
      paidAmount,
      netRevenue: paidAmount - refundAmount,
      // Shape cho RevenueTrendChart component có sẵn
      revenue: totalAmount,
      collected: paidAmount,
    }
  })

  // Tổng quan 6 tháng
  const totalRevenue = chartData.reduce((s, m) => s + m.totalAmount, 0)
  const totalCollected = chartData.reduce((s, m) => s + m.paidAmount, 0)
  const totalRefund = chartData.reduce((s, m) => s + m.netRevenue - m.paidAmount, 0) // negative
  const netRevenue = totalCollected + totalRefund

  // Top HV đóng nhiều nhất
  const studentPaidMap = new Map<string, { name: string; paid: number; count: number }>()
  for (const p of allPayments) {
    if (p.paidAmount <= 0) continue
    const key = p.student.id
    const existing = studentPaidMap.get(key) || {
      name: p.student.fullName,
      paid: 0,
      count: 0,
    }
    existing.paid += p.paidAmount
    existing.count += 1
    studentPaidMap.set(key, existing)
  }
  const topStudents = Array.from(studentPaidMap.values())
    .sort((a, b) => b.paid - a.paid)
    .slice(0, 10)

  // Doanh thu theo khóa học
  const courseRevenueMap = new Map<string, { name: string; revenue: number }>()
  for (const p of allPayments) {
    if (!p.course) continue
    const key = p.course.name
    const existing = courseRevenueMap.get(key) || { name: key, revenue: 0 }
    existing.revenue += p.paidAmount
    courseRevenueMap.set(key, existing)
  }
  const courseRevenue = Array.from(courseRevenueMap.values()).sort(
    (a, b) => b.revenue - a.revenue
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Báo cáo doanh thu</h1>
        <p className="text-sm text-muted-foreground">
          Tổng quan 6 tháng gần nhất (từ {format(months[0].start, "MM/yyyy")} đến {format(months[months.length - 1].start, "MM/yyyy")})
        </p>
      </div>

      {/* Tổng quan */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng phát sinh</CardDescription>
            <CardTitle className="text-2xl">{formatVND(totalRevenue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Tổng giá trị payments 6 tháng</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Đã thu</CardDescription>
            <CardTitle className="text-2xl text-green-700">{formatVND(totalCollected)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Tổng paidAmount</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Doanh thu ròng</CardDescription>
            <CardTitle className="text-2xl text-blue-700">{formatVND(netRevenue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Sau khi trừ REFUNDED</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tỷ lệ thu</CardDescription>
            <CardTitle className="text-2xl">
              {totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Đã thu / Tổng phát sinh</p>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ doanh thu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Xu hướng doanh thu 6 tháng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueTrendChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top HV */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Top 10 HV đóng nhiều nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
            ) : (
              <div className="space-y-2">
                {topStudents.map((s, idx) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.count} phiếu</p>
                      </div>
                    </div>
                    <p className="font-bold text-green-700">{formatVND(s.paid)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Doanh thu theo khóa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Doanh thu theo khóa học
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courseRevenue.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
            ) : (
              <div className="space-y-2">
                {courseRevenue.map((c) => {
                  const maxRevenue = courseRevenue[0].revenue
                  const percent = (c.revenue / maxRevenue) * 100
                  return (
                    <div key={c.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{c.name}</span>
                        <span className="font-bold text-blue-700">{formatVND(c.revenue)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}
