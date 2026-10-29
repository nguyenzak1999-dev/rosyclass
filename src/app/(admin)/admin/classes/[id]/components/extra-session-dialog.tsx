"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createExtraSession } from "@/app/(admin)/admin/classes/actions"
import { vietnamDateKey } from "@/lib/curriculum"
import { FOREIGN_TEACHER_SURCHARGE } from "@/lib/monthly-billing-shared"
import { formatMoneyInput, parseMoneyInput } from "@/lib/utils"

interface ExtraSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
  teachers: { id: string; fullName: string }[]
  /** Giờ học thường của lớp để gợi ý sẵn */
  defaultTimes?: { startTime: string; endTime: string }
}

const NO_TEACHER = "none"

export function ExtraSessionDialog({ open, onOpenChange, classId, teachers, defaultTimes }: ExtraSessionDialogProps) {
  const router = useRouter()
  const initial = React.useCallback(
    () => ({
      sessionDate: vietnamDateKey(new Date()),
      startTime: defaultTimes?.startTime ?? "18:00",
      endTime: defaultTimes?.endTime ?? "19:30",
      teacherId: NO_TEACHER,
      topic: "",
      isForeignTeacher: true,
      surcharge: FOREIGN_TEACHER_SURCHARGE,
    }),
    [defaultTimes]
  )
  const [form, setForm] = React.useState(initial)
  const [saving, setSaving] = React.useState(false)

  const handleOpenChange = (next: boolean) => {
    if (next) setForm(initial())
    onOpenChange(next)
  }

  const update = <K extends keyof ReturnType<typeof initial>>(key: K, value: ReturnType<typeof initial>[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      const result = await createExtraSession({
        classId,
        sessionDate: form.sessionDate,
        startTime: form.startTime,
        endTime: form.endTime,
        teacherId: form.teacherId === NO_TEACHER ? null : form.teacherId,
        topic: form.topic,
        isForeignTeacher: form.isForeignTeacher,
        surcharge: form.surcharge,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Đã thêm buổi học")
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error("Không thể thêm buổi học")
    } finally {
      setSaving(false)
    }
  }

  const teacherItems = [
    { value: NO_TEACHER, label: "— Chưa chọn —" },
    ...teachers.map((teacher) => ({ value: teacher.id, label: teacher.fullName })),
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Thêm buổi học ngoài lịch</DialogTitle>
            <DialogDescription>
              Mỗi tháng lớp có 1 buổi học thêm với giáo viên nước ngoài. Phiếu thu tháng tính buổi này bằng đơn giá
              buổi cộng phụ thu.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-3">
              <Label htmlFor="extra-date">Ngày học</Label>
              <Input
                id="extra-date"
                type="date"
                required
                value={form.sessionDate}
                onChange={(event) => update("sessionDate", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="extra-start">Bắt đầu</Label>
              <Input
                id="extra-start"
                type="time"
                required
                value={form.startTime}
                onChange={(event) => update("startTime", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="extra-end">Kết thúc</Label>
              <Input
                id="extra-end"
                type="time"
                required
                value={form.endTime}
                onChange={(event) => update("endTime", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Giáo viên dạy</Label>
            <Select items={teacherItems} value={form.teacherId} onValueChange={(value) => update("teacherId", String(value))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teacherItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra-topic">Chủ đề (tuỳ chọn)</Label>
            <Input
              id="extra-topic"
              value={form.topic}
              placeholder="Học với giáo viên nước ngoài"
              onChange={(event) => update("topic", event.target.value)}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
            <Checkbox
              checked={form.isForeignTeacher}
              onCheckedChange={(value) => update("isForeignTeacher", value === true)}
            />
            <span className="text-sm font-medium">Buổi với giáo viên nước ngoài (có phụ thu)</span>
          </label>

          {form.isForeignTeacher && (
            <div className="space-y-2">
              <Label htmlFor="extra-surcharge">Phụ thu mỗi bé (VNĐ)</Label>
              <Input
                id="extra-surcharge"
                inputMode="numeric"
                value={formatMoneyInput(form.surcharge)}
                onChange={(event) => update("surcharge", parseMoneyInput(event.target.value))}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Đang lưu…" : "Thêm buổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
