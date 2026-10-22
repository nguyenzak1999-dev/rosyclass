"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { recordInClassCompletion } from "../actions"
import { StickerPicker } from "./sticker-picker"

export type RecordStudent = { id: string; fullName: string; hasSubmission: boolean }

/** Ghi nhận "đã làm trên lớp" cho nhiều bé một lúc (không cần ảnh/ghi âm) */
export function RecordInClassDialog({
  open,
  onOpenChange,
  homework,
  students,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  homework: { id: string; title: string } | null
  students: RecordStudent[]
}) {
  const router = useRouter()
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [sticker, setSticker] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  const [openedFor, setOpenedFor] = React.useState<string | null>(null)
  const currentKey = open ? homework?.id ?? null : null
  if (currentKey !== openedFor) {
    setOpenedFor(currentKey)
    if (currentKey) {
      setSelected(new Set())
      setSticker(null)
    }
  }

  const pending = students.filter((student) => !student.hasSubmission)

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const save = async () => {
    if (!homework || selected.size === 0) return
    setSaving(true)
    const result = await recordInClassCompletion({ homeworkId: homework.id, studentIds: Array.from(selected), sticker })
    setSaving(false)
    if (!result.success || !result.data) {
      toast.error(result.error)
      return
    }
    toast.success(`Đã ghi nhận ${result.data.created} bé làm bài trên lớp`)
    if (result.data.skipped > 0) toast.info(`${result.data.skipped} bé đã có bài nộp nên được giữ nguyên`)
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Ghi nhận làm trên lớp</DialogTitle>
          <DialogDescription>
            {homework?.title}. Chọn các bé đã làm bài này trên lớp; bài được tính là đã nộp và đã chấm.
          </DialogDescription>
        </DialogHeader>

        {pending.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">Tất cả các bé đều đã có bài nộp.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Đã chọn {selected.size}/{pending.length} bé
              </span>
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() =>
                  setSelected(selected.size === pending.length ? new Set() : new Set(pending.map((student) => student.id)))
                }
              >
                {selected.size === pending.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {pending.map((student) => {
                const checked = selected.has(student.id)
                return (
                  <button
                    key={student.id}
                    type="button"
                    aria-pressed={checked}
                    onClick={() => toggle(student.id)}
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-lg border px-3 text-left text-sm font-medium transition-colors",
                      checked ? "border-primary bg-primary/10" : "hover:bg-muted"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        checked ? "border-primary bg-primary text-primary-foreground" : "border-input"
                      )}
                    >
                      {checked ? "✓" : ""}
                    </span>
                    {student.fullName}
                  </button>
                )
              })}
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Sticker cho các bé (tuỳ chọn)</p>
              <StickerPicker value={sticker} onChange={setSticker} />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button type="button" onClick={save} disabled={saving || selected.size === 0}>
            {saving ? "Đang lưu..." : "Ghi nhận"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
