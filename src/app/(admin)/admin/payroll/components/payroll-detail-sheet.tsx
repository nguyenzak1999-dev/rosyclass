"use client"

import { useState, useTransition, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {
  Clock, CheckCircle2, Calculator, Save, ChevronDown, ChevronUp, Pencil,
  Printer, Send, Mail, FileText
} from "lucide-react"
import { formatVND, formatHours } from "@/lib/payroll-utils"
import { formatMoneyInput, parseMoneyInput } from "@/lib/utils"
import {
  calculateTeacherPayroll,
  updatePayrollExtras,
  markPayrollAsPaid,
  getPayrollDetail,
  updateTeacherBank,
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
    bankName?: string | null
    bankAccountNo?: string | null
    bankAccountName?: string | null
  }
  payroll: Payroll | null
  month: number
  year: number
  sessionHours: number
  open: boolean
  onClose: () => void
  onRefresh: () => void
  mode?: "view" | "edit"
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
  mode = "edit",
}: PayrollDetailSheetProps) {
  const [isPending, startTransition] = useTransition()
  const [zaloSending, setZaloSending] = useState(false)
  const [emailSending, setEmailSending] = useState(false)

  // Form state — luôn hiển thị, kể cả chưa có payroll
  const [hourlyRate, setHourlyRate] = useState(payroll?.hourlyRate ?? teacher.hourlyRate)
  const [bonus, setBonus] = useState(payroll?.bonusAmount ?? 0)
  const [bonusReason, setBonusReason] = useState(payroll?.bonusReason ?? "")
  const [deduct, setDeduct] = useState(payroll?.deductAmount ?? 0)
  const [deductReason, setDeductReason] = useState(payroll?.deductReason ?? "")
  const [notes, setNotes] = useState(payroll?.notes ?? "")
  
  const [bankName, setBankName] = useState(teacher.bankName ?? "")
  const [bankAccountNo, setBankAccountNo] = useState(teacher.bankAccountNo ?? "")
  const [bankAccountName, setBankAccountName] = useState(teacher.bankAccountName ?? "")

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
    setBankName(teacher.bankName ?? "")
    setBankAccountNo(teacher.bankAccountNo ?? "")
    setBankAccountName(teacher.bankAccountName ?? "")
  }, [payroll, teacher.hourlyRate, teacher.bankName, teacher.bankAccountNo, teacher.bankAccountName])

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
  const displayHours = payroll ? payroll.totalHours : sessionHours
  const baseAmount = displayHours * hourlyRate
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

  // Lưu thông tin ngân hàng
  const handleSaveBank = () => {
    startTransition(async () => {
      const res = await updateTeacherBank(teacher.id, {
        bankName,
        bankAccountNo,
        bankAccountName
      })
      if (res.success) {
        toast.success("Đã cập nhật thông tin chuyển khoản")
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

  // Print & Export logic
  const capturePayrollAsBlob = async (): Promise<Blob | null> => {
    if (typeof window === "undefined") return null
    let html2canvas = (window as any).html2canvas?.default || (window as any).html2canvas
    if (typeof html2canvas !== "function") {
      const scriptUrl = "https://unpkg.com/html2canvas-pro@1.5.8/dist/html2canvas-pro.min.js"
      await new Promise<void>((resolve, reject) => {
        const existingScripts = document.querySelectorAll(`script[src*="html2canvas"]`)
        existingScripts.forEach(s => s.remove())
        const script = document.createElement("script")
        script.src = scriptUrl
        script.crossOrigin = "anonymous"
        script.onload = () => setTimeout(() => resolve(), 50)
        script.onerror = (err) => reject(err)
        document.body.appendChild(script)
      })
      html2canvas = (window as any).html2canvas?.default || (window as any).html2canvas
    }
    const element = document.getElementById("payroll-print-content")
    if (!element) return null
    
    const canvas = await html2canvas(element, { useCORS: true, scale: 2, backgroundColor: "#ffffff", logging: false })
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"))
  }

  const handleSendZalo = async () => {
    setZaloSending(true)
    try {
      const blob = await capturePayrollAsBlob()
      if (blob) {
        const ClipboardItemClass = (window as any).ClipboardItem || (globalThis as any).ClipboardItem
        if (ClipboardItemClass) {
          await navigator.clipboard.write([new ClipboardItemClass({ "image/png": blob })])
          toast.success("Đã chụp & sao chép ảnh phiếu lương! Nhấn Ctrl+V để gửi Zalo.")
        }
      }
    } catch (err) {
      console.error(err)
      toast.error("Lỗi: Không thể tự động sao chép ảnh. Vui lòng thử lại.")
    } finally {
      window.open("https://zalo.me", "_blank")
      setZaloSending(false)
    }
  }

  const handleSendEmail = async () => {
    setEmailSending(true)
    try {
      const blob = await capturePayrollAsBlob()
      if (blob) {
        try {
          const ClipboardItemClass = (window as any).ClipboardItem || (globalThis as any).ClipboardItem
          if (ClipboardItemClass) {
            await navigator.clipboard.write([new ClipboardItemClass({ "image/png": blob })])
            toast.success("Đã chụp & sao chép ảnh phiếu lương vào Clipboard!")
          }
        } catch(e) {}
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `phieu-luong-${teacher.fullName.replace(/\s+/g, '-')}-T${month}-${year}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error(err)
    } finally {
      const subject = encodeURIComponent(`ROSYCLASS - Phiếu lương tháng ${month}/${year}`)
      const body = encodeURIComponent(`Kính gửi Thầy/Cô ${teacher.fullName},\n\nROSYCLASS xin gửi ảnh chụp phiếu lương tháng ${month}/${year} đính kèm.\n\nTrân trọng cảm ơn!`)
      const mailtoUrl = `mailto:?subject=${subject}&body=${body}`
      window.open(mailtoUrl, "_blank")
      setEmailSending(false)
    }
  }

  const handlePrint = () => {
    const printArea = document.getElementById("payroll-print-content")
    if (!printArea) return
    const win = window.open("", "_blank")
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>In Phiếu Lương - ${teacher.fullName}</title>
            <style>
              body { font-family: sans-serif; font-size: 14px; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #f3f4f6; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
            </style>
          </head>
          <body>
            ${printArea.innerHTML}
          </body>
        </html>
      `)
      win.document.close()
    }
  }


  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold">{teacher.fullName}</div>
              <div className="text-sm font-normal text-muted-foreground">
                Phiếu lương {MONTH_NAMES[month]} {year}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {payroll ? (
                isPaid
                  ? <Badge className="bg-green-100 text-green-700 border-green-200">Đã thanh toán</Badge>
                  : <Badge variant="secondary">Phiếu nháp</Badge>
              ) : (
                <Badge variant="outline">Chưa tính</Badge>
              )}

              {payroll && (
                <div className="flex items-center gap-1.5 ml-2 pl-3 border-l">
                  <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 gap-1.5 hidden sm:flex">
                    <Printer className="h-3.5 w-3.5" />
                    In
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleSendZalo} disabled={zaloSending} className="h-8 gap-1.5 border-[#0068ff]/30 text-[#0068ff] hover:bg-[#0068ff]/5 hover:text-[#0054d1]">
                    <Send className="h-3.5 w-3.5" />
                    {zaloSending ? "..." : "Zalo"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleSendEmail} disabled={emailSending} className="h-8 gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                    <Mail className="h-3.5 w-3.5" />
                    {emailSending ? "..." : "Email"}
                  </Button>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
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
                    type="text"
                    inputMode="numeric"
                    value={formatMoneyInput(hourlyRate)}
                    disabled={mode === "view"}
                    onChange={(e) => setHourlyRate(parseMoneyInput(e.target.value))}
                    className="tabular-nums"
                    placeholder="150.000"
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
                  type="text"
                  inputMode="numeric"
                  value={formatMoneyInput(bonus)}
                  disabled={mode === "view"}
                  onChange={(e) => setBonus(parseMoneyInput(e.target.value))}
                  placeholder="0"
                  className="tabular-nums"
                />
                <span className="text-sm text-muted-foreground pt-2">VNĐ</span>
              </div>
              <Input
                placeholder="Lý do: Thưởng KPI, phụ cấp xăng xe..."
                value={bonusReason}
                disabled={mode === "view"}
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
                  type="text"
                  inputMode="numeric"
                  value={formatMoneyInput(deduct)}
                  disabled={mode === "view"}
                  onChange={(e) => setDeduct(parseMoneyInput(e.target.value))}
                  placeholder="0"
                  className="tabular-nums"
                />
                <span className="text-sm text-muted-foreground pt-2">VNĐ</span>
              </div>
              <Input
                placeholder="Lý do: Đi muộn, nghỉ không phép..."
                value={deductReason}
                disabled={mode === "view"}
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

            {/* ── Thông tin thanh toán (Bank) ── */}
            <div className="space-y-3 p-3 rounded-lg border bg-blue-50/50">
              <Label className="text-sm font-semibold text-blue-700">Thông tin chuyển khoản (Tạo mã VietQR)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  disabled={mode === "view"}
                  placeholder="Mã/Tên Ngân hàng (VD: MB, VCB...)"
                  className="bg-white text-sm"
                />
                <Input
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  disabled={mode === "view"}
                  placeholder="Số tài khoản"
                  className="bg-white text-sm"
                />
                <Input
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  disabled={mode === "view"}
                  placeholder="Tên chủ thẻ (Không dấu)"
                  className="bg-white text-sm col-span-2"
                />
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <p className="text-[11px] text-muted-foreground flex-1">
                  Lưu hồ sơ giáo viên để tạo mã QR trên phiếu.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSaveBank}
                  disabled={isPending || mode === "view" || (bankName === (teacher.bankName ?? "") && bankAccountNo === (teacher.bankAccountNo ?? "") && bankAccountName === (teacher.bankAccountName ?? ""))}
                >
                  Lưu
                </Button>
              </div>
            </div>

            {/* ── Ghi chú ── */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Ghi chú nội bộ</Label>
                <Textarea
                  rows={2}
                  placeholder="Ghi chú thêm cho phiếu lương này..."
                  value={notes}
                  disabled={mode === "view"}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-sm resize-none"
                />
            </div>

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

            {/* ── Lịch sử điều chỉnh (nếu có) ── */}
            {payroll?.historyLogs && Array.isArray(payroll.historyLogs) && payroll.historyLogs.length > 0 && (
              <div className="mt-4 p-3 border rounded-lg bg-orange-50/50">
                <Label className="text-xs font-semibold text-orange-700 mb-2 block">Lịch sử điều chỉnh sau thanh toán</Label>
                <div className="space-y-2">
                  {(payroll.historyLogs as any[]).map((log, idx) => (
                    <div key={idx} className="text-xs border-l-2 border-orange-200 pl-2">
                      <div className="text-muted-foreground flex justify-between">
                        <span>{log.action}</span>
                        <span>{new Date(log.date).toLocaleString("vi-VN")}</span>
                      </div>
                      <div className="font-medium mt-0.5">{log.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* ── Mã QR Thanh Toán (To, Cuối trang) ── */}
            {bankName && bankAccountNo && (
              <div className="mt-6 flex flex-col items-center justify-center p-6 bg-slate-50 border rounded-xl border-dashed">
                <p className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                  Mã quét thanh toán
                </p>
                <div className="bg-white p-2 rounded-xl shadow-sm border">
                  <img 
                    src={`https://img.vietqr.io/image/${bankName}-${bankAccountNo}-compact2.png?amount=${previewTotal}&accountName=${encodeURIComponent(bankAccountName || "")}`}
                    alt="QR Code"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                </div>
                <div className="mt-4 text-center space-y-1 text-sm">
                  <p><strong>{bankName}</strong> - <strong>{bankAccountNo}</strong></p>
                  {bankAccountName && <p className="font-medium text-primary">{bankAccountName}</p>}
                  <p className="text-base font-bold mt-2 text-green-700">{formatVND(previewTotal)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        {mode === "edit" && (
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
              /* Đã có phiếu DRAFT/PAID: Lưu điều chỉnh + Tính lại */
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

            {payroll && !isPaid && (
              <Button
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                onClick={handleMarkPaid}
                disabled={isPending}
              >
                <CheckCircle2 className="h-4 w-4" />
                Xác nhận đã trả lương ({formatVND(previewTotal)})
              </Button>
            )}

            {isPaid && (
              <div className="pt-2 text-center text-sm text-green-600 font-medium flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> 
                Đã thanh toán {payroll?.paidAt ? new Date(payroll.paidAt).toLocaleDateString("vi-VN") : ""}
              </div>
            )}
          </div>
        )}
      </DialogContent>

      {/* Printable Hidden View for html2canvas */}
      <div id="payroll-print-content" className="fixed left-[-9999px] top-[-9999px] bg-white w-[700px] p-8 text-black" style={{ fontFamily: "sans-serif" }}>
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold uppercase m-0">TRUNG TÂM ROSYCLASS</h2>
            <p className="text-sm text-gray-600 m-0 mt-1">Phiếu Lương Giáo Viên</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black m-0">PHIẾU LƯƠNG</h1>
            <p className="text-sm font-medium m-0 mt-1">Tháng {month} năm {year}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div><strong>Giáo viên:</strong> {teacher.fullName}</div>
          <div><strong>Trạng thái:</strong> {isPaid ? "Đã thanh toán" : "Phiếu tạm tính"}</div>
          <div><strong>Ngày in:</strong> {new Date().toLocaleDateString("vi-VN")}</div>
          <div><strong>Tổng giờ dạy:</strong> {formatHours(displayHours)} giờ</div>
        </div>

        <table className="w-full text-sm border-collapse mb-6" border={1} cellPadding={8} style={{ borderColor: "#ddd" }}>
          <thead>
            <tr className="bg-gray-100 text-left">
              <th>Hạng mục</th>
              <th>Diễn giải</th>
              <th className="text-right">Số tiền (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-semibold">Lương cơ bản</td>
              <td>{formatHours(displayHours)} giờ x {formatVND(hourlyRate)}/giờ</td>
              <td className="text-right">{formatVND(baseAmount)}</td>
            </tr>
            {bonus > 0 && (
              <tr>
                <td className="font-semibold text-green-700">Thưởng / Phụ cấp</td>
                <td>{bonusReason || "—"}</td>
                <td className="text-right text-green-700">+{formatVND(bonus)}</td>
              </tr>
            )}
            {deduct > 0 && (
              <tr>
                <td className="font-semibold text-red-600">Khấu trừ</td>
                <td>{deductReason || "—"}</td>
                <td className="text-right text-red-600">-{formatVND(deduct)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="font-bold text-base bg-gray-50">
              <td colSpan={2} className="text-right py-3">THỰC LÃNH:</td>
              <td className="text-right text-blue-700 py-3">{formatVND(previewTotal)}</td>
            </tr>
          </tfoot>
        </table>

        {notes && (
          <div className="text-sm text-gray-600 italic mb-8">
            <strong>Ghi chú:</strong> {notes}
          </div>
        )}

        {/* Print layout: Thông tin thanh toán */}
        {teacher.bankName && teacher.bankAccountNo && (
          <div className="mt-4 pt-3 border-t flex gap-4">
            <div className="flex-1 text-sm">
              <div className="font-semibold mb-1 text-xs text-gray-500">THÔNG TIN THANH TOÁN</div>
              <div><strong>Ngân hàng:</strong> {teacher.bankName}</div>
              <div><strong>STK:</strong> {teacher.bankAccountNo}</div>
              {teacher.bankAccountName && <div><strong>Tên:</strong> {teacher.bankAccountName}</div>}
            </div>
            <div>
              <img 
                src={`https://img.vietqr.io/image/${teacher.bankName}-${teacher.bankAccountNo}-compact2.png?amount=${previewTotal}&accountName=${encodeURIComponent(teacher.bankAccountName || "")}`}
                alt="QR Code"
                className="w-24 h-24"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between text-center text-sm pt-4 mt-8">
          <div className="w-1/2">
            <p className="font-bold mb-16">Người nhận</p>
            <p className="text-gray-500 italic">{teacher.fullName}</p>
          </div>
          <div className="w-1/2">
            <p className="font-bold mb-16">Người lập phiếu</p>
            <p className="text-gray-500 italic">Ban Tài Chính / Kế Toán</p>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
