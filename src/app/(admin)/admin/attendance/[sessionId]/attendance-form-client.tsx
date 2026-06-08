"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AttendanceRow, type AttendanceStatus } from "./components/attendance-row"
import { QuickActions } from "./components/quick-actions"
import { markAttendance } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Info, CalendarOff } from "lucide-react"
import { format, differenceInDays } from "date-fns"

interface StudentAttendance {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  attendance: { status: AttendanceStatus; note: string | null } | null
}

interface AttendanceFormClientProps {
  sessionId: string
  classId: string
  sessionStatus: string
  students: StudentAttendance[]
  sessionDate: string
}

export default function AttendanceFormClient({
  sessionId,
  classId,
  sessionStatus,
  students,
  sessionDate,
}: AttendanceFormClientProps) {
  const router = useRouter()
  const [attendance, setAttendance] = useState<
    Record<string, { status: AttendanceStatus; note: string | null }>
  >(() => {
    const initial: Record<string, { status: AttendanceStatus; note: string | null }> = {}
    for (const s of students) {
      if (s.attendance) {
        initial[s.id] = { status: s.attendance.status, note: s.attendance.note }
      }
    }
    return initial
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isCancelled = sessionStatus === "CANCELLED"
  const isReadOnly = isCancelled

  // Cảnh báo nếu điểm danh buổi tương lai
  const daysDiff = differenceInDays(new Date(sessionDate), new Date())
  const isFutureSession = daysDiff > 0

  const updateRow = useCallback(
    (studentId: string, data: { status: AttendanceStatus; note: string | null }) => {
      setAttendance((prev) => ({ ...prev, [studentId]: data }))
    },
    []
  )

  const markAllPresent = () => {
    const next: Record<string, { status: AttendanceStatus; note: string | null }> = {}
    for (const s of students) {
      next[s.id] = { status: "PRESENT", note: null }
    }
    setAttendance(next)
    toast.info(`Đã đánh dấu ${students.length} học viên là CÓ MẶT (chưa lưu)`)
  }

  const resetAll = () => {
    setAttendance({})
  }

  const handleSave = async () => {
    const rows = Object.entries(attendance).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      note: data.note,
    }))

    if (rows.length === 0) {
      toast.error("Chưa có học viên nào được đánh dấu")
      return
    }

    setIsSubmitting(true)
    const res = await markAttendance({ sessionId, attendances: rows })
    setIsSubmitting(false)

    if (res.success) {
      toast.success(`Đã lưu điểm danh ${res.data?.count ?? 0} học viên`)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const markedCount = useMemo(() => Object.keys(attendance).length, [attendance])

  return (
    <div className="space-y-4">
      {isCancelled && (
        <Alert variant="destructive">
          <CalendarOff className="h-4 w-4" />
          <AlertTitle>Buổi học đã bị huỷ</AlertTitle>
          <AlertDescription>
            Không thể điểm danh cho buổi học đã huỷ. Vui lòng vào trang chi tiết buổi học để xử lý.
          </AlertDescription>
        </Alert>
      )}

      {!isCancelled && isFutureSession && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Điểm danh sớm</AlertTitle>
          <AlertDescription>
            Buổi học này còn {daysDiff} ngày nữa mới diễn ra ({format(new Date(sessionDate), "dd/MM/yyyy")}).
            Bạn có thể điểm danh trước nếu cần.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Danh sách học viên ({students.length})</CardTitle>
          <CardDescription>
            Nhấn vào nút trạng thái để đánh dấu từng học viên. Có thể thêm ghi chú cho mỗi HV.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {students.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground gap-2">
              <p>Lớp chưa có học viên ACTIVE nào.</p>
              <p className="text-xs">Vào trang lớp học để thêm học viên trước.</p>
            </div>
          ) : (
            students.map((student) => (
              <AttendanceRow
                key={student.id}
                studentId={student.id}
                studentName={student.fullName}
                studentPhone={student.phone}
                initialStatus={student.attendance?.status || null}
                initialNote={student.attendance?.note || null}
                onChange={(data) => updateRow(student.id, data)}
                disabled={isReadOnly}
              />
            ))
          )}
        </CardContent>
      </Card>

      {!isReadOnly && students.length > 0 && (
        <QuickActions
          totalStudents={students.length}
          markedCount={markedCount}
          onMarkAllPresent={markAllPresent}
          onReset={resetAll}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          isDisabled={isCancelled}
        />
      )}
    </div>
  )
}
