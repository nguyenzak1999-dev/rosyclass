"use client"

import * as React from "react"
import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "./columns"
import { PaymentDialog } from "./payment-dialog"
import { ExportExcelButton } from "./export-excel-button"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"

interface PaymentsClientProps {
  payments: any[]
  students: { id: string; fullName: string }[]
  stats: {
    total: number
    totalAmount: number
    paidAmount: number
    remainingAmount: number
    unpaidCount: number
    partialCount: number
    paidCount: number
  }
  filterSlot?: React.ReactNode
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function PaymentsClient({
  payments,
  students,
  stats,
  filterSlot,
}: PaymentsClientProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Tài chính (Học phí)</h1>
          <p className="text-sm text-muted-foreground">
            Tổng {stats.total} phiếu · Đã thu {formatVND(stats.paidAmount)} · Còn nợ {formatVND(stats.remainingAmount)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportExcelButton data={payments} />
          <PaymentDialog students={students} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tổng giá trị</p>
                <p className="text-lg font-bold mt-1">{formatVND(stats.totalAmount)}</p>
              </div>
              <Wallet className="w-8 h-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Đã thu</p>
                <p className="text-lg font-bold mt-1 text-green-700">{formatVND(stats.paidAmount)}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Còn nợ</p>
                <p className="text-lg font-bold mt-1 text-red-700">{formatVND(stats.remainingAmount)}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Phiếu</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-red-100 text-red-700" variant="outline">
                    {stats.unpaidCount} chưa
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-700" variant="outline">
                    {stats.partialCount} 1 phần
                  </Badge>
                  <Badge className="bg-green-100 text-green-700" variant="outline">
                    {stats.paidCount} xong
                  </Badge>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {filterSlot}

      <DataTable
        columns={getColumns(students) as any}
        data={payments}
        searchKey="student.fullName"
        searchPlaceholder="Tìm theo tên học viên..."
      />
    </div>
  )
}

// Inline Badge for stats
function Badge({ className, variant, children }: any) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${
        variant === "outline" ? `border ${className}` : className
      }`}
    >
      {children}
    </span>
  )
}
