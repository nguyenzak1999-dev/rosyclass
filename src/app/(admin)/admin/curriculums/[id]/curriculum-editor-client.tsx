"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowDown, ArrowUp, ExternalLink, Music, Pencil, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { CurriculumDialog } from "../components/curriculum-dialog"
import {
  deleteCurriculum,
  deleteCurriculumUnit,
  deleteLesson,
  moveCurriculumUnit,
  moveLesson,
} from "../actions"
import { LessonDialog, UnitDialog } from "./components/unit-lesson-dialogs"

export type EditorLesson = {
  id: string
  order: number
  title: string
  objectives: string | null
  activities: string | null
  materials: string | null
  mediaUrl: string | null
  homework: string | null
}

export type EditorUnit = {
  id: string
  order: number
  title: string
  objectives: string | null
  vocabulary: string[]
  sentencePatterns: string[]
  phonics: string | null
  songUrl: string | null
  lessons: EditorLesson[]
}

export type EditorCurriculum = {
  id: string
  name: string
  gradeLabel: string
  description: string | null
  sourceBook: string | null
  status: "ACTIVE" | "INACTIVE" | "DRAFT" | "PUBLISHED"
  classes: { id: string; name: string }[]
  units: EditorUnit[]
}

type PendingDelete =
  | { kind: "curriculum" }
  | { kind: "unit"; unit: EditorUnit }
  | { kind: "lesson"; lesson: EditorLesson }

