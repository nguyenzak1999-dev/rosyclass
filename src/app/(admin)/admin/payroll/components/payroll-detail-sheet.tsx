"use client"

import { useState, useTransition, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Clock, CheckCircle2, Calculator, Save, ChevronDown, ChevronUp, Pencil
} from "lucide-react"
import { formatVND, formatHours } from "@/lib/payroll-utils"
import {
  calculateTeacherPayroll,
  updatePayrollExtras,
  markPayrollAsPaid,
  getPayrollDetail,
} from "../actions"
import { toast } from "sonner"

interface Payroll {
  id: string
  totalHours: number
  hourlyRate: number
  baseAmount: number
  bonusAmount: number
  deductAmount: number
  bonusReason: string | null
  deductReason: string | null
  totalAmount: number
  notes: string | null
  status: "DRAFT" | "PAID"
  paidAt: Date | null
}

interface PayrollDetailSheetProps {
  teacher: {
    id: string
    fullName: string
    hourlyRate: number
    avatar: string | null
  }
  payroll: Payroll | null
  month: number
  year: number
  sessionHours: number
  open: boolean
  onClose: () => void
  onRefresh: () => void
}

const MONTH_NAMES = [
  "", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
]

export function PayrollDetailSheet({
  teacher,
  payroll,
  month,
  year,
  sessionHours,
  open,
  onClose,
  onRefresh,
}: PayrollDetailSheetProps) {
  const [isPending, startTransition] = useTransition()

  // Form state — luôn hiển thị, kể cả chưa có payroll
  const [hourlyRate, setHourlyRate] = useState(payroll?.hourlyRate ?? teacher.hourlyRate)
  const [bonus, setBonus] = useState(payroll?.bonusAmount ?? 0)
  const [bonusReason, setBonusReason] = useState(payroll?.bonusReason ?? "")
  const [deduct, setDeduct] = useState(payroll?.deductAmount ?? 0)
  const [deductReason, setDeductReason] = useState(payroll?.deductReason ?? "")
  const [notes, setNotes] = useState(payroll?.notes ?? "")

  // Sessions detail toggle
  const [showSessions, setShowSessions] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  // Sync form khi payroll prop thay đổi
  useEffect(() => {
    setHourlyRate(payroll?.hourlyRate ?? teacher.hourlyRate)
    setBonus(payroll?.bonusAmount ?? 0)
    setBonusReason(payroll?.bonusReason ?? "")
    setDeduct(payroll?.deductAmount ?? 0)
    setDeductReason(payroll?.deductReason ?? "")
    setNotes(payroll?.notes ?? "")
  }, [payroll, teacher.hourlyRate])

  // Load sessions khi mở toggle
  const handleToggleSessions = () => {
    if (!showSessions && payroll && sessions.length === 0) {
      setLoadingSessions(true)
      getPayrollDetail(payroll.id).then((data) => {
        setSessions(data?.sessions ?? [])
        setLoadingSessions(false)
      })
    }
    setShowSessions((v) => !v)
  }

  // Preview real-time
  const baseAmount = payroll ? payroll.baseAmount : sessionHours * hourlyRate
  const previewTotal = baseAmount + bonus - deduct

  const isPaid = payroll?.status === "PAID"

  // Tính lương (tạo mới hoặc tính lại) — kèm theo toàn bộ form
  const handleCalculate = () => {
    startTransition(async () => {
      const res = await calculateTeacherPayroll(teacher.id, month, year, {
        hourlyRate,
        bonusAmount: bonus,
        bonusReason: bonusReason || undefined,
        deductAmount: deduct,
        deductReason: deductReason || undefined,
        notes: notes || undefined,
      })
      if (res.success) {
        toast.success("Đã tính lương và lưu điều chỉnh")
        setSessions([]) // reset sessions cache
        onRefresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  // Lưu thưởng/khấu trừ (chỉ khi đã có payroll)
  const handleSaveExtras = () => {
    if (!payroll) return
    startTransition(async () => {
      const res = await updatePayrollExtras(payroll.id, {
        bonusAmount: bonus,
        bonusReason: bonusReason || undefined,
        deductAmount: deduct,
        deductReason: deductReason || undefined,
        notes: notes || undefined,
      })
      if (res.success) {
        toast.success("Đã cập nhật phiếu lương")
        onRefresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  // Xác nhận trả lương
  const handleMarkPaid = () => {
    if (!payroll) return
    startTransition(async () => {
      const res = await markPayrollAsPaid(payroll.id)
      if (res.success) {
        toast.success("Đã xác nhận thanh toán lương!")
        onRefresh()
        onClose()
      } else {
        toast.error(res.error)
      }
    })
  }

  const displayHours = payroll ? payroll.totalHours : sessionHours

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col gap-0 p-0">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold">{teacher.fullName}</div>
              <div className="text-sm font-normal text-muted-foreground">
                Phiếu lương {MONTH_NAMES[month]} {year}
              </div>
            </div>
            {payroll ? (
              isPaid
                ? <Badge className="bg-green-100 text-green-700 border-green-200">Đã thanh toán</Badge>
                : <Badge variant="secondary">Phiếu nháp</Badge>
            ) : (
              <Badge variant="outline">Chưa tính</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-5">
          <div className="space-y-5">

            {/* ── Mức lương theo giờ ── */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Pencil className="h-3.5 w-3.5 text-primary" />
                Cấu hình lương tháng này
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Lương theo giờ (VNĐ)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    step={5000}
                    value={hourlyRate}
                    disabled={isPaid}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                    className="tabular-nums"
                    placeholder="150000"
                  />
                  {payroll && payroll.hourlyRate !== teacher.hourlyRate && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      GV: {formatVND(teacher.hourlyRate)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Mặc định lấy từ hồ sơ giáo viên ({formatVND(teacher.hourlyRate)}). Có thể điều chỉnh riêng cho tháng này.
                </p>
              </div>

              {/* Tổng giờ + preview */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="text-center rounded-lg bg-background border py-2 px-1">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                    <Clock className="h-3 w-3" /> Số giờ
                  </div>
                  <div className="text-sm font-bold">{formatHours(displayHours)}</div>
                </div>
                <div className="text-center rounded-lg bg-background border py-2 px-1">
                  <div className="text-[10px] text-muted-foreground mb-0.5">Lương cơ bản</div>
                  <div className="text-sm font-bold tabular-nums">{formatVND(baseAmount)}</div>
                </div>
                <div className="text-center rounded-lg bg-primary/10 border border-primary/20 py-2 px-1">
                  <div className="text-[10px] text-primary/70 mb-0.5">Thực lãnh</div>
                  <div className="text-sm font-bold tabular-nums text-primary">{formatVND(previewTotal)}</div>
                </div>
              </div>
            </div>

            {/* ── Thưởng ── */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-green-700 flex items-center gap-1.5">
                ＋ Thưởng / Phụ cấp
              </Label>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
                <Input
                  type="number"
                  min={0}
                  step={10000}
                  value={bonus}
                  disabled={isPaid}
                  onChange={(e) => setBonus(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="tabular-nums"
                />
                <span className="text-sm text-muted-foreground pt-2">VNĐ</span>
              </div>
              <Input
                placeholder="Lý do: Thưởng KPI, phụ cấp xăng xe..."
                value={bonusReason}
                disabled={isPaid}
                onChange={(e) => setBonusReason(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* ── Khấu trừ ── */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
                － Khấu trừ
              </Label>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
                <Input
                  type="number"
                  min={0}
                  step={10000}
                  value={deduct}
                  disabled={isPaid}
                  onChange={(e) => setDeduct(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="tabular-nums"
                />
                <span className="text-sm text-muted-foreground pt-2">VNĐ</span>
              </div>
              <Input
                placeholder="Lý do: Đi trễ, nghỉ không phép..."
                value={deductReason}
                disabled={isPaid}
                onChange={(e) => setDeductReason(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* ── Tổng kết ── */}
            <div className="rounded-lg border p-3 space-y-2 text-sm bg-background">
              <div className="flex justify-between text-muted-foreground">
                <span>Lương cơ bản</span>
                <span className="tabular-nums">{formatVND(baseAmount)}</span>
              </div>
              {bonus > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>+ Thưởng {bonusReason ? `(${bonusReason})` : ""}</span>
                  <span className="tabular-nums">{formatVND(bonus)}</span>
                </div>
              )}
              {deduct > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>– Khấu trừ {deductReason ? `(${deductReason})` : ""}</span>
                  <span className="tabular-nums">-{formatVND(deduct)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Thực lãnh</span>
                <span className="tabular-nums text-primary">{formatVND(previewTotal)}</span>
              </div>
            </div>

            {/* ── Ghi chú ── */}
            {!isPaid && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Ghi chú nội bộ</Label>
                <Textarea
                  rows={2}
                  placeholder="Ghi chú thêm cho phiếu lương này..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-sm resize-none"
                />
              </div>
            )}

            {/* ── Chi tiết buổi học (toggle) ── */}
            {payroll && (
              <div>
                <button
                  onClick={handleToggleSessions}
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showSessions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Chi tiết buổi dạy ({Math.round(displayHours * 10) / 10} giờ)
                </button>

                {showSessions && (
                  <div className="mt-2 rounded-md border overflow-hidden">
                    {loadingSessions ? (
                      <div className="text-sm text-muted-foreground text-center py-4">Đang tải...</div>
                    ) : sessions.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        Chưa có buổi học hoàn thành trong tháng này.
                      </div>
                    ) : (
                      sessions.map((s: any) => {
                        const h = (() => {
                          const [sh, sm] = s.startTime.split(":").map(Number)
                          const [eh, em] = s.endTime.split(":").map(Number)
                          return parseFloat(((eh * 60 + em - sh * 60 - sm) / 60).toFixed(2))
                        })()
                        return (
                          <div key={s.id} className="flex items-center justify-between px-3 py-2 text-sm border-b last:border-0 hover:bg-muted/30">
                            <div>
                              <span className="font-medium">
                                {new Date(s.sessionDate).toLocaleDateString("vi-VN")}
                              </span>
                              <span className="text-muted-foreground ml-2 text-xs">
                                {s.startTime}–{s.endTime}
                              </span>
                              {s.class?.name && (
                                <span className="ml-2 text-xs text-muted-foreground">· {s.class.name}</span>
                              )}
                            </div>
                            <span className="tabular-nums text-muted-foreground text-xs">{h}h</span>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer actions */}
        {!isPaid && (
          <div className="border-t px-6 py-4 space-y-2">
            {!payroll ? (
              /* Chưa có phiếu: chỉ có nút Tính lương */
              <Button
                className="w-full gap-2"
                onClick={handleCalculate}
                disabled={isPending}
              >
                <Calculator className="h-4 w-4" />
                {isPending ? "Đang tính..." : "Tính lương & lưu điều chỉnh"}
              </Button>
            ) : (
              /* Đã có phiếu DRAFT: Lưu điều chỉnh + Tính lại + Xác nhận thanh toán */
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={handleSaveExtras}
                  disabled={isPending}
                >
                  <Save className="h-4 w-4" />
                  Lưu điều chỉnh
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={handleCalculate}
                  disabled={isPending}
                >
                  <Calculator className="h-4 w-4" />
                  Tính lại
                </Button>
              </div>
            )}
            {payroll && (
              <Button
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                onClick={handleMarkPaid}
                disabled={isPending}
              >
                <CheckCircle2 className="h-4 w-4" />
                Xác nhận đã trả lương ({formatVND(previewTotal)})
              </Button>
            )}
          </div>
        )}

        {isPaid && (
          <div className="border-t px-6 py-3 text-center text-sm text-muted-foreground">
            ✓ Đã thanh toán {payroll?.paidAt ? new Date(payroll.paidAt).toLocaleDateString("vi-VN") : ""}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
