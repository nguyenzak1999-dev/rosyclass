"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Plus, Wand2, Trash2, Pencil, CalendarOff, BookOpenCheck } from "lucide-react"
import Link from "next/link"
import { DAY_OF_WEEK_LABELS } from "@/lib/schemas/schedule"
import { ScheduleFormDialog } from "./schedule-form-dialog"
import { GenerateSessionsDialog } from "./generate-sessions-dialog"
import { SessionsList } from "./sessions-list"
import { deleteClassSchedule, cancelSession, assignLessonsToSessions } from "@/app/(admin)/admin/classes/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Schedule = {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  teacherId: string | null
  teacher?: { fullName: string } | null
  roomId: string | null
  room?: { name: string } | null
}

type Session = {
  id: string
  sessionDate: string | Date
  startTime: string
  endTime: string
  status: string
  topic: string | null
  teacherId: string | null
  teacher?: { fullName: string } | null
  roomId: string | null
  room?: { name: string } | null
  lesson?: { id: string; order: number; title: string; unit: { order: number; title: string } } | null
  _count?: { attendances: number }
}

interface ClassScheduleTabProps {
  classId: string
  schedules: Schedule[]
  sessions: Session[]
  teachers: { id: string; fullName: string }[]
  rooms: { id: string; name: string; capacity: number }[]
  curriculum: { id: string; name: string; gradeLabel: string; lessonCount: number } | null
}

