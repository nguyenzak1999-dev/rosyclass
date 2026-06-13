"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CreditCard, Plus, Receipt } from "lucide-react"
import { createPayment } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { formatMoneyInput } from "@/lib/utils"

import { PaymentReceiptDialog } from "@/app/(admin)/admin/payments/components/payment-receipt-dialog"

const paymentStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PAID: { label: "Đã thanh toán", variant: "default" },
  PARTIAL: { label: "Thanh toán một phần", variant: "secondary" },
  UNPAID: { label: "Chưa thanh toán", variant: "destructive" },
  REFUNDED: { label: "Đã hoàn tiền", variant: "outline" },
  CANCELLED: { label: "Đã hủy", variant: "outline" },
}

const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })

export function PaymentsTab({ student }: { student: any }) {
  const router = useRouter()
  const payments = student.payments || []
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [selectedPayment, setSelectedPayment] = React.useState<any | null>(null)
  const [form, setForm] = React.useState({
    totalAmount: "",
    paidAmount: "",
    paymentMethod: "CASH",
    dueDate: "",
    note: "",
  })

  const totalPaid = payments.reduce((s: number, p: any) => s + p.paidAmount, 0)
  const totalDebt = payments.reduce((s: number, p: any) => s + p.remainingAmount, 0)

  const handleCreate = async () => {
    if (!form.totalAmount) return
    setLoading(true)
    const result = await createPayment({
      studentId: student.id,
      totalAmount: Number(form.totalAmount),
      paidAmount: Number(form.paidAmount) || 0,
      paymentMethod: form.paymentMethod,
      dueDate: form.dueDate,
      note: form.note,
    })
    setLoading(false)
    if (result.success) {
      toast.success("Tạo hóa đơn thành công!")
      setOpen(false)
      setForm({ totalAmount: "", paidAmount: "", paymentMethod: "CASH", dueDate: "", note: "" })
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Quản lý học phí</h3>
          <p className="text-sm text-muted-foreground">Theo dõi thanh toán và công nợ của học viên</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Tạo hóa đơn</Button>} />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo hóa đơn học phí</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tổng học phí (VND) *</Label>
                  <Input type="text" inputMode="numeric" placeholder="3.000.000" value={formatMoneyInput(form.totalAmount)}
                    onChange={e => {
                      const clean = e.target.value.replace(/\D/g, "")
                      setForm(p => ({ ...p, totalAmount: clean }))
                    }} />
                </div>
                <div className="space-y-2">
                  <Label>Đã đóng (VND)</Label>
                  <Input type="text" inputMode="numeric" placeholder="0" value={formatMoneyInput(form.paidAmount)}
                    onChange={e => {
                      const clean = e.target.value.replace(/\D/g, "")
                      setForm(p => ({ ...p, paidAmount: clean }))
                    }} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phương thức thanh toán</Label>
                <Select value={form.paymentMethod} onValueChange={v => v && setForm(p => ({ ...p, paymentMethod: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Tiền mặt</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hạn thanh toán</Label>
                <Input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Input placeholder="..." value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                <Button onClick={handleCreate} disabled={!form.totalAmount || loading}>
                  {loading ? "Đang tạo..." : "Tạo hóa đơn"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Tổng đã đóng</div>
            <div className="text-2xl font-bold text-green-600">{vnd.format(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Còn nợ</div>
            <div className={`text-2xl font-bold ${totalDebt > 0 ? "text-destructive" : "text-green-600"}`}>
              {vnd.format(totalDebt)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Số hóa đơn</div>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payment list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Lịch sử thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-6">Chưa có hóa đơn nào</p>
          ) : (
            <div className="space-y-3">
              {[...payments].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((p: any) => {
                const config = paymentStatusConfig[p.status] || { label: p.status, variant: "outline" }
                return (
                  <div 
                    key={p.id} 
                    className="flex items-start justify-between p-4 rounded-lg border hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedPayment(p)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">
                          Tổng: {vnd.format(p.totalAmount)}
                        </span>
                        <Badge variant={config.variant as any}>{config.label}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex gap-3">
                        <span>Đã đóng: {vnd.format(p.paidAmount)}</span>
                        {p.remainingAmount > 0 && <span className="text-destructive">Còn nợ: {vnd.format(p.remainingAmount)}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground flex gap-3">
                        <span>Ngày tạo: {format(new Date(p.createdAt), "dd/MM/yyyy")}</span>
                        {p.dueDate && <span>Hạn đóng: {format(new Date(p.dueDate), "dd/MM/yyyy")}</span>}
                        <span>{p.paymentMethod === "CASH" ? "Tiền mặt" : "Chuyển khoản"}</span>
                      </div>
                      {p.note && <p className="text-xs text-muted-foreground italic">{p.note}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Receipt Dialog */}
      <PaymentReceiptDialog
        payment={selectedPayment}
        open={!!selectedPayment}
        onOpenChange={(isOpen) => !isOpen && setSelectedPayment(null)}
      />
    </div>
  )
}
