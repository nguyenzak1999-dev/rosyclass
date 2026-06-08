"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Separator } from "@/components/ui/separator"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Wallet,
  Printer,
  Undo2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { recordPayment, refundPayment } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RecordPaymentDialog } from "./components/record-payment-dialog"

interface Payment {
  id: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  paymentMethod: string
  status: string
  paymentDate: string | null
  dueDate: string | null
  note: string | null
  createdAt: string | Date
  student: {
    id: string
    fullName: string
    phone: string | null
    email: string | null
  }
  class: { id: string; name: string } | null
  course: { id: string; name: string } | null
  createdBy: { id: string; fullName: string } | null
}

interface PaymentDetailClientProps {
  payment: Payment
}

const methodLabels: Record<string, string> = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản",
  CARD: "Thẻ",
  OTHER: "Khác",
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function PaymentDetailClient({ payment }: PaymentDetailClientProps) {
  const router = useRouter()
  const [recordOpen, setRecordOpen] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)
  const [isRefunding, setIsRefunding] = useState(false)

  const percentPaid =
    payment.totalAmount > 0
      ? Math.round((payment.paidAmount / payment.totalAmount) * 100)
      : 0

  const canRecord =
    payment.status !== "PAID" &&
    payment.status !== "CANCELLED" &&
    payment.status !== "REFUNDED"
  const canRefund = payment.status === "PAID" || payment.status === "PARTIAL"

  const handleRefund = async () => {
    setIsRefunding(true)
    const res = await refundPayment(payment.id, "Yêu cầu từ khách hàng")
    setIsRefunding(false)
    if (res.success) {
      toast.success("Đã hoàn tiền")
      setRefundOpen(false)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  // Lịch sử thanh toán (parse từ note)
  const history = (payment.note || "")
    .split("\n")
    .filter((line) => line.startsWith("["))
    .map((line) => {
      // Format: [date] name - amount (method) - note
      const match = line.match(/^\[(.+?)\]\s+(.+?)\s+-\s+([\d,.]+đ)(?:\s+\((.+?)\))?(?:\s+-\s+(.+))?$/)
      if (match) {
        return {
          date: match[1],
          actor: match[2],
          amount: match[3],
          method: match[4] || "",
          note: match[5] || "",
        }
      }
      return { date: line, actor: "", amount: "", method: "", note: "" }
    })
    .reverse()

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        {canRecord && (
          <Button onClick={() => setRecordOpen(true)}>
            <Wallet className="w-4 h-4 mr-2" /> Ghi nhận thanh toán
          </Button>
        )}
        {canRefund && (
          <Button variant="outline" onClick={() => setRefundOpen(true)}>
            <Undo2 className="w-4 h-4 mr-2" /> Hoàn tiền
          </Button>
        )}
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> In biên lai
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Thông tin payment */}
        <Card className="lg:col-span-2 print:shadow-none">
          <CardHeader>
            <CardTitle>Thông tin thanh toán</CardTitle>
            <CardDescription>
              Tổng tiền, đã trả, còn lại và lịch sử
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <p className="text-xs text-muted-foreground">Tổng tiền</p>
                <p className="text-xl font-bold mt-1">{formatVND(payment.totalAmount)}</p>
              </div>
              <div className="p-4 border rounded-lg bg-green-50/50">
                <p className="text-xs text-muted-foreground">Đã trả</p>
                <p className="text-xl font-bold mt-1 text-green-700">
                  {formatVND(payment.paidAmount)}
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-red-50/50">
                <p className="text-xs text-muted-foreground">Còn lại</p>
                <p className="text-xl font-bold mt-1 text-red-700">
                  {formatVND(payment.remainingAmount)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tiến độ thanh toán</span>
                <span className="font-medium">{percentPaid}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    percentPaid === 100 ? "bg-green-500" : percentPaid > 0 ? "bg-yellow-500" : "bg-muted-foreground/30"
                  }`}
                  style={{ width: `${percentPaid}%` }}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Phương thức</p>
                <p className="font-medium">{methodLabels[payment.paymentMethod] || payment.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Trạng thái</p>
                <BadgeStatus status={payment.status} />
              </div>
              {payment.paymentDate && (
                <div>
                  <p className="text-xs text-muted-foreground">Ngày thanh toán gần nhất</p>
                  <p className="font-medium">
                    {format(new Date(payment.paymentDate), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
              )}
              {payment.dueDate && (
                <div>
                  <p className="text-xs text-muted-foreground">Hạn thanh toán</p>
                  <p
                    className={`font-medium ${
                      payment.remainingAmount > 0 &&
                      new Date(payment.dueDate) < new Date()
                        ? "text-red-700"
                        : ""
                    }`}
                  >
                    {format(new Date(payment.dueDate), "dd/MM/yyyy", { locale: vi })}
                    {payment.remainingAmount > 0 &&
                      new Date(payment.dueDate) < new Date() && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Quá hạn
                        </Badge>
                      )}
                  </p>
                </div>
              )}
              {payment.course && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Khóa học</p>
                  <Link
                    href={`/khoa-hoc/${payment.course.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {payment.course.name}
                  </Link>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Tạo bởi</p>
                <p className="text-sm">
                  {payment.createdBy?.fullName || "—"} ·{" "}
                  {format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin HV */}
        <Card>
          <CardHeader>
            <CardTitle>Học viên</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium text-lg">{payment.student.fullName}</p>
            {payment.student.phone && <p>📞 {payment.student.phone}</p>}
            {payment.student.email && <p>✉️ {payment.student.email}</p>}
            <Separator />
            <Link
              href={`/admin/students/${payment.student.id}`}
              className="text-primary hover:underline text-sm"
            >
              Xem hồ sơ học viên →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Lịch sử thanh toán */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thanh toán ({history.length})</CardTitle>
          <CardDescription>
            Tất cả các lần ghi nhận thanh toán (mới nhất trên cùng)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
              Chưa có lịch sử thanh toán.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((h, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {h.amount && <span className="text-green-700">{h.amount}</span>}
                      {h.method && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({methodLabels[h.method] || h.method})
                        </span>
                      )}
                    </p>
                    {h.note && (
                      <p className="text-xs text-muted-foreground mt-1">{h.note}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {h.actor} · {h.date}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note gốc (nếu có text thường, không phải history) */}
      {payment.note && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ghi chú</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {payment.note.split("\n").filter((l) => !l.startsWith("[")).join("\n") || "—"}
            </p>
          </CardContent>
        </Card>
      )}

      <RecordPaymentDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        paymentId={payment.id}
        remainingAmount={payment.remainingAmount}
        onSuccess={() => {
          setRecordOpen(false)
          router.refresh()
        }}
      />

      <ConfirmDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        title="Hoàn tiền payment này?"
        description={`Học viên sẽ được hoàn ${formatVND(payment.paidAmount)}. Trạng thái chuyển thành REFUNDED.`}
        confirmText="Xác nhận hoàn tiền"
        variant="destructive"
        onConfirm={handleRefund}
        isSubmitting={isRefunding}
      />
    </div>
  )
}
