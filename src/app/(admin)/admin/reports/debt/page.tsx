import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AlertCircle, TrendingDown, CalendarClock } from "lucide-react"
import { differenceInDays } from "date-fns"
import { formatVietnam } from "@/lib/curriculum"
import { vi } from "date-fns/locale"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebtReportPage() {
  const now = new Date()

  // Lấy tất cả payments còn nợ
  const [debtPayments, totalDebt, totalOverdue] = await Promise.all([
    prisma.payment.findMany({
      where: {
        remainingAmount: { gt: 0 },
        status: { in: ["UNPAID", "PARTIAL"] },
      },
      include: {
        student: { select: { id: true, fullName: true, phone: true } },
        class: { select: { name: true } },
        course: { select: { name: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.payment.aggregate({
      where: {
        remainingAmount: { gt: 0 },
        status: { in: ["UNPAID", "PARTIAL"] },
      },
      _sum: { remainingAmount: true },
    }),
    prisma.payment.aggregate({
      where: {
        remainingAmount: { gt: 0 },
        status: { in: ["UNPAID", "PARTIAL"] },
        dueDate: { lt: now },
      },
      _sum: { remainingAmount: true },
    }),
  ])

  // Group theo học viên
  const studentDebtMap = new Map<
    string,
    {
      student: { id: string; fullName: string; phone: string | null }
      totalDebt: number
      oldestDue: Date | null
      payments: typeof debtPayments
    }
  >()

  for (const p of debtPayments) {
    const key = p.student.id
    const existing = studentDebtMap.get(key)
    if (existing) {
      existing.totalDebt += p.remainingAmount
      if (!existing.oldestDue || (p.dueDate && p.dueDate < existing.oldestDue)) {
        existing.oldestDue = p.dueDate
      }
      existing.payments.push(p)
    } else {
      studentDebtMap.set(key, {
        student: p.student,
        totalDebt: p.remainingAmount,
        oldestDue: p.dueDate,
        payments: [p],
      })
    }
  }

  const topDebtStudents = Array.from(studentDebtMap.values())
    .sort((a, b) => b.totalDebt - a.totalDebt)
    .slice(0, 20)

  // Quá hạn
  const overduePayments = debtPayments.filter(
    (p) => p.dueDate && new Date(p.dueDate) < now
  )

  function formatVND(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Báo cáo công nợ</h1>
        <p className="text-sm text-muted-foreground">
          Tổng {debtPayments.length} phiếu chưa thanh toán từ {studentDebtMap.size} học viên
        </p>
      </div>

      {/* Tổng quan */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Tổng nợ
            </CardDescription>
            <CardTitle className="text-3xl text-red-700">
              {formatVND(totalDebt._sum.remainingAmount || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Tất cả phiếu có remainingAmount &gt; 0
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-red-700">
              <AlertCircle className="w-3.5 h-3.5" /> Quá hạn
            </CardDescription>
            <CardTitle className="text-3xl text-red-700">
              {formatVND(totalOverdue._sum.remainingAmount || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-700">
              {overduePayments.length} phiếu quá hạn
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <CalendarClock className="w-3.5 h-3.5" /> Sắp đến hạn
            </CardDescription>
            <CardTitle className="text-3xl">
              {debtPayments.filter((p) => {
                if (!p.dueDate) return false
                const days = differenceInDays(new Date(p.dueDate), now)
                return days >= 0 && days <= 7
              }).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">phiếu đến hạn trong 7 ngày</p>
          </CardContent>
        </Card>
      </div>

      {/* Phiếu quá hạn */}
      {overduePayments.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">⚠️ Phiếu quá hạn ({overduePayments.length})</CardTitle>
            <CardDescription>
              Cần liên hệ học viên để thu hồi công nợ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {overduePayments.slice(0, 20).map((p) => {
                const overdueDays = p.dueDate
                  ? differenceInDays(now, new Date(p.dueDate))
                  : 0
                return (
                  <Link
                    key={p.id}
                    href={`/admin/payments/${p.id}`}
                    className="flex items-center justify-between p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-red-100 text-red-700">
                          {p.student.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium">{p.student.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.class?.name || p.course?.name || "—"} · Hạn:{" "}
                          {p.dueDate
                            ? formatVietnam(new Date(p.dueDate), "dd/MM/yyyy", { locale: vi })
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-700">{formatVND(p.remainingAmount)}</p>
                      <Badge variant="destructive" className="text-xs mt-1">
                        Quá hạn {overdueDays} ngày
                      </Badge>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top HV nợ nhiều */}
      <Card>
        <CardHeader>
          <CardTitle>Top 20 học viên nợ nhiều nhất</CardTitle>
          <CardDescription>
            Sắp xếp theo tổng nợ giảm dần
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topDebtStudents.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <p>Không có công nợ nào. 🎉</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topDebtStudents.map((sd, idx) => {
                const overdueDays = sd.oldestDue
                  ? Math.max(0, differenceInDays(now, new Date(sd.oldestDue)))
                  : 0
                const isOverdue = overdueDays > 0
                return (
                  <div
                    key={sd.student.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-muted text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{sd.student.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/students/${sd.student.id}`}
                          className="font-medium hover:underline text-primary"
                        >
                          {sd.student.fullName}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {sd.payments.length} phiếu · {isOverdue ? `Quá hạn ${overdueDays} ngày` : "Chưa quá hạn"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-700">{formatVND(sd.totalDebt)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        render={<Link href={`/admin/payments/${sd.payments[0]?.id}`} />}
                      >
                        Xem phiếu →
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
