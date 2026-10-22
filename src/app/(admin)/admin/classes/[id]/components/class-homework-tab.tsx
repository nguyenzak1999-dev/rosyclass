"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ClipboardCheck, NotebookPen, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { homeworkKindInfo } from "@/lib/curriculum"
import { deleteHomework } from "@/app/(admin)/admin/homework/actions"
import {
  HomeworkDialog,
  type HomeworkDraft,
  type HomeworkSessionOption,
} from "@/app/(admin)/admin/homework/components/homework-dialog"
import { RecordInClassDialog } from "@/app/(admin)/admin/homework/components/record-in-class-dialog"

export type ClassHomework = {
  id: string
  title: string
  instructions: string | null
  kind: string
  dueDateKey: string
  dueLabel: string | null
  sessionId: string | null
  lessonId: string | null
  sessionLabel: string | null
  createdLabel: string
  submittedIds: string[]
  reviewedCount: number
  pendingCount: number
}

const emptyDraft: HomeworkDraft = { title: "", instructions: "", kind: "OTHER", dueDate: "", sessionId: "" }

export function ClassHomeworkTab({
  classId,
  homework,
  students,
  sessions,
  canWrite,
}: {
  classId: string
  homework: ClassHomework[]
  students: { id: string; fullName: string }[]
  sessions: HomeworkSessionOption[]
  canWrite: boolean
}) {
  const router = useRouter()
  const [editing, setEditing] = React.useState<HomeworkDraft | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [recordFor, setRecordFor] = React.useState<ClassHomework | null>(null)

  const handleDelete = async () => {
    if (!deletingId) return
    setDeleting(true)
    const result = await deleteHomework(deletingId)
    setDeleting(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success("Đã xoá bài tập")
    setDeletingId(null)
    router.refresh()
  }

  const deletingItem = homework.find((item) => item.id === deletingId)

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle>Bài tập về nhà ({homework.length})</CardTitle>
          <CardDescription>
            Phụ huynh nộp ảnh hoặc ghi âm ở cổng phụ huynh; chấm bài ở trang{" "}
            <Link href={`/admin/homework?classId=${classId}`} className="text-primary hover:underline">
              Bài tập về nhà
            </Link>
            .
          </CardDescription>
        </div>
        {canWrite ? (
          <Button onClick={() => setEditing(emptyDraft)}>
            <Plus className="mr-2 h-4 w-4" /> Giao bài
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {homework.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-muted-foreground">
            <NotebookPen className="h-8 w-8 opacity-50" />
            <p>Lớp chưa có bài tập về nhà.</p>
          </div>
        ) : (
          <div className="divide-y rounded-lg border">
            {homework.map((item) => {
              const kind = homeworkKindInfo(item.kind)
              return (
                <div key={item.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="font-medium leading-snug">
                      <span aria-hidden="true">{kind.emoji}</span> {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {kind.label}
                      {item.sessionLabel ? ` · Buổi ${item.sessionLabel}` : ` · Giao ngày ${item.createdLabel}`}
                      {item.dueLabel ? ` · Hạn ${item.dueLabel}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">
                      Đã nộp {item.submittedIds.length}/{students.length}
                    </Badge>
                    {item.pendingCount > 0 ? (
                      <Link href={`/admin/homework?classId=${classId}`}>
                        <Badge variant="warning">{item.pendingCount} chờ chấm</Badge>
                      </Link>
                    ) : null}
                    {item.reviewedCount > 0 ? <Badge variant="success">{item.reviewedCount} đã chấm</Badge> : null}
                  </div>
                  {canWrite ? (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setRecordFor(item)}>
                        <ClipboardCheck className="mr-1 h-3.5 w-3.5" /> Làm trên lớp
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Sửa ${item.title}`}
                        onClick={() =>
                          setEditing({
                            id: item.id,
                            title: item.title,
                            instructions: item.instructions ?? "",
                            kind: item.kind,
                            dueDate: item.dueDateKey,
                            sessionId: item.sessionId ?? "",
                            lessonId: item.lessonId,
                          })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Xoá ${item.title}`}
                        onClick={() => setDeletingId(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      <HomeworkDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        classId={classId}
        initial={editing ?? emptyDraft}
        sessions={sessions}
      />

      <RecordInClassDialog
        open={Boolean(recordFor)}
        onOpenChange={(open) => !open && setRecordFor(null)}
        homework={recordFor}
        students={students.map((student) => ({
          ...student,
          hasSubmission: Boolean(recordFor?.submittedIds.includes(student.id)),
        }))}
      />

      <ConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Xoá bài tập này?"
        description={
          deletingItem && deletingItem.submittedIds.length > 0
            ? `${deletingItem.submittedIds.length} bài nộp của các bé cũng sẽ bị xoá.`
            : "Bài tập sẽ bị xoá khỏi lớp và cổng phụ huynh."
        }
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
        isSubmitting={deleting}
      />
    </Card>
  )
}
