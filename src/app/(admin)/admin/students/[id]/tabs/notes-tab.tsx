"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatVietnam } from "@/lib/curriculum"
import { MessageSquare, Plus, Trash2, User } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { addStudentNote, deleteStudentNote } from "../actions"

const noteTypeMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  CONSULTATION: { label: "Tư vấn", variant: "default" },
  TEACHER_COMMENT: { label: "Nhận xét GV", variant: "secondary" },
  PARENT_FEEDBACK: { label: "Phản hồi PH", variant: "outline" },
  INTERNAL: { label: "Nội bộ", variant: "outline" },
  FOLLOW_UP: { label: "Nhắc việc", variant: "secondary" },
}

const NOTE_TYPE_ITEMS = [
  { value: "CONSULTATION", label: "Tư vấn" },
  { value: "TEACHER_COMMENT", label: "Nhận xét giáo viên" },
  { value: "PARENT_FEEDBACK", label: "Phản hồi phụ huynh" },
  { value: "INTERNAL", label: "Ghi chú nội bộ" },
  { value: "FOLLOW_UP", label: "Nhắc việc cần theo dõi" },
]

export type StudentNote = {
  id: string
  type: string
  content: string
  createdAt: Date | string
  author: string
}

export function NotesTab({ student, notes = [] }: { student: any; notes?: StudentNote[] }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [type, setType] = React.useState("INTERNAL")
  const [content, setContent] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const handleAdd = async () => {
    if (!content.trim() || loading) return
    setLoading(true)
    const result = await addStudentNote(student.id, { type, content })
    setLoading(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success("Đã thêm ghi chú!")
    setOpen(false)
    setContent("")
    setType("INTERNAL")
    router.refresh()
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm("Xoá ghi chú này?")) return
    setDeletingId(noteId)
    const result = await deleteStudentNote(noteId)
    setDeletingId(null)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success("Đã xoá ghi chú")
    router.refresh()
  }

  const allNotes: (StudentNote & { removable?: boolean })[] = notes.map((note) => ({ ...note, removable: true }))
  if (student.notes) {
    allNotes.push({ id: "initial", type: "INTERNAL", content: student.notes, createdAt: student.joinedAt, author: "Hồ sơ học viên" })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Ghi chú nội bộ</h3>
          <p className="text-sm text-muted-foreground">Nhận xét và thông tin theo dõi học viên</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Thêm ghi chú</Button>} />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Thêm ghi chú</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Loại ghi chú</Label>
                <Select value={type} onValueChange={(value) => value && setType(value)} items={NOTE_TYPE_ITEMS}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NOTE_TYPE_ITEMS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nội dung *</Label>
                <Textarea
                  rows={4}
                  placeholder="Nhập nội dung ghi chú..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                <Button onClick={handleAdd} disabled={!content.trim() || loading}>
                  {loading ? "Đang lưu..." : "Lưu ghi chú"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-4">
          {allNotes.length === 0 ? (
            <div className="py-10 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Chưa có ghi chú nào. Bấm "+ Thêm ghi chú" để bắt đầu.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allNotes.map((note) => {
                const cfg = noteTypeMap[note.type] || { label: note.type, variant: "outline" }
                return (
                  <div key={note.id} className="flex gap-3 p-4 rounded-lg border hover:bg-accent/20 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{note.author}</span>
                        <Badge variant={cfg.variant as any} className="text-xs">{cfg.label}</Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {note.createdAt ? formatVietnam(new Date(note.createdAt), "dd/MM/yyyy HH:mm") : ""}
                        </span>
                        {note.removable && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            disabled={deletingId === note.id}
                            onClick={() => handleDelete(note.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
