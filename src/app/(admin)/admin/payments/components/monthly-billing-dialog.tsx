"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CalendarRange, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BILLING_CATEGORY_LABELS,
  billTotal,
  defaultBillingMonth,
  formatBillingMonth,
  isPercentDiscountLine,
  lineTotal,
  percentDiscountLine,
  type BillingCategory,
  type BillingLineDraft,
} from "@/lib/monthly-billing-shared"
import type { MonthlyBillDraft } from "@/lib/monthly-billing"
import { formatMoneyInput } from "@/lib/utils"
import { createClassMonthlyPayments, getMonthlyBillDraft, saveMonthlyPaymentAction } from "../monthly-actions"
import { BillingSummaryView, familyRemaining } from "./billing-summary-view"

type Option = { id: string; name: string }

export interface MonthlyBillingEdit {
  paymentId: string
  studentId: string
  month: string
  lines: BillingLineDraft[]
  dueDate: string | null
  note: string | null
  paidAmount: number
  discountPercent: number
}

interface MonthlyBillingDialogProps {
  students: Option[]
  classes: Option[]
  /** Sửa một phiếu thu tháng đã có */
  edit?: MonthlyBillingEdit
  trigger?: React.ReactElement
}

const CATEGORY_ITEMS = (Object.keys(BILLING_CATEGORY_LABELS) as BillingCategory[]).map((value) => ({
  value,
  label: BILLING_CATEGORY_LABELS[value],
}))

const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")}đ`

function materialLine(): BillingLineDraft {
  return { description: "Học liệu / sách bổ trợ", category: "MATERIAL", quantity: 1, unitAmount: 0 }
}

