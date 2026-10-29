"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, User } from "lucide-react"
import { formatVietnam } from "@/lib/curriculum"
import { vi } from "date-fns/locale"
import { addLeadNote } from "@/app/(admin)/admin/leads/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface LeadNote {
  id: string
  content: string
  createdAt: string | Date
  createdBy: { id: string; fullName: string } | null
}

interface LeadNotesTabProps {
  leadId: string
  initialNotes: LeadNote[]
}

export function LeadNotesTab({ leadId, initialNotes }: LeadNotesTabProps) {
  const router = useRouter()
  // Lấy thẳng từ props: router.refresh() sau khi thêm sẽ đưa ghi chú mới xuống
  const notes = initialNotes
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (isSubmitting) return
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung ghi chú")
      return
    }
    setIsSubmitting(true)
    const res = await addLeadNote({ leadId, content: content.trim() })
    setIsSubmitting(false)
    if (res.success) {
      toast.success("Đã thêm ghi chú")
      setContent("")
      // Optimistic update sẽ được refresh bằng router.refresh()
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Thêm ghi chú tư vấn</CardTitle>
          <CardDescription>
            Ghi lại các trao đổi với khách hàng, kết quả cuộc gọi, lý do từ chối...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="VD: Đã gọi lần 1, KH nói bận, hẹn gọi lại chiều nay..."
            className="min-h-[100px]"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()}>
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Đang lưu..." : "Thêm ghi chú"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử ghi chú ({notes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground gap-2">
              <p>Chưa có ghi chú nào.</p>
              <p className="text-xs">Dùng form ở trên để thêm ghi chú đầu tiên.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 border rounded-lg"
                >
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{note.createdBy?.fullName || "—"}</span>
                    <span>·</span>
                    <span>
                      {formatVietnam(new Date(note.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