export function ClassScheduleTab({
  classId,
  schedules,
  sessions,
  teachers,
  rooms,
  curriculum,
}: ClassScheduleTabProps) {
  const router = useRouter()
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null)
  const [cancellingSessionId, setCancellingSessionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)

  const handleAssignLessons = async () => {
    setIsSubmitting(true)
    const res = await assignLessonsToSessions(classId)
    setIsSubmitting(false)
    if (!res.success || !res.data) {
      toast.error(res.error)
      return
    }
    const { assigned, sessionsWithoutLesson } = res.data
    if (assigned === 0) {
      toast.info(
        sessionsWithoutLesson > 0
          ? "Chương trình đã hết bài, không còn bài để gán."
          : "Không có buổi học nào cần gán bài."
      )
    } else {
      toast.success(`Đã gán bài cho ${assigned} buổi học`)
    }
    if (sessionsWithoutLesson > 0 && assigned > 0) {
      toast.warning(`${sessionsWithoutLesson} buổi còn lại chưa có bài vì chương trình đã hết bài.`)
    }
    setAssignOpen(false)
    router.refresh()
  }

  const sessionsWithLesson = sessions.filter((s) => s.lesson).length

  const handleDeleteSchedule = async () => {
    if (!deletingScheduleId) return
    setIsSubmitting(true)
    const res = await deleteClassSchedule(deletingScheduleId)
    setIsSubmitting(false)
    if (res.success) {
      toast.success("Đã xoá lịch học")
      setDeletingScheduleId(null)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleCancelSessionInline = async () => {
    if (!cancellingSessionId) return
    setIsSubmitting(true)
    const res = await cancelSession({ id: cancellingSessionId })
    setIsSubmitting(false)
    if (res.success) {
      toast.success("Đã huỷ buổi học")
      if (res.data?.warning) toast.warning(res.data.warning)
      setCancellingSessionId(null)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  // Sessions thuộc tương lai/gần đây để hiển thị trong sessions list
  const sortedSessions = [...sessions].sort(
    (a, b) =>
      new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
  )

  return (
    <div className="space-y-4">
      {/* Phần 1: Lịch học cố định (ClassSchedule) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lịch học cố định trong tuần</CardTitle>
            <CardDescription>
              Cấu hình các thứ + giờ học lặp lại hàng tuần cho lớp này.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setGenerateOpen(true)}
              disabled={schedules.length === 0}
            >
              <Wand2 className="w-4 h-4 mr-2" /> Sinh buổi học
            </Button>
            <Button onClick={() => setScheduleDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Thêm lịch
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground gap-2">
              <p>Chưa có lịch học cố định nào.</p>
              <p className="text-xs">
                Thêm lịch học trước, sau đó dùng &quot;Sinh buổi học&quot; để tạo buổi học cụ thể.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {schedules
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                .map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="min-w-[80px] justify-center">
                        {DAY_OF_WEEK_LABELS[schedule.dayOfWeek]}
                      </Badge>
                      <div>
                        <p className="font-medium">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          GV: {schedule.teacher?.fullName || "—"} · Phòng:{" "}
                          {schedule.room?.name || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSchedule(schedule)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingScheduleId(schedule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phần 2: Danh sách buổi học đã sinh (ClassSession) */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Các buổi học đã sinh</CardTitle>
            <CardDescription>
              Tổng: {sessions.length} buổi ({sessions.filter((s) => s.status === "COMPLETED").length} hoàn thành /{" "}
              {sessions.filter((s) => s.status === "SCHEDULED").length} sắp tới /{" "}
              {sessions.filter((s) => s.status === "CANCELLED").length} huỷ)
              {curriculum ? (
                <>
                  {" · "}
                  {sessionsWithLesson} buổi đã gắn bài ·{" "}
                  <Link href={`/admin/curriculums/${curriculum.id}`} className="text-primary hover:underline">
                    {curriculum.name}
                  </Link>{" "}
                  ({curriculum.lessonCount} bài)
                </>
              ) : null}
            </CardDescription>
          </div>
          {curriculum ? (
            <Button
              variant="outline"
              onClick={() => setAssignOpen(true)}
              disabled={sessions.length === 0 || curriculum.lessonCount === 0}
            >
              <BookOpenCheck className="w-4 h-4 mr-2" /> Gán bài cho các buổi học
            </Button>
          ) : (
            <p className="max-w-xs text-xs text-muted-foreground">
              Gắn chương trình học cho lớp (nút Sửa lớp) để tự gán Unit/Bài cho từng buổi.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <SessionsList
            sessions={sortedSessions}
            onCancel={(id) => setCancellingSessionId(id)}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ScheduleFormDialog
        open={scheduleDialogOpen || editingSchedule !== null}
        onOpenChange={(open) => {
          setScheduleDialogOpen(open)
          if (!open) setEditingSchedule(null)
        }}
        classId={classId}
        schedule={editingSchedule}
        teachers={teachers}
        rooms={rooms}
      />
      <GenerateSessionsDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        classId={classId}
        schedulesCount={schedules.length}
      />

      <ConfirmDialog
        open={deletingScheduleId !== null}
        onOpenChange={(open) => !open && setDeletingScheduleId(null)}
        title="Xoá lịch học cố định?"
        description="Các buổi học đã sinh từ lịch này sẽ KHÔNG bị xoá (chỉ bỏ liên kết)."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDeleteSchedule}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        title="Gán bài cho các buổi học?"
        description="Hệ thống lần lượt gán Unit 1 – Bài 1, Bài 2… cho các buổi chưa có bài, tính từ sau buổi cuối cùng đã có bài. Buổi đã huỷ và buổi phụ đạo được bỏ qua; bài đã gán sẵn giữ nguyên."
        confirmText="Gán bài"
        onConfirm={handleAssignLessons}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={cancellingSessionId !== null}
        onOpenChange={(open) => !open && setCancellingSessionId(null)}
        title="Huỷ buổi học?"
        description="Buổi học sẽ chuyển trạng thái CANCELLED. Học viên không thể điểm danh buổi này."
        confirmText="Huỷ buổi học"
        variant="destructive"
        onConfirm={handleCancelSessionInline}
        isSubmitting={isSubmitting}
      />

      {/* Spacer để tránh nút huỷ rỗng */}
      {sessions.length === 0 && schedules.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarOff className="w-4 h-4" />
          Nhấn &quot;Sinh buổi học&quot; để tạo các buổi học cụ thể từ lịch trên.
        </div>
      )}
    </div>
  )
}
