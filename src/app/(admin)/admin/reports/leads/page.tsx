import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Target, Award, ArrowRight } from "lucide-react"
import Link from "next/link"
import { LEAD_STATUSES, LEAD_SOURCES } from "@/lib/schemas/lead"

export const dynamic = "force-dynamic"

export default async function LeadConversionReportPage() {
  // Lấy tất cả leads trong 90 ngày gần nhất
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const [leads, allLeads] = await Promise.all([
    prisma.lead.findMany({
      where: { createdAt: { gte: ninetyDaysAgo } },
      include: {
        assignedTo: { select: { fullName: true } },
      },
    }),
    prisma.lead.findMany({
      select: { status: true, source: true, createdAt: true },
    }),
  ])

  // 1. Phân bố theo status
  const statusCounts: Record<string, number> = {}
  for (const lead of allLeads) {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1
  }

  // 2. Phân bố theo source
  const sourceCounts: Record<string, number> = {}
  for (const lead of allLeads) {
    const src = lead.source || "Chưa rõ"
    sourceCounts[src] = (sourceCounts[src] || 0) + 1
  }

  // 3. Conversion rate (NEW → ENROLLED)
  const totalLeads = allLeads.length
  const enrolledCount = statusCounts["ENROLLED"] || 0
  const conversionRate = totalLeads > 0 ? Math.round((enrolledCount / totalLeads) * 100) : 0

  // 4. Conversion rate theo source
  const sourceStats = Object.entries(sourceCounts)
    .map(([source, totalCount]) => {
      const sourceLeads = allLeads.filter((l) => (l.source || "Chưa rõ") === source)
      const enrolled = sourceLeads.filter((l) => l.status === "ENROLLED").length
      const rate = totalCount > 0 ? Math.round((enrolled / totalCount) * 100) : 0
      return { source, total: totalCount, enrolled, rate }
    })
    .sort((a, b) => b.total - a.total)

  // 5. Funnel: NEW → CONTACTED → CONSULTED → PLACEMENT_TEST_BOOKED → TESTED → WAITING_FOR_PAYMENT → ENROLLED
  const funnel = [
    { status: "NEW", label: "Mới", count: statusCounts["NEW"] || 0 },
    { status: "CONTACTED", label: "Đã liên hệ", count: statusCounts["CONTACTED"] || 0 },
    {
      status: "CONSULTED",
      label: "Đã tư vấn",
      count: statusCounts["CONSULTED"] || 0,
    },
    {
      status: "PLACEMENT_TEST_BOOKED",
      label: "Đã book test",
      count: statusCounts["PLACEMENT_TEST_BOOKED"] || 0,
    },
    {
      status: "TESTED",
      label: "Đã test",
      count: statusCounts["TESTED"] || 0,
    },
    {
      status: "WAITING_FOR_PAYMENT",
      label: "Chờ thanh toán",
      count: statusCounts["WAITING_FOR_PAYMENT"] || 0,
    },
    {
      status: "ENROLLED",
      label: "Đã nhập học",
      count: statusCounts["ENROLLED"] || 0,
    },
  ]
  const maxFunnelCount = Math.max(...funnel.map((f) => f.count), 1)

  // 6. Tổng quan 90 ngày
  const stats90d = {
    total: leads.length,
    new: leads.filter((l) => l.status === "NEW").length,
    contacted: leads.filter((l) =>
      ["CONTACTED", "CONSULTED", "PLACEMENT_TEST_BOOKED", "TESTED", "WAITING_FOR_PAYMENT", "ENROLLED"].includes(
        l.status
      )
    ).length,
    lost: leads.filter((l) => l.status === "LOST").length,
    enrolled: leads.filter((l) => l.status === "ENROLLED").length,
  }
  const conversionRate90d =
    stats90d.total > 0 ? Math.round((stats90d.enrolled / stats90d.total) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Báo cáo chuyển đổi Lead</h1>
        <p className="text-sm text-muted-foreground">
          Tổng quan {totalLeads} leads toàn thời gian · {stats90d.total} leads trong 90 ngày gần nhất
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Tổng leads
            </CardDescription>
            <CardTitle className="text-3xl">{totalLeads}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Tất cả thời gian</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Đã nhập học
            </CardDescription>
            <CardTitle className="text-3xl text-green-700">{enrolledCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Tổng ENROLLED</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5" /> Tỷ lệ chuyển đổi
            </CardDescription>
            <CardTitle className="text-3xl text-blue-700">{conversionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${conversionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Conversion 90 ngày
            </CardDescription>
            <CardTitle className="text-3xl">{conversionRate90d}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{stats90d.enrolled}/{stats90d.total} leads 90 ngày</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Phễu chuyển đổi</CardTitle>
          <CardDescription>
            Số lead qua từng giai đoạn (tổng thời gian)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {funnel.map((step, idx) => {
              const percent = (step.count / maxFunnelCount) * 100
              const isLast = idx === funnel.length - 1
              return (
                <div key={step.status} className="flex items-center gap-3">
                  <div className="w-32 text-sm font-medium truncate">
                    {step.label}
                  </div>
                  <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden relative">
                    <div
                      className={`h-full ${
                        isLast ? "bg-green-500" : "bg-blue-500"
                      } transition-all`}
                      style={{ width: `${percent}%` }}
                    />
                    <span className="absolute inset-0 flex items-center px-3 text-sm font-medium">
                      {step.count}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Theo source */}
        <Card>
          <CardHeader>
            <CardTitle>Theo nguồn</CardTitle>
            <CardDescription>Số lead và tỷ lệ convert theo từng nguồn</CardDescription>
          </CardHeader>
          <CardContent>
            {sourceStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
            ) : (
              <div className="space-y-2">
                {sourceStats.map((s) => (
                  <div key={s.source} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{s.source}</span>
                      <span className="text-muted-foreground">
                        {s.enrolled}/{s.total} →{" "}
                        <span className="font-bold text-blue-700">{s.rate}%</span>
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${(s.total / Math.max(...sourceStats.map((x) => x.total))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Phân bố status */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố trạng thái</CardTitle>
            <CardDescription>Số lead theo từng trạng thái</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {LEAD_STATUSES.map((s) => {
                const count = statusCounts[s] || 0
                const percent =
                  totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
                return (
                  <div
                    key={s}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <Badge variant="outline" className="text-xs">
                      {s}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{percent}%</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <Link href="/admin/leads" className="hover:underline text-primary">
          Xem chi tiết tất cả lead <ArrowRight className="w-3 h-3 inline" />
        </Link>
      </div>
    </div>
  )
}