export function CurriculumEditorClient({ curriculum, canWrite }: { curriculum: EditorCurriculum; canWrite: boolean }) {
  const router = useRouter()
  const [unitDialog, setUnitDialog] = React.useState<{ open: boolean; unit: EditorUnit | null }>({ open: false, unit: null })
  const [lessonDialog, setLessonDialog] = React.useState<{
    open: boolean
    unit: EditorUnit | null
    lesson: EditorLesson | null
  }>({ open: false, unit: null, lesson: null })
  const [pendingDelete, setPendingDelete] = React.useState<PendingDelete | null>(null)
  const [busy, setBusy] = React.useState(false)

  const lessonCount = curriculum.units.reduce((sum, unit) => sum + unit.lessons.length, 0)

  const run = async (action: () => Promise<{ success: boolean; error?: string }>, successMessage?: string) => {
    setBusy(true)
    const result = await action()
    setBusy(false)
    if (!result.success) {
      toast.error(result.error)
      return false
    }
    if (successMessage) toast.success(successMessage)
    router.refresh()
    return true
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    if (pendingDelete.kind === "curriculum") {
      setBusy(true)
      const result = await deleteCurriculum(curriculum.id)
      setBusy(false)
      if (!result.success) return void toast.error(result.error)
      toast.success("Đã xoá chương trình học")
      router.push("/admin/curriculums")
      return
    }
    const ok =
      pendingDelete.kind === "unit"
        ? await run(() => deleteCurriculumUnit(pendingDelete.unit.id), "Đã xoá Unit")
        : await run(() => deleteLesson(pendingDelete.lesson.id), "Đã xoá bài học")
    if (ok) setPendingDelete(null)
  }

  const deleteCopy = (() => {
    if (!pendingDelete) return { title: "", description: "" }
    if (pendingDelete.kind === "curriculum") {
      return {
        title: "Xoá chương trình học?",
        description: `Toàn bộ ${curriculum.units.length} Unit và ${lessonCount} bài sẽ bị xoá. ${
          curriculum.classes.length > 0 ? `${curriculum.classes.length} lớp đang dùng sẽ bỏ liên kết, ` : ""
        }các buổi học đã gắn bài sẽ không còn bài.`,
      }
    }
    if (pendingDelete.kind === "unit") {
      return {
        title: `Xoá Unit ${pendingDelete.unit.order}: ${pendingDelete.unit.title}?`,
        description: `${pendingDelete.unit.lessons.length} bài trong Unit cũng bị xoá; buổi học đã gắn các bài này sẽ không còn bài.`,
      }
    }
    return {
      title: `Xoá Bài ${pendingDelete.lesson.order}: ${pendingDelete.lesson.title}?`,
      description: "Buổi học đã gắn bài này sẽ không còn bài.",
    }
  })()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chương trình</CardTitle>
          <CardDescription>
            {curriculum.units.length} Unit · {lessonCount} bài
            {curriculum.sourceBook ? ` · Giáo trình: ${curriculum.sourceBook}` : ""}
          </CardDescription>
          {canWrite ? (
            <CardAction className="flex gap-2">
              <CurriculumDialog
                initialData={{
                  id: curriculum.id,
                  name: curriculum.name,
                  gradeLabel: curriculum.gradeLabel,
                  description: curriculum.description ?? "",
                  sourceBook: curriculum.sourceBook ?? "",
                  status: curriculum.status,
                }}
                trigger={
                  <Button variant="outline" size="sm">
                    <Pencil /> Sửa thông tin
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setPendingDelete({ kind: "curriculum" })}
              >
                <Trash2 /> Xoá
              </Button>
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {curriculum.description ? <p className="whitespace-pre-wrap">{curriculum.description}</p> : null}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground">Lớp đang dùng:</span>
            {curriculum.classes.length === 0 ? (
              <span className="text-muted-foreground italic">chưa có lớp nào (chọn chương trình trong form sửa lớp)</span>
            ) : (
              curriculum.classes.map((cls) => (
                <Badge key={cls.id} variant="secondary" render={<Link href={`/admin/classes/${cls.id}`} />}>
                  {cls.name}
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Unit & bài học</h2>
        {canWrite ? (
          <Button onClick={() => setUnitDialog({ open: true, unit: null })}>
            <Plus /> Thêm Unit
          </Button>
        ) : null}
      </div>

      {curriculum.units.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-sm text-muted-foreground">
          <p>Chương trình chưa có Unit nào.</p>
          {canWrite ? <p className="text-xs">Bấm &quot;Thêm Unit&quot; để bắt đầu soạn.</p> : null}
        </div>
      ) : (
        <div className="space-y-4">
          {curriculum.units.map((unit, unitIndex) => (
            <Card key={unit.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  Unit {unit.order}: {unit.title}
                </CardTitle>
                <CardDescription>{unit.lessons.length} bài</CardDescription>
                {canWrite ? (
                  <CardAction className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={busy || unitIndex === 0}
                      onClick={() => run(() => moveCurriculumUnit(unit.id, "up"))}
                      aria-label="Chuyển Unit lên"
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={busy || unitIndex === curriculum.units.length - 1}
                      onClick={() => run(() => moveCurriculumUnit(unit.id, "down"))}
                      aria-label="Chuyển Unit xuống"
                    >
                      <ArrowDown />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setUnitDialog({ open: true, unit })} aria-label="Sửa Unit">
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setPendingDelete({ kind: "unit", unit })}
                      aria-label="Xoá Unit"
                    >
                      <Trash2 />
                    </Button>
                  </CardAction>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4">
                <UnitSummary unit={unit} />

                <div className="space-y-2">
                  {unit.lessons.length === 0 ? (
                    <p className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">Unit chưa có bài học.</p>
                  ) : (
                    unit.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="flex items-start gap-3 rounded-lg border p-3">
                        <Badge variant="outline" className="mt-0.5 shrink-0">
                          Bài {lesson.order}
                        </Badge>
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="font-medium">{lesson.title}</p>
                          {lesson.objectives ? <p className="text-sm text-muted-foreground">{lesson.objectives}</p> : null}
                          {lesson.activities ? (
                            <p className="line-clamp-2 text-xs whitespace-pre-wrap text-muted-foreground">{lesson.activities}</p>
                          ) : null}
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                            {lesson.materials ? <span>Đồ dùng: {lesson.materials}</span> : null}
                            {lesson.homework ? <span>BTVN: {lesson.homework}</span> : null}
                            {lesson.mediaUrl ? (
                              <a href={lesson.mediaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                                <ExternalLink className="h-3 w-3" /> Media
                              </a>
                            ) : null}
                          </div>
                        </div>
                        {canWrite ? (
                          <div className="flex shrink-0 gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              disabled={busy || lessonIndex === 0}
                              onClick={() => run(() => moveLesson(lesson.id, "up"))}
                              aria-label="Chuyển bài lên"
                            >
                              <ArrowUp />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              disabled={busy || lessonIndex === unit.lessons.length - 1}
                              onClick={() => run(() => moveLesson(lesson.id, "down"))}
                              aria-label="Chuyển bài xuống"
                            >
                              <ArrowDown />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setLessonDialog({ open: true, unit, lesson })}
                              aria-label="Sửa bài"
                            >
                              <Pencil />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setPendingDelete({ kind: "lesson", lesson })}
                              aria-label="Xoá bài"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                  {canWrite ? (
                    <Button variant="outline" size="sm" onClick={() => setLessonDialog({ open: true, unit, lesson: null })}>
                      <Plus /> Thêm bài vào Unit {unit.order}
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <UnitDialog
        open={unitDialog.open}
        onOpenChange={(open) => setUnitDialog((state) => ({ ...state, open }))}
        curriculumId={curriculum.id}
        unit={unitDialog.unit}
      />
      <LessonDialog
        open={lessonDialog.open}
        onOpenChange={(open) => setLessonDialog((state) => ({ ...state, open }))}
        unit={lessonDialog.unit}
        lesson={lessonDialog.lesson}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={deleteCopy.title}
        description={deleteCopy.description}
        confirmText="Xoá"
        variant="destructive"
        onConfirm={confirmDelete}
        isSubmitting={busy}
      />
    </div>
  )
}

function UnitSummary({ unit }: { unit: EditorUnit }) {
  const hasAnything =
    unit.objectives || unit.vocabulary.length || unit.sentencePatterns.length || unit.phonics || unit.songUrl
  if (!hasAnything) return null

  return (
    <div className="grid gap-3 rounded-lg bg-muted/40 p-3 text-sm md:grid-cols-2">
      {unit.objectives ? (
        <div className="md:col-span-2">
          <p className="text-xs text-muted-foreground">Mục tiêu</p>
          <p className="whitespace-pre-wrap">{unit.objectives}</p>
        </div>
      ) : null}
      {unit.vocabulary.length > 0 ? (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Từ vựng</p>
          <div className="flex flex-wrap gap-1">
            {unit.vocabulary.map((word) => (
              <Badge key={word} variant="secondary">
                {word}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
      {unit.sentencePatterns.length > 0 ? (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Mẫu câu</p>
          <ul className="list-inside list-disc space-y-0.5">
            {unit.sentencePatterns.map((pattern) => (
              <li key={pattern}>{pattern}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {unit.phonics ? (
        <div>
          <p className="text-xs text-muted-foreground">Phonics</p>
          <p>{unit.phonics}</p>
        </div>
      ) : null}
      {unit.songUrl ? (
        <div>
          <p className="text-xs text-muted-foreground">Bài hát / video</p>
          <a href={unit.songUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
            <Music className="h-3.5 w-3.5" /> Mở link
          </a>
        </div>
      ) : null}
    </div>
  )
}
