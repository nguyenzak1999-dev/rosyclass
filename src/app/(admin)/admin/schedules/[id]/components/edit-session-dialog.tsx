"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  updateSessionSchema,
  type UpdateSessionFormValues,
} from "@/lib/schemas/schedule"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateSession } from "@/app/(admin)/admin/classes/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { parseVietnamDateKey, vietnamDateKey } from "@/lib/curriculum"

interface EditSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: {
    id: string
    sessionDate: string | Date
    startTime: string
    endTime: string
    teacherId: string | null
    roomId: string | null
    topic: string | null
    notes: string | null
    lessonId?: string | null
  }
  teachers: { id: string; fullName: string }[]
  rooms: { id: string; name: string }[]
  /** Bài thuộc chương trình của lớp; rỗng thì ẩn ô chọn bài */
  lessons?: { id: string; label: string }[]
  /** Nếu true: chỉ cho sửa topic + notes (session COMPLETED) */
  readOnlyDateTime?: boolean
}

export function EditSessionDialog({
  open,
  onOpenChange,
  session,
  teachers,
  rooms,
  lessons = [],
  readOnlyDateTime = false,
}: EditSessionDialogProps) {
  const router = useRouter()

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } =
    useForm<UpdateSessionFormValues>({
      resolver: zodResolver(updateSessionSchema) as any,
      defaultValues: {
        id: session.id,
        // <input type="date"> cần chuỗi "YYYY-MM-DD" theo giờ VN; schema tự chuyển sang Date khi submit
        sessionDate: vietnamDateKey(session.sessionDate) as unknown as Date,
        startTime: session.startTime,
        endTime: session.endTime,
        teacherId: session.teacherId,
        roomId: session.roomId,
        topic: session.topic,
        notes: session.notes,
        lessonId: session.lessonId ?? null,
      },
    })

  const teacherId = watch("teacherId")
  const roomId = watch("roomId")
  const lessonId = watch("lessonId")
  const selectedLesson = lessons.find((lesson) => lesson.id === lessonId)

  React.useEffect(() => {
    if (open) {
      reset({
        id: session.id,
        sessionDate: vietnamDateKey(session.sessionDate) as unknown as Date,
        startTime: session.startTime,
        endTime: session.endTime,
        teacherId: session.teacherId,
        roomId: session.roomId,
        topic: session.topic,
        notes: session.notes,
        lessonId: session.lessonId ?? null,
      })
    }
  }, [open, session, reset])

  const onSubmit = async (data: UpdateSessionFormValues) => {
    // Schema đọc "YYYY-MM-DD" thành 00:00 UTC → đổi về 00:00 giờ VN như các buổi sinh từ lịch;
    // không đổi ngày thì không gửi để giữ nguyên mốc thời gian đang lưu
    const dateKey = data.sessionDate ? data.sessionDate.toISOString().slice(0, 10) : null
    const sessionDate =
      dateKey && dateKey !== vietnamDateKey(session.sessionDate) ? parseVietnamDateKey(dateKey) ?? undefined : undefined
    const result = await updateSession({ ...data, sessionDate })
    if (result.success) {
      toast.success("Đã cập nhật buổi học")
      if (result.data?.warning) toast.warning(result.data.warning)
      onOpenChange(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sửa buổi học</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionDate">Ngày học</Label>
            <Input
              id="sessionDate"
              type="date"
              {...register("sessionDate")}
              disabled={readOnlyDateTime}
            />
            {errors.sessionDate && (
              <p className="text-sm text-destructive">Ngày học không hợp lệ</p>
            )}
            {readOnlyDateTime && (
              <p className="text-xs text-muted-foreground">
                Buổi học đã hoàn thành, chỉ có thể sửa chủ đề/ghi chú.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Giờ bắt đầu</Label>
              <Input
                id="startTime"
                type="time"
                {...register("startTime")}
                disabled={readOnlyDateTime}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Giờ kết thúc</Label>
              <Input
                id="endTime"
                type="time"
                {...register("endTime")}
                disabled={readOnlyDateTime}
              />
            </div>
          </div>
          {(errors.startTime || errors.endTime) && (
            <p className="text-sm text-destructive">
              {errors.startTime?.message || errors.endTime?.message}
            </p>
          )}

          <div className="space-y-2">
            <Label>Giáo viên</Label>
            <Select
              value={teacherId || "none"}
              onValueChange={(v) => setValue("teacherId", v === "none" ? null : v)}
              disabled={readOnlyDateTime}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn giáo viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Chưa phân công —</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Phòng học</Label>
            <Select
              value={roomId || "none"}
              onValueChange={(v) => setValue("roomId", v === "none" ? null : v)}
              disabled={readOnlyDateTime}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phòng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Chưa phân công —</SelectItem>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {lessons.length > 0 && (
            <div className="space-y-2">
              <Label>Bài học</Label>
              <Select
                value={lessonId || "none"}
                onValueChange={(v) => setValue("lessonId", !v || v === "none" ? null : v)}
              >
                <SelectTrigger className="w-full">
                  <span className="truncate text-left">{selectedLesson?.label || "— Chưa gắn bài —"}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Chưa gắn bài —</SelectItem>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="topic">Chủ đề buổi học</Label>
            <Input
              id="topic"
              {...register("topic")}
              placeholder="Ví dụ: Unit 5 - Reading & Vocabulary"
            />
            {errors.topic && (
              <p className="text-sm text-destructive">{errors.topic.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Ghi chú nội bộ..."
              className="min-h-[80px]"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu lại"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