export function MonthlyBillingDialog({ students, classes, edit, trigger }: MonthlyBillingDialogProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState<"student" | "class">("student")
  const [studentId, setStudentId] = React.useState(edit?.studentId ?? "")
  const [classId, setClassId] = React.useState("")
  const [month, setMonth] = React.useState(edit?.month ?? defaultBillingMonth())
  const [draft, setDraft] = React.useState<MonthlyBillDraft | null>(null)
  const [lines, setLines] = React.useState<BillingLineDraft[]>(edit?.lines ?? [])
  const [classLines, setClassLines] = React.useState<BillingLineDraft[]>([])
  const [dueDate, setDueDate] = React.useState(edit?.dueDate ?? "")
  const [note, setNote] = React.useState(edit?.note ?? "")
  // Miễn/giảm %: dòng giảm do hệ thống tính trên tạm tính, không nằm trong danh sách dòng sửa tay
  const [discountPercent, setDiscountPercent] = React.useState(String(edit?.discountPercent ?? 0))
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  // Bỏ kết quả của lần tính cũ nếu người dùng đã đổi bé/tháng trong lúc chờ
  const requestRef = React.useRef(0)

  const loadDraft = React.useCallback(
    async (targetStudent: string, targetMonth: string, keepLines: boolean) => {
      if (!targetStudent || !targetMonth) return
      const requestId = ++requestRef.current
      setLoading(true)
      try {
        const result = await getMonthlyBillDraft(targetStudent, targetMonth)
        if (requestId !== requestRef.current) return
        if (!result.success) {
          toast.error(result.error)
          setDraft(null)
          return
        }
        setDraft(result.data)
        if (!keepLines) {
          setLines(result.data.lines.filter((line) => !isPercentDiscountLine(line)))
          setDiscountPercent(String(result.data.discountPercent))
        }
      } catch {
        if (requestId === requestRef.current) toast.error("Không tính được phiếu thu tháng")
      } finally {
        if (requestId === requestRef.current) setLoading(false)
      }
    },
    []
  )

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) return
    if (edit) {
      setStudentId(edit.studentId)
      setMonth(edit.month)
      setLines(edit.lines.filter((line) => !isPercentDiscountLine(line)))
      setDiscountPercent(String(edit.discountPercent))
      setDueDate(edit.dueDate ?? "")
      setNote(edit.note ?? "")
      void loadDraft(edit.studentId, edit.month, true)
    } else {
      setDraft(null)
      setLines([])
      setClassLines([materialLine()])
      setDueDate("")
      setNote("")
      if (studentId) void loadDraft(studentId, month, false)
    }
  }

  const updateLine = (setter: React.Dispatch<React.SetStateAction<BillingLineDraft[]>>, index: number, patch: Partial<BillingLineDraft>) =>
    setter((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)))

  const percent = Math.min(100, Math.max(0, Number(discountPercent) || 0))
  const activeLines = lines.filter((line) => line.quantity > 0)
  const subtotal = billTotal(activeLines)
  const percentLine = percentDiscountLine(activeLines, percent)
  const total = billTotal(percentLine ? [...activeLines, percentLine] : activeLines)

  const saveStudent = async () => {
    if (saving) return
    if (!studentId) return toast.error("Chọn học viên")
    if (!edit && draft?.existingPayment) return toast.error("Bé đã có phiếu thu tháng này")
    setSaving(true)
    try {
      const result = await saveMonthlyPaymentAction({
        studentId,
        month,
        lines,
        dueDate: dueDate || null,
        note: note || null,
        paymentId: edit?.paymentId ?? null,
        discountPercent: percent,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(edit ? "Đã cập nhật phiếu thu tháng" : "Đã lập phiếu thu tháng")
      setOpen(false)
      if (edit) router.refresh()
      else router.push(`/admin/payments/${result.data.id}`)
    } catch {
      toast.error("Không lưu được phiếu thu tháng")
    } finally {
      setSaving(false)
    }
  }

  const saveClass = async () => {
    if (saving) return
    if (!classId) return toast.error("Chọn lớp")
    setSaving(true)
    try {
      const result = await createClassMonthlyPayments({
        classId,
        month,
        extraLines: classLines.filter((line) => line.quantity > 0 && line.description.trim()),
        dueDate: dueDate || null,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      const { created, skipped, failed } = result.data
      const parts = [`Đã lập ${created} phiếu`]
      if (skipped.length) parts.push(`bỏ qua ${skipped.length} bé đã có phiếu`)
      if (failed.length) parts.push(`lỗi: ${failed.join(", ")}`)
      if (failed.length) toast.warning(parts.join(" · "))
      else toast.success(parts.join(" · "))
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("Không lập được phiếu thu cho lớp")
    } finally {
      setSaving(false)
    }
  }

  const studentItems = students.map((student) => ({ value: student.id, label: student.name }))
  const classItems = classes.map((cls) => ({ value: cls.id, label: cls.name }))

  const studentForm = (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <Label>Học viên</Label>
          <Select
            items={studentItems}
            value={studentId || null}
            disabled={Boolean(edit)}
            onValueChange={(value) => {
              const next = String(value ?? "")
              setStudentId(next)
              void loadDraft(next, month, false)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn học viên" />
            </SelectTrigger>
            <SelectContent>
              {studentItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing-month">Tháng thu</Label>
          <Input
            id="billing-month"
            type="month"
            value={month}
            disabled={Boolean(edit)}
            onChange={(event) => {
              setMonth(event.target.value)
              void loadDraft(studentId, event.target.value, false)
            }}
          />
        </div>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Đang tính số buổi…</p> : null}

      {draft ? (
        <>
          {draft.warnings.length > 0 && (
            <ul className="space-y-1 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              {draft.warnings.map((warning) => (
                <li key={warning}>⚠ {warning}</li>
              ))}
            </ul>
          )}
          {!edit && draft.existingPayment ? (
            <p className="rounded-lg border border-destructive/40 p-3 text-sm text-destructive">
              Bé đã có phiếu thu tháng {formatBillingMonth(month)} ({draft.existingPayment.receiptCode}). Mở phiếu đó để sửa.
            </p>
          ) : null}
          <div className="rounded-lg border p-3">
            <BillingSummaryView summary={draft.summary} />
          </div>
        </>
      ) : null}

      {(draft || edit) && (
        <LineEditor
          lines={lines}
          onChange={(index, patch) => updateLine(setLines, index, patch)}
          onRemove={(index) => setLines((current) => current.filter((_, i) => i !== index))}
          onAdd={() => setLines((current) => [...current, materialLine()])}
        />
      )}

      {(draft || edit) && (
        <div className="space-y-1 text-right">
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm">
            <span className="text-muted-foreground">Tạm tính: {money(subtotal)}</span>
            <Label htmlFor="billing-discount" className="font-normal">
              Miễn/giảm học phí
            </Label>
            <div className="flex items-center gap-1">
              <Input
                id="billing-discount"
                type="number"
                min={0}
                max={100}
                step="any"
                className="h-8 w-20 text-right"
                value={discountPercent}
                onChange={(event) => setDiscountPercent(event.target.value)}
              />
              <span>%</span>
            </div>
            {percentLine ? <span className="text-muted-foreground">-{money(-percentLine.unitAmount)}</span> : null}
          </div>
          <p className="text-base">
            Tổng phiếu: <strong>{money(total)}</strong>
            {edit && edit.paidAmount > 0 ? <span className="text-sm text-muted-foreground"> · đã thu {money(edit.paidAmount)}</span> : null}
          </p>
          {draft && draft.summary.siblings.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Cả nhà còn phải đóng tháng này: {money(familyRemaining(draft.summary, total - (edit?.paidAmount ?? 0)))}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )

  const classForm = (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <Label>Lớp</Label>
          <Select items={classItems} value={classId || null} onValueChange={(value) => setClassId(String(value ?? ""))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn lớp" />
            </SelectTrigger>
            <SelectContent>
              {classItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="class-billing-month">Tháng thu</Label>
          <Input id="class-billing-month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Mỗi bé đang học trong lớp được lập một phiếu: học phí theo số buổi thực tế của tháng, buổi GV nước ngoài (nếu lớp có),
        trừ buổi nghỉ không kèm bù được, miễn/giảm % theo hồ sơ từng bé. Bé đã có phiếu tháng này sẽ được bỏ qua. Các dòng dưới đây được thêm cho mọi bé.
      </p>
      <LineEditor
        lines={classLines}
        onChange={(index, patch) => updateLine(setClassLines, index, patch)}
        onRemove={(index) => setClassLines((current) => current.filter((_, i) => i !== index))}
        onAdd={() => setClassLines((current) => [...current, materialLine()])}
      />
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        React.cloneElement(trigger as React.ReactElement<{ onClick?: () => void }>, { onClick: () => handleOpenChange(true) })
      ) : (
        <Button variant="outline" onClick={() => handleOpenChange(true)}>
          <CalendarRange className="mr-2 h-4 w-4" /> Thu học phí tháng
        </Button>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{edit ? "Sửa phiếu thu tháng" : "Lập phiếu thu học phí tháng"}</DialogTitle>
          <DialogDescription>
            Học phí = số buổi thực tế trong tháng × đơn giá buổi của lớp. Buổi GV nước ngoài (nếu có) thu thêm phụ thu. Có
            thể sửa, thêm học liệu, sách bổ trợ trước khi lưu.
          </DialogDescription>
        </DialogHeader>

        {edit ? (
          studentForm
        ) : (
          <Tabs value={mode} onValueChange={(value) => setMode(value as "student" | "class")}>
            <TabsList>
              <TabsTrigger value="student">Từng bé</TabsTrigger>
              <TabsTrigger value="class">Cả lớp</TabsTrigger>
            </TabsList>
            <TabsContent value="student" className="pt-3">
              {studentForm}
            </TabsContent>
            <TabsContent value="class" className="pt-3">
              {classForm}
            </TabsContent>
          </Tabs>
        )}

        <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
          <div className="space-y-2">
            <Label htmlFor="billing-due">Hạn đóng</Label>
            <Input id="billing-due" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            <p className="text-xs text-muted-foreground">Trống = ngày cuối tháng trước tháng thu (thu trước)</p>
          </div>
          {mode === "student" || edit ? (
            <div className="space-y-2">
              <Label htmlFor="billing-note">Ghi chú trên phiếu</Label>
              <Textarea id="billing-note" rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Đóng
          </Button>
          {mode === "class" && !edit ? (
            <Button onClick={saveClass} disabled={saving || !classId}>
              {saving ? "Đang lập…" : "Lập phiếu cho cả lớp"}
            </Button>
          ) : (
            <Button onClick={saveStudent} disabled={saving || loading || !studentId || (!edit && Boolean(draft?.existingPayment))}>
              {saving ? "Đang lưu…" : edit ? "Lưu thay đổi" : "Lập phiếu"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function LineEditor({
  lines,
  onChange,
  onRemove,
  onAdd,
}: {
  lines: BillingLineDraft[]
  onChange: (index: number, patch: Partial<BillingLineDraft>) => void
  onRemove: (index: number) => void
  onAdd: () => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Các khoản trên phiếu</Label>
        <Button type="button" size="sm" variant="outline" onClick={onAdd}>
          <Plus className="mr-1 h-4 w-4" /> Thêm học liệu / sách
        </Button>
      </div>
      {lines.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có khoản nào.</p> : null}
      <div className="space-y-2">
        {lines.map((line, index) => (
          <div key={index} className="grid gap-2 rounded-lg border p-2 sm:grid-cols-[1fr_140px_70px_120px_auto] sm:items-center">
            <Input
              aria-label="Nội dung"
              value={line.description}
              onChange={(event) => onChange(index, { description: event.target.value })}
            />
            <Select
              items={CATEGORY_ITEMS}
              value={line.category}
              onValueChange={(value) => {
                const category = value as BillingCategory
                // Giảm trừ luôn là số âm
                const unitAmount = category === "DISCOUNT" ? -Math.abs(line.unitAmount) : Math.abs(line.unitAmount)
                onChange(index, { category, unitAmount })
              }}
            >
              <SelectTrigger className="w-full" aria-label="Loại">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              aria-label="Số lượng"
              type="number"
              min={0}
              value={line.quantity}
              onChange={(event) => onChange(index, { quantity: Math.max(0, Math.floor(Number(event.target.value) || 0)) })}
            />
            <Input
              aria-label="Đơn giá"
              inputMode="numeric"
              value={(line.unitAmount < 0 ? "-" : "") + formatMoneyInput(Math.abs(line.unitAmount))}
              onChange={(event) => {
                const digits = Number(event.target.value.replace(/\D/g, "") || 0)
                onChange(index, { unitAmount: line.category === "DISCOUNT" ? -digits : digits })
              }}
            />
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <span className="text-sm font-medium tabular-nums">{money(lineTotal(line))}</span>
              <Button type="button" size="icon" variant="ghost" aria-label="Xoá dòng" onClick={() => onRemove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
