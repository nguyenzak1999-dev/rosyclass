"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { upsertCurriculumUnit, upsertLesson } from "../../actions"
import type { EditorLesson, EditorUnit } from "../curriculum-editor-client"

type UnitFormState = {
  title: string
  objectives: string
  vocabularyText: string
  sentencePatternsText: string
  phonics: string
  songUrl: string
}

function unitToForm(unit?: EditorUnit | null): UnitFormState {
  return {
    title: unit?.title ?? "",
    objectives: unit?.objectives ?? "",
    vocabularyText: unit?.vocabulary.join(", ") ?? "",
    sentencePatternsText: unit?.sentencePatterns.join("\n") ?? "",
    phonics: unit?.phonics ?? "",
    songUrl: unit?.songUrl ?? "",
  }
}

export function UnitDialog({
  open,
  onOpenChange,
  curriculumId,
  unit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  curriculumId: string
  unit: EditorUnit | null
}) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormState>({ defaultValues: unitToForm(unit) })

  React.useEffect(() => {
    if (open) reset(unitToForm(unit))
  }, [open, unit, reset])

  const onSubmit = async (values: UnitFormState) => {
    const result = await upsertCurriculumUnit({ ...values, id: unit?.id, curriculumId })
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(unit ? "Đã cập nhật Unit" : "Đã thêm Unit")
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>{unit ? `Sửa Unit ${unit.order}` : "Thêm Unit"}</DialogTitle>
          <DialogDescription>Chủ đề lớn của chương trình, gồm nhiều bài học.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unit-title">Tên Unit *</Label>
            <Input
              id="unit-title"
              {...register("title", { required: "Tên Unit là bắt buộc", maxLength: { value: 200, message: "Tối đa 200 ký tự" } })}
              placeholder="Hello!"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit-objectives">Mục tiêu</Label>
            <Textarea id="unit-objectives" {...register("objectives")} placeholder="Sau Unit này bé có thể…" className="min-h-[70px]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit-vocabulary">Từ vựng</Label>
            <Textarea
              id="unit-vocabulary"
              {...register("vocabularyText")}
              placeholder="hello, hi, goodbye, bye"
              className="min-h-[70px]"
            />
            <p className="text-xs text-muted-foreground">Cách nhau bằng dấu phẩy hoặc xuống dòng.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit-patterns">Mẫu câu</Label>
            <Textarea
              id="unit-patterns"
              {...register("sentencePatternsText")}
              placeholder={"Hello, I'm Mai.\nWhat's your name?"}
              className="min-h-[70px]"
            />
            <p className="text-xs text-muted-foreground">Mỗi dòng một mẫu câu.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unit-phonics">Âm phonics</Label>
              <Input id="unit-phonics" {...register("phonics")} placeholder="/h/ – hat, hen" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit-song">Link bài hát / video</Label>
              <Input id="unit-song" type="url" inputMode="url" {...register("songUrl")} placeholder="https://…" />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu Unit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type LessonFormState = {
  title: string
  objectives: string
  activities: string
  materials: string
  mediaUrl: string
  homework: string
}

function lessonToForm(lesson?: EditorLesson | null): LessonFormState {
  return {
    title: lesson?.title ?? "",
    objectives: lesson?.objectives ?? "",
    activities: lesson?.activities ?? "",
    materials: lesson?.materials ?? "",
    mediaUrl: lesson?.mediaUrl ?? "",
    homework: lesson?.homework ?? "",
  }
}

export function LessonDialog({
  open,
  onOpenChange,
  unit,
  lesson,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit: EditorUnit | null
  lesson: EditorLesson | null
}) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormState>({ defaultValues: lessonToForm(lesson) })

  React.useEffect(() => {
    if (open) reset(lessonToForm(lesson))
  }, [open, lesson, reset])

  const onSubmit = async (values: LessonFormState) => {
    if (!unit) return
    const result = await upsertLesson({ ...values, id: lesson?.id, unitId: unit.id })
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(lesson ? "Đã cập nhật bài học" : "Đã thêm bài học")
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{lesson ? `Sửa Bài ${lesson.order}` : "Thêm bài học"}</DialogTitle>
          {unit ? (
            <DialogDescription>
              Unit {unit.order}: {unit.title}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Tên bài *</Label>
            <Input
              id="lesson-title"
              {...register("title", { required: "Tên bài là bắt buộc", maxLength: { value: 200, message: "Tối đa 200 ký tự" } })}
              placeholder="Say hello"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-objectives">Mục tiêu bài</Label>
            <Textarea id="lesson-objectives" {...register("objectives")} className="min-h-[60px]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-activities">Giáo án / hoạt động</Label>
            <Textarea
              id="lesson-activities"
              {...register("activities")}
              placeholder={"1. Khởi động: hát bài chào (5 phút)\n2. Giới thiệu từ mới bằng flashcard (10 phút)\n3. Trò chơi …"}
              className="min-h-[140px]"
            />
            <p className="text-xs text-muted-foreground">Mỗi dòng một hoạt động; hiện nguyên văn trên màn hình Lên lớp.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-materials">Tài liệu, đồ dùng</Label>
            <Textarea id="lesson-materials" {...register("materials")} placeholder="Flashcard, bóng, phiếu tô màu…" className="min-h-[60px]" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lesson-media">Link media</Label>
              <Input id="lesson-media" type="url" inputMode="url" {...register("mediaUrl")} placeholder="https://…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-homework">Bài tập về nhà</Label>
              <Input id="lesson-homework" {...register("homework")} placeholder="Nghe lại bài hát, tô màu…" />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isSubmitting || !unit}>
              {isSubmitting ? "Đang lưu..." : "Lưu bài học"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
