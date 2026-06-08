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
import { ClipboardCheck, UserPlus, AlertCircle, Loader2 } from "lucide-react"
import {
  bookPlacementTest,
  convertLeadToStudent,
} from "@/app/(admin)/admin/leads/actions"
import { type ConvertLeadToStudentFormValues } from "@/lib/schemas/lead"
import { toast } from "sonner"

interface LeadActionsDialogProps {
  open: "book" | "convert" | null
  onOpenChange: (open: boolean) => void
  lead: {
    id: string
    fullName: string
    email: string | null
    currentLevel: string | null
    learningGoal: string | null
  }
  parents: { id: string; fullName: string; phone: string }[]
  onSuccess?: () => void
}

export function LeadActionsDialog({
  open,
  onOpenChange,
  lead,
  parents,
  onSuccess,
}: LeadActionsDialogProps) {
  // === Book placement test state ===
  const [testDate, setTestDate] = useState("")
  const [testNotes, setTestNotes] = useState("")
  const [bookSubmitting, setBookSubmitting] = useState(false)

  // === Convert lead state ===
  const [convertStatus, setConvertStatus] =
    useState<ConvertLeadToStudentFormValues["status"]>("WAITING_CLASS")
  const [convertCurrentLevel, setConvertCurrentLevel] = useState(
    lead.currentLevel || ""
  )
  const [convertLearningGoal, setConvertLearningGoal] = useState(
    lead.learningGoal || ""
  )
  const [convertEmail, setConvertEmail] = useState(lead.email || "")
  const [convertParentId, setConvertParentId] = useState<string>("none")
  const [convertSubmitting, setConvertSubmitting] = useState(false)

  useEffect(() => {
    if (open === "convert") {
      setConvertCurrentLevel(lead.currentLevel || "")
      setConvertLearningGoal(lead.learningGoal || "")
      setConvertEmail(lead.email || "")
      setConvertParentId("none")
      setConvertStatus("WAITING_CLASS")
    }
    if (open === "book") {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setTestDate(tomorrow.toISOString().split("T")[0])
      setTestNotes("")
    }
  }, [open, lead])

  const handleBook = async () => {
    if (!testDate) {
      toast.error("Vui lòng chọn ngày test")
      return
    }
    setBookSubmitting(true)
    const res = await bookPlacementTest({
      leadId: lead.id,
      testDate,
      notes: testNotes || undefined,
    })
    setBookSubmitting(false)
    if (res.success) {
      toast.success("Đã đặt lịch placement test")
      onOpenChange(false)
      onSuccess?.()
    } else {
      toast.error(res.error)
    }
  }

  const handleConvert = async () => {
    setConvertSubmitting(true)
    const res = await convertLeadToStudent({
      leadId: lead.id,
      status: convertStatus,
      currentLevel: convertCurrentLevel || undefined,
      learningGoal: convertLearningGoal || undefined,
      email: convertEmail || undefined,
      parentId: convertParentId === "none" ? null : convertParentId,
    })
    setConvertSubmitting(false)
    if (res.success) {
      toast.success("Đã chuyển lead thành học viên!")
      onOpenChange(false)
      onSuccess?.()
    } else {
      toast.error(res.error)
    }
  }

  if (open === null) return null

  return (
    <Dialog
      open={open !== null}
      onOpenChange={(o) => !o && onOpenChange(false)}
    >
      <DialogContent className="sm:max-w-[500px]">
        {open === "book" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Đặt lịch Placement Test
              </DialogTitle>
              <DialogDescription>
                Tạo lịch test cho <strong>{lead.fullName}</strong>. Lead sẽ chuyển sang trạng thái PLACEMENT_TEST_BOOKED.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="testDate">Ngày test *</Label>
                <Input
                  id="testDate"
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  disabled={bookSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="testNotes">Ghi chú (tuỳ chọn)</Label>
                <Textarea
                  id="testNotes"
                  value={testNotes}
                  onChange={(e) => setTestNotes(e.target.value)}
                  placeholder="VD: Ưu tiên test buổi tối, level mục tiêu A2..."
                  disabled={bookSubmitting}
                  className="min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={bookSubmitting}>
                Huỷ
              </Button>
              <Button onClick={handleBook} disabled={bookSubmitting}>
                {bookSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang đặt lịch...
                  </>
                ) : (
                  "Xác nhận đặt lịch"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Chuyển thành học viên
              </DialogTitle>
              <DialogDescription>
                Tạo học viên mới từ lead <strong>{lead.fullName}</strong>. Lead sẽ chuyển sang ENROLLED.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="convertStatus">Trạng thái ban đầu</Label>
                  <Select
                    value={convertStatus}
                    onValueChange={(v) => setConvertStatus(v as ConvertLeadToStudentFormValues["status"])}
                    disabled={convertSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WAITING_CLASS">Chờ xếp lớp</SelectItem>
                      <SelectItem value="ACTIVE">Đang học</SelectItem>
                      <SelectItem value="RESERVED">Bảo lưu</SelectItem>
                      <SelectItem value="PAUSED">Tạm dừng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="convertEmail">Email</Label>
                  <Input
                    id="convertEmail"
                    type="email"
                    value={convertEmail}
                    onChange={(e) => setConvertEmail(e.target.value)}
                    placeholder="email@example.com"
                    disabled={convertSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="convertCurrentLevel">Trình độ hiện tại</Label>
                <Input
                  id="convertCurrentLevel"
                  value={convertCurrentLevel}
                  onChange={(e) => setConvertCurrentLevel(e.target.value)}
                  placeholder="VD: A1, A2, B1..."
                  disabled={convertSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="convertLearningGoal">Mục tiêu học tập</Label>
                <Textarea
                  id="convertLearningGoal"
                  value={convertLearningGoal}
                  onChange={(e) => setConvertLearningGoal(e.target.value)}
                  placeholder="VD: Đạt IELTS 6.5 trong 6 tháng"
                  disabled={convertSubmitting}
                  className="min-h-[70px]"
                />
              </div>
              {parents.length > 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="convertParent">Liên kết phụ huynh (tuỳ chọn)</Label>
                  <Select
                    value={convertParentId}
                    onValueChange={(v) => setConvertParentId(v as string)}
                    disabled={convertSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phụ huynh" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Không liên kết —</SelectItem>
                      {parents.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.fullName} ({p.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800 text-xs">
                  Hành động này tạo học viên mới và đánh dấu lead là ENROLLED. Không thể hoàn tác nhưng có thể tạo lead mới nếu cần.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={convertSubmitting}>
                Huỷ
              </Button>
              <Button onClick={handleConvert} disabled={convertSubmitting}>
                {convertSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang chuyển...
                  </>
                ) : (
                  "Xác nhận chuyển"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
