"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import {
  Banknote, Users, Clock, CheckCircle2, RefreshCw, ChevronLeft, ChevronRight
} from "lucide-react"
import { calculateSessionHours, formatVND, formatHours } from "@/lib/payroll-utils"
import { calculateAllPayrolls } from "../actions"
import { toast } from "sonner"
import { PayrollDetailSheet } from "./payroll-detail-sheet"

interface TeacherWithPayroll {
  id: string
  fullName: string
  hourlyRate: number
  avatar: string | null
  bankName: string | null
  bankAccountNo: string | null
  bankAccountName: string | null
  payrolls: {
    id: string
    month: number
    year: number
    totalHours: number
    hourlyRate: number
    baseAmount: number
    bonusAmount: number
    bonusReason: string | null
    deductAmount: number
    deductReason: string | null
    totalAmount: number
    status: "DRAFT" | "PAID"
    paidAt: Date | null
    notes: string | null
  }[]
  sessions: { startTime: string; endTime: string }[]
}

interface PayrollClientProps {
  teachers: TeacherWithPayroll[]
  month: number
  year: number
  totalFund: number
  paidCount: number
  totalTeachers: number
}

export function PayrollClient({
  teachers,
  month,
  year,
  totalFund,
  paidCount,
  totalTeachers,
}: PayrollClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null)
  const [mode, setMode] = useState<"view" | "edit">("view")

  const selectedPayroll = selectedTeacherId
    ? teachers.find((t) => t.id === selectedTeacherId)?.payrolls[0] ?? null
    : null
  const selectedTeacher = selectedTeacherId
    ? teachers.find((t) => t.id === selectedTeacherId) ?? null
    : null

  // Tính số giờ thực tế từ sessions (chưa có phiếu lương)
  const getSessionHours = (t: TeacherWithPayroll) => {
    if (t.payrolls[0]) return t.payrolls[0].totalHours
    return t.sessions.reduce((sum, s) => sum + calculateSessionHours(s.startTime, s.endTime), 0)
  }

  const navigateMonth = (direction: 1 | -1) => {
    let newMonth = month + direction
    let newYear = year
    if (newMonth > 12) { newMonth = 1; newYear++ }
    if (newMonth < 1) { newMonth = 12; newYear-- }
    router.push(`/admin/payroll?month=${newMonth}&year=${newYear}`)
  }

  const handleCalculateAll = () => {
    startTransition(async () => {
      const res = await calculateAllPayrolls(month, year)
      if (res.success) {
        toast.success(`Đã tính lương cho ${res.updated}/${res.total} giáo viên`)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const totalHoursAll = teachers.reduce((sum, t) => sum + getSessionHours(t), 0)

  const columns: ColumnDef<TeacherWithPayroll>[] = [
    {
      accessorKey: "fullName",
      header: "Giáo viên",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.fullName}</div>
      ),
    },
    {
      id: "hours",
      header: "Số giờ dạy",
      cell: ({ row }) => {
        const hours = getSessionHours(row.original)
        return <div className="tabular-nums">{formatHours(hours)}</div>
      },
    },
    {
      id: "hourlyRate",
      header: "Đơn giá/giờ",
      cell: ({ row }) => (
        <div className="tabular-nums text-muted-foreground">
          {formatVND(row.original.hourlyRate)}
        </div>
      ),
    },
    {
      id: "baseAmount",
      header: "Lương cơ bản",
      cell: ({ row }) => {
        const p = row.original.payrolls[0]
        const base = p ? p.baseAmount : getSessionHours(row.original) * row.original.hourlyRate
        return <div className="tabular-nums">{formatVND(base)}</div>
      },
    },
    {
      id: "totalAmount",
      header: "Thực lãnh",
      cell: ({ row }) => {
        const p = row.original.payrolls[0]
        const total = p ? p.totalAmount : getSessionHours(row.original) * row.original.hourlyRate
        return <div className="tabular-nums font-semibold">{formatVND(total)}</div>
      },
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const p = row.original.payrolls[0]
        if (!p) return <Badge variant="outline">Chưa chốt</Badge>
        return p.status === "PAID"
          ? <Badge className="bg-green-100 text-green-700 border-green-200">Đã thanh toán</Badge>
          : <Badge variant="secondary">Nháp</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const p = row.original.payrolls[0]
        const isPaid = p?.status === "PAID"

        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMode("view")
                setSelectedTeacherId(row.original.id)
              }}
            >
              Xem phiếu
            </Button>
            {isPaid && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMode("edit")
                  setSelectedTeacherId(row.original.id)
                }}
              >
                Sửa phiếu
              </Button>
            )}
            {!isPaid && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMode("edit")
                  setSelectedTeacherId(row.original.id)
                }}
              >
                Cập nhật
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  const MONTH_NAMES = [
    "", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bảng lương giáo viên</h1>
          <p className="text-muted-foreground text-sm">Tổng hợp và chốt lương hàng tháng</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Month navigator */}
          <div className="flex items-center gap-1 rounded-lg border bg-card px-3 py-1.5">
            <button
              onClick={() => navigateMonth(-1)}
              className="rounded p-0.5 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-24 text-center text-sm font-semibold">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="rounded p-0.5 hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Button
            onClick={handleCalculateAll}
            disabled={isPending}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            Tính lại lương
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quỹ lương tháng</CardTitle>
            <Banknote className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{formatVND(totalFund)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Giáo viên tham gia</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeachers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng giờ dạy</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatHours(totalHoursAll)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đã thanh toán</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidCount} / {totalTeachers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bảng giáo viên */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách giáo viên</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={teachers}
            searchKey="fullName"
            searchPlaceholder="Tìm giáo viên..."
            onRowClick={(row) => setSelectedTeacherId(row.id)}
          />
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      {selectedTeacher && (
        <PayrollDetailSheet
          teacher={selectedTeacher}
          payroll={selectedPayroll}
          month={month}
          year={year}
          mode={mode}
          sessionHours={getSessionHours(selectedTeacher)}
          open={!!selectedTeacherId}
          onClose={() => setSelectedTeacherId(null)}
          onRefresh={() => router.refresh()}
        />
      )}
    </div>
  )
}
