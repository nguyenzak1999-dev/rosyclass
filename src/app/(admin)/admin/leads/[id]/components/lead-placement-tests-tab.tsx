"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { GraduationCap, Save, ExternalLink, Pencil, Trash2, CheckCircle2, Clock } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import Link from "next/link"
import { recordTestResult, deletePlacementTest } from "@/app/(admin)/admin/leads/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface PlacementTest {
  id: string
  testDate: string | Date
  listeningScore: number | null
  readingScore: number | null
  writingScore: number | null
  speakingScore: number | null
  totalScore: number | null
  levelResult: string | null
  suggestedCourseId: string | null
  teacherComment: string | null
}

interface CourseLite {
  id: string
  name: string
  level: string
}

interface LeadPlacementTestsTabProps {
  leadId: string
  tests: PlacementTest[]
  courses: CourseLite[]
}

export function LeadPlacementTestsTab({
  leadId,
  tests,
  courses,
}: LeadPlacementTestsTabProps) {
  const router = useRouter()
  const [editingTest, setEditingTest] = useState<PlacementTest | null>(null)
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deletingTestId) return
    setIsDeleting(true)
    const res = await deletePlacementTest(deletingTestId, leadId)
    setIsDeleting(false)
    if (res.success) {
      toast.success("Đã xoá placement test")
      setDeletingTestId(null)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="space-y-4">
      {/* CTA làm test trên web (nếu chưa có test nào) */}
      {tests.length === 0 && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900">
                  Khách hàng có thể tự làm bài placement test trên website.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  render={<Link href="/kiem-tra-trinh-do" target="_blank" />}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> Mở trang test (tab mới)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" /> Lịch sử Placement Test ({tests.length})
          </CardTitle>
          <CardDescription>
            Tất cả các lần test đã book và kết quả
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground gap-2">
              <GraduationCap className="w-8 h-8 opacity-50" />
              <p>Chưa có placement test nào.</p>
              <p className="text-xs">Click "Đặt lịch Placement Test" ở trên để tạo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((test) => {
                const isCompleted = test.totalScore !== null
                return (
                  <div
                    key={test.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">
                            {format(new Date(test.testDate), "dd/MM/yyyy", { locale: vi })}
                          </p>
                          {isCompleted ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Đã chấm
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <Clock className="w-3 h-3" /> Chưa có điểm
                            </Badge>
                          )}
                          {test.levelResult && (
                            <Badge variant="secondary">Level: {test.levelResult}</Badge>
                          )}
                        </div>
                        {isCompleted && (
                          <div className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                            <ScoreBadge label="Nghe" value={test.listeningScore} />
                            <ScoreBadge label="Đọc" value={test.readingScore} />
                            <ScoreBadge label="Viết" value={test.writingScore} />
                            <ScoreBadge label="Nói" value={test.speakingScore} />
                            <div className="p-2 bg-muted/50 rounded text-center">
                              <p className="text-xs text-muted-foreground">Tổng</p>
                              <p className="font-bold text-base">{test.totalScore}/10</p>
                            </div>
                          </div>
                        )}
                        {test.teacherComment && (
                          <p className="mt-2 text-xs text-muted-foreground italic">
                            💬 {test.teacherComment}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTest(test)}
                        >
                          {isCompleted ? <Pencil className="w-4 h-4" /> : (
                            <>
                              <Save className="w-4 h-4 mr-1" /> Nhập điểm
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingTestId(test.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit / nhập điểm Dialog */}
      {editingTest && (
        <RecordTestResultDialog
          test={editingTest}
          courses={courses}
          onClose={() => setEditingTest(null)}
        />
      )}

      <ConfirmDialog
        open={deletingTestId !== null}
        onOpenChange={(open) => !open && setDeletingTestId(null)}
        title="Xoá placement test?"
        description="Hành động này không thể hoàn tác. Test record và kết quả sẽ bị xoá."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
    </div>
  )
}

function ScoreBadge({ label, value }: { label: string; value: number | null }) {
  if (value === null) {
    return (
      <div className="p-2 bg-muted/30 rounded text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-muted-foreground text-sm">—</p>
      </div>
    )
  }
  const color = value >= 7 ? "text-green-700" : value >= 5 ? "text-yellow-700" : "text-red-700"
  return (
    <div className="p-2 bg-muted/50 rounded text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-bold text-base ${color}`}>{value}</p>
    </div>
  )
}

interface RecordTestResultDialogProps {
  test: PlacementTest
  courses: CourseLite[]
  onClose: () => void
}

function RecordTestResultDialog({ test, courses, onClose }: RecordTestResultDialogProps) {
  const router = useRouter()
  const [listening, setListening] = useState(test.listeningScore?.toString() || "")
  const [reading, setReading] = useState(test.readingScore?.toString() || "")
  const [writing, setWriting] = useState(test.writingScore?.toString() || "")
  const [speaking, setSpeaking] = useState(test.speakingScore?.toString() || "")
  const [total, setTotal] = useState(test.totalScore?.toString() || "")
  const [level, setLevel] = useState(test.levelResult || "")
  const [courseId, setCourseId] = useState(test.suggestedCourseId || "none")
  const [comment, setComment] = useState(test.teacherComment || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const res = await recordTestResult({
      placementTestId: test.id,
      listeningScore: listening ? parseFloat(listening) : null,
      readingScore: reading ? parseFloat(reading) : null,
      writingScore: writing ? parseFloat(writing) : null,
      speakingScore: speaking ? parseFloat(speaking) : null,
      totalScore: total ? parseFloat(total) : null,
      levelResult: level || null,
      suggestedCourseId: courseId === "none" ? null : courseId,
      teacherComment: comment || null,
    })
    setIsSubmitting(false)
    if (res.success) {
      toast.success("Đã lưu kết quả test")
      onClose()
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            {test.totalScore !== null ? "Sửa kết quả" : "Nhập kết quả"} Placement Test
          </DialogTitle>
          <DialogDescription>
            Ngày test: {format(new Date(test.testDate), "dd/MM/yyyy", { locale: vi })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="listening">Điểm Nghe (0-10)</Label>
              <Input
                id="listening"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={listening}
                onChange={(e) => setListening(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reading">Điểm Đọc (0-10)</Label>
              <Input
                id="reading"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={reading}
                onChange={(e) => setReading(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="writing">Điểm Viết (0-10)</Label>
              <Input
                id="writing"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={writing}
                onChange={(e) => setWriting(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="speaking">Điểm Nói (0-10)</Label>
              <Input
                id="speaking"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={speaking}
                onChange={(e) => setSpeaking(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="total">Tổng điểm (0-10) *</Label>
            <Input
              id="total"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="VD: 7.5"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="level">Level gợi ý</Label>
            <Input
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="VD: A2, B1, IELTS_FOUNDATION..."
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="course">Khóa học gợi ý</Label>
            <Select
              value={courseId}
              onValueChange={(v) => setCourseId(v as string)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn khóa học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Không chọn —</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comment">Nhận xét của GV</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhận xét về khả năng, điểm mạnh/yếu..."
              className="min-h-[80px]"
              disabled={isSubmitting}
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            💡 Sau khi lưu: Lead.status sẽ chuyển sang <strong>TESTED</strong>, Lead.currentLevel = level gợi ý, ghi log vào timeline.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu kết quả"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
