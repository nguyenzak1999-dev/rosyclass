"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HOMEWORK_KINDS } from "@/lib/curriculum"
import { upsertHomework } from "../actions"

export const nativeSelectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

export type HomeworkDraft = {
  id?: string
  title: string
  instructions: string
  kind: string
  /** "YYYY-MM-DD" hoặc "" */
  dueDate: string
  sessionId: string
  lessonId?: string | null
}

export type HomeworkSessionOption = { id: string; label: string }

export function HomeworkDialog({
  open,
  onOpenChange,
  classId,
  initial,
  sessions,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
  initial: HomeworkDraft
  /** Danh sách buổi để chọn; bỏ trống thì giữ nguyên initial.sessionId (vd. màn hình Lên lớp) */
  sessions?: HomeworkSessionOption[]
  onSaved?: () => void
}) {
  const router = useRouter()
  const [draft, setDraft] = React.useState<HomeworkDraft>(initial)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Nạp lại nội dung mỗi lần mở (initial thường là object mới ở mỗi lần render nên không đưa vào deps)
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setDraft(initial)
      setError(null)
    }
  }

  const update = (patch: Partial<HomeworkDraft>) => setDraft((current) => ({ ...current, ...patch }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!draft.title.trim()) {
      setError("Tên bài tập là bắt buộc")
      return
    }
    setSaving(true)
    const result = await upsertHomework({
      id: draft.id,
      classId,
      title: draft.title,
      instructions: draft.instructions,
      kind: draft.kind,
      dueDate: draft.dueDate,
      sessionId: draft.sessionId,
      lessonId: draft.lessonId ?? null,
    })
    setSaving(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(draft.id ? "Đã cập nhật bài tập" : "Đã giao bài tập về nhà")
    onOpenChange(false)
    onSaved?.()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{draft.id ? "Sửa bài tập về nhà" : "Giao bài về nhà"}</DialogTitle>
          <DialogDescription>Phụ huynh thấy bài này trong cổng phụ huynh và nộp ảnh hoặc ghi âm của bé.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="homework-title">Tên bài tập *</Label>
            <Input
              id="homework-title"
              value={draft.title}
              maxLength={200}
              onChange={(event) => update({ title: event.target.value })}
              placeholder="Tô màu và nói tên 5 màu"
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="homework-kind">Loại bài</Label>
              <select
                id="homework-kind"
                className={nativeSelectClass}
                value={draft.kind}
                onChange={(event) => update({ kind: event.target.value })}
              >
                {HOMEWORK_KINDS.map((kind) => (
                  <option key={kind.value} value={kind.value}>
                    {kind.emoji} {kind.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="homework-due">Hạn nộp</Label>
              <Input id="homework-due" type="date" value={draft.dueDate} onChange={(event) => update({ dueDate: event.target.value })} />
            </div>
          </div>
          {sessions ? (
            <div className="space-y-2">
              <Label htmlFor="homework-session">Giao ở buổi</Label>
              <select
                id="homework-session"
                className={nativeSelectClass}
                value={draft.sessionId}
                onChange={(event) => update({ sessionId: event.target.value })}
              >
                <option value="">— Không gắn buổi —</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="homework-instructions">Hướng dẫn cho ba mẹ</Label>
            <Textarea
              id="homework-instructions"
              value={draft.instructions}
              maxLength={2000}
              onChange={(event) => update({ instructions: event.target.value })}
              placeholder="Ba mẹ cùng bé nghe bài hát, rồi ghi âm bé hát lại đoạn điệp khúc nhé."
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : draft.id ? "Lưu bài tập" : "Giao bài"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
