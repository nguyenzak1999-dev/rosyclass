"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Wallet, Loader2, AlertCircle } from "lucide-react"
import { recordPayment } from "../../actions"
import { PAYMENT_METHODS } from "@/lib/schemas/payment"
import { toast } from "sonner"
import { formatMoneyInput } from "@/lib/utils"

interface RecordPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentId: string
  remainingAmount: number
  onSuccess?: () => void
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  paymentId,
  remainingAmount,
  onSuccess,
}: RecordPaymentDialogProps) {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH")
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setAmount(remainingAmount > 0 ? String(remainingAmount) : "")
      setPaymentMethod("CASH")
      setNote("")
    }
  }, [open, remainingAmount])

  const numAmount = parseFloat(amount) || 0
  const willBeFull = numAmount >= remainingAmount

  const handleSubmit = async () => {
    if (numAmount <= 0) {
      toast.error("Số tiền phải > 0")
      return
    }
    if (numAmount > remainingAmount) {
      toast.error(`Số tiền không được vượt quá còn lại (${formatVND(remainingAmount)})`)
      return
    }

    setIsSubmitting(true)
    const res = await recordPayment({
      paymentId,
      amount: numAmount,
      paymentMethod: paymentMethod as "CASH" | "BANK_TRANSFER" | "CARD" | "OTHER",
      note: note || undefined,
    })
    setIsSubmitting(false)
    if (res.success) {
      toast.success(
        res.data?.status === "PAID"
          ? "Đã thanh toán đủ!"
          : `Đã ghi nhận ${formatVND(numAmount)}, còn lại ${formatVND(res.data?.remainingAmount ?? 0)}`
      )
      onSuccess?.()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Ghi nhận thanh toán
          </DialogTitle>
          <DialogDescription>
            Còn lại: <strong>{formatVND(remainingAmount)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="amount">Số tiền (VNĐ) *</Label>
            <Input
              id="amount"
              type="text"
              inputMode="numeric"
              value={formatMoneyInput(amount)}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, "")
                setAmount(clean)
              }}
              placeholder="VD: 1.000.000"
              disabled={isSubmitting}
            />
            {willBeFull && numAmount > 0 && (
              <p className="text-xs text-green-600">
                ✓ Sẽ thanh toán đủ (PAID)
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Phương thức</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as string)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Tiền mặt</SelectItem>
                <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                <SelectItem value="CARD">Thẻ</SelectItem>
                <SelectItem value="OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Ghi chú (tuỳ chọn)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Chuyển khoản Vietcombank 9/6/2026"
              disabled={isSubmitting}
              className="min-h-[80px]"
            />
          </div>

          {numAmount > remainingAmount && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-xs">
                Số tiền vượt quá số còn lại ({formatVND(remainingAmount)}).
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || numAmount <= 0 || numAmount > remainingAmount}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...
              </>
            ) : (
              "Xác nhận thanh toán"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
