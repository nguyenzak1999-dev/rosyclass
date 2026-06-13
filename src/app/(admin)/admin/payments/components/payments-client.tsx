"use client"

import * as React from "react"
import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "./columns"
import { PaymentDialog } from "./payment-dialog"
import { PaymentReceiptDialog } from "./payment-receipt-dialog"
import { ExportExcelButton } from "./export-excel-button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Wallet, TrendingUp, AlertCircle, CheckCircle2, Search, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

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
  siteSettings?: any
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
  siteSettings,
}: PaymentsClientProps) {
  const [query, setQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list")
  const [selectedPayment, setSelectedPayment] = React.useState<any | null>(null)

  const filteredPayments = React.useMemo(() => {
    if (!query) return payments
    const lower = query.toLowerCase()
    return payments.filter(p => 
      p.student?.fullName?.toLowerCase().includes(lower) ||
      p.id?.toLowerCase().includes(lower) ||
      p.receiptCode?.toLowerCase().includes(lower) ||
      p.paymentMethod?.toLowerCase().includes(lower) ||
      p.status?.toLowerCase().includes(lower)
    )
  }, [payments, query])

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Quản lý Tài chính (Học phí)</h1>
          <p className="text-sm text-muted-foreground">
            Tổng {stats.total} phiếu · Đã thu {formatVND(stats.paidAmount)} · Còn nợ {formatVND(stats.remainingAmount)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <ExportExcelButton data={payments} />
          <PaymentDialog students={students} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Tổng giá trị</p>
                <p className="mt-1 truncate text-base font-bold sm:text-lg">{formatVND(stats.totalAmount)}</p>
              </div>
              <Wallet className="h-7 w-7 shrink-0 text-blue-500 opacity-80 sm:h-8 sm:w-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Đã thu</p>
                <p className="mt-1 truncate text-base font-bold text-green-700 sm:text-lg">{formatVND(stats.paidAmount)}</p>
              </div>
              <CheckCircle2 className="h-7 w-7 shrink-0 text-green-500 opacity-80 sm:h-8 sm:w-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Còn nợ</p>
                <p className="mt-1 truncate text-base font-bold text-red-700 sm:text-lg">{formatVND(stats.remainingAmount)}</p>
              </div>
              <AlertCircle className="h-7 w-7 shrink-0 text-red-500 opacity-80 sm:h-8 sm:w-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Phiếu</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
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
              <TrendingUp className="h-7 w-7 shrink-0 text-muted-foreground opacity-80 sm:h-8 sm:w-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {filterSlot && <div key="filter-slot-wrapper">{filterSlot}</div>}

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm phiếu thu theo tên học viên, mã phiếu..."
            className="h-10 bg-background pl-9"
          />
        </div>
        <div className="flex border rounded-lg p-0.5 bg-muted/40 shrink-0 self-end md:self-auto">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        filteredPayments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPayments.map((payment) => {
              return (
                <Card
                  key={payment.id}
                  className="transition-all hover:border-primary/30 hover:shadow-sm flex flex-col justify-between"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="text-xs uppercase text-primary font-mono hover:underline text-left font-semibold"
                        >
                          Mã: {payment.receiptCode || `#${payment.id.split('-')[0]}`}
                        </button>
                        <h3 className="font-semibold text-base truncate text-primary mt-0.5">
                          {payment.student?.fullName || "—"}
                        </h3>
                      </div>
                      <Badge className={payment.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} variant="outline">
                        {payment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 pb-3 text-sm flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tổng tiền:</span>
                      <span className="font-bold text-primary text-base">{formatVND(payment.totalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Đã đóng:</span>
                      <span className="font-medium text-green-700">{formatVND(payment.paidAmount)}</span>
                    </div>
                    {payment.remainingAmount > 0 && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Còn nợ:</span>
                        <span className="font-medium text-red-700">{formatVND(payment.remainingAmount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>Phương thức:</span>
                      <Badge className="bg-slate-100 text-slate-800" variant="outline">{payment.paymentMethod}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
                      Ngày tạo: {format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm")}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 border-t bg-muted/10 flex items-center justify-end gap-2 h-12">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      Xem biên lai
                    </Button>
                    <PaymentDialog 
                      initialData={payment}
                      students={students} 
                      trigger={<Button variant="ghost" size="sm">Sửa</Button>} 
                    />
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 text-center">
            <TrendingUp className="mb-3 h-10 w-10 text-muted-foreground/60" />
            <p className="font-medium">Không tìm thấy phiếu thu phù hợp</p>
          </div>
        )
      ) : (
        <DataTable
          columns={getColumns(students, setSelectedPayment) as any}
          data={filteredPayments}
          onRowClick={(row) => setSelectedPayment(row)}
        />
      )}

      {/* Payment Receipt Dialog Modal */}
      <PaymentReceiptDialog
        payment={selectedPayment}
        open={!!selectedPayment}
        onOpenChange={(open) => !open && setSelectedPayment(null)}
        siteSettings={siteSettings}
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
