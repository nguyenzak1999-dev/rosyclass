"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2, ClipboardCheck, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { MediaPreview } from "@/components/learning/media-preview"
import { reviewSubmission } from "./actions"
import { StickerPicker } from "./components/sticker-picker"
import { RecordInClassDialog, type RecordStudent } from "./components/record-in-class-dialog"

export type QueueSubmission = {
  id: string
  studentName: string
  homeworkTitle: string
  kindEmoji: string
  className: string
  classId: string
  submittedBy: string
  submittedAt: string
  mediaUrl: string | null
  mediaType: string | null
  parentNote: string | null
  sticker: string | null
  teacherComment: string | null
  status: string
  reviewedBy: string | null
}

export type QueueHomework = {
  id: string
  title: string
  kindEmoji: string
  className: string
  classId: string
  dateLabel: string
  dueLabel: string | null
  submitted: number
  reviewed: number
  students: RecordStudent[]
}

export function HomeworkQueueClient({
  submissions,
  homework,
  canReview,
  showReviewed,
}: {
  submissions: QueueSubmission[]
  homework: QueueHomework[]
  canReview: boolean
  showReviewed: boolean
}) {
  const [recordFor, setRecordFor] = React.useState<QueueHomework | null>(null)

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <section className="space-y-3" aria-label="Bài nộp">
        {submissions.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-muted-foreground">
            <Inbox className="h-8 w-8 opacity-50" />
            <p>{showReviewed ? "Chưa có bài nào được chấm." : "Không có bài nào đang chờ chấm. 🎉"}</p>
          </div>
        ) : (
          submissions.map((submission) => <SubmissionCard key={submission.id} submission={submission} canReview={canReview} />)
        )}
      </section>

      <aside className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bài tập gần đây</CardTitle>
            <CardDescription>Bé làm bài ngay trên lớp? Bấm &quot;Ghi nhận&quot; để tính là đã nộp.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {homework.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa giao bài tập nào trong 45 ngày qua.</p>
            ) : (
              homework.map((item) => (
                <div key={item.id} className="space-y-1.5 rounded-lg border p-3">
                  <p className="text-sm font-semibold leading-snug">
                    {item.kindEmoji} {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <Link href={`/admin/classes/${item.classId}`} className="hover:underline">
                      {item.className}
                    </Link>{" "}
                    · {item.dateLabel}
                    {item.dueLabel ? ` · hạn ${item.dueLabel}` : ""}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs">
                      Đã nộp {item.submitted}/{item.students.length} · đã chấm {item.reviewed}
                    </span>
                    {canReview ? (
                      <Button size="sm" variant="outline" onClick={() => setRecordFor(item)}>
                        <ClipboardCheck className="mr-1 h-3.5 w-3.5" /> Ghi nhận
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </aside>

      <RecordInClassDialog
        open={Boolean(recordFor)}
        onOpenChange={(open) => !open && setRecordFor(null)}
        homework={recordFor}
        students={recordFor?.students ?? []}
      />
    </div>
  )
}

function SubmissionCard({ submission, canReview }: { submission: QueueSubmission; canReview: boolean }) {
  const router = useRouter()
  const [sticker, setSticker] = React.useState<string | null>(submission.sticker)
  const [comment, setComment] = React.useState(submission.teacherComment ?? "")
  const [saving, setSaving] = React.useState(false)
  const reviewed = submission.status === "REVIEWED"

  const save = async () => {
    setSaving(true)
    const result = await reviewSubmission({ submissionId: submission.id, sticker, teacherComment: comment })
    setSaving(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(`Đã chấm bài của ${submission.studentName}`)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base">{submission.studentName}</CardTitle>
            <CardDescription>
              {submission.kindEmoji} {submission.homeworkTitle} ·{" "}
              <Link href={`/admin/classes/${submission.classId}`} className="hover:underline">
                {submission.className}
              </Link>
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {submission.submittedBy === "TEACHER" ? <Badge variant="info">Làm trên lớp</Badge> : null}
            {reviewed ? (
              <Badge variant="success">
                <CheckCircle2 className="h-3 w-3" /> Đã chấm{submission.reviewedBy ? ` · ${submission.reviewedBy}` : ""}
              </Badge>
            ) : (
              <Badge variant="warning">Chờ chấm</Badge>
            )}
            <span className="text-xs text-muted-foreground">{submission.submittedAt}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <MediaPreview url={submission.mediaUrl} type={submission.mediaType} alt={`Bài của ${submission.studentName}`} />
        {submission.parentNote ? (
          <p className="rounded-lg bg-muted/60 p-2.5 text-sm">
            <span className="font-medium">Ba mẹ nhắn: </span>
            {submission.parentNote}
          </p>
        ) : null}
        {!submission.mediaUrl && !submission.parentNote && submission.submittedBy !== "TEACHER" ? (
          <p className="text-sm text-muted-foreground">Bài nộp không kèm file.</p>
        ) : null}

        {canReview ? (
          <div className="space-y-2 border-t pt-3">
            <StickerPicker value={sticker} onChange={setSticker} disabled={saving} />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={500}
                placeholder="Một câu nhận xét cho bé (tuỳ chọn)"
                className="min-h-[44px] flex-1"
                aria-label={`Nhận xét cho ${submission.studentName}`}
              />
              <Button onClick={save} disabled={saving || (!sticker && !comment.trim())}>
                {saving ? "Đang lưu..." : reviewed ? "Lưu lại" : "Chấm bài"}
              </Button>
            </div>
          </div>
        ) : submission.sticker || submission.teacherComment ? (
          <p className="text-sm">
            {submission.sticker} {submission.teacherComment}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
