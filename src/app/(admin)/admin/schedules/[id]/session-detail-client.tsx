"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Pencil, Calendar, Clock, User, MapPin, BookOpen, FileText, Users, ListChecks } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { DAY_OF_WEEK_LABELS } from "@/lib/schemas/schedule"
import { EditSessionDialog } from "./components/edit-session-dialog"
import { CancelSessionButton } from "./components/cancel-session-button"
import Link from "next/link"

type Session = {
  id: string
  sessionDate: string | Date
  startTime: string
  endTime: string
  status: string
  topic: string | null
  notes: string | null
  teacherId: string | null
  teacher: { id: string; fullName: string } | null
  roomId: string | null
  room: { id: string; name: string } | null
  class: {
    id: string
    name: string
    maxStudents: number
    course: { id: string; name: string }
    branch: { id: string; name: string } | null
  }
  schedule: { id: string; dayOfWeek: number; startTime: string; endTime: string } | null
  attendances: Array<{
    id: string
    status: string
    note: string | null
    student: { id: string; fullName: string; phone: string | null }
  }>
  _count: { attendances: number }
}

const sessionStatusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  SCHEDULED: { label: "Sắp tới", variant: "default" },
  COMPLETED: { label: "Đã hoàn thành", variant: "secondary" },
  CANCELLED: { label: "Đã huỷ", variant: "destructive" },
  MAKE_UP: { label: "Buổi phụ đạo", variant: "outline" },
}

const attendanceStatusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PRESENT: { label: "Có mặt", variant: "default" },
  ABSENT_WITH_PERMISSION: { label: "Vắng có phép", variant: "outline" },
  ABSENT_WITHOUT_PERMISSION: { label: "Vắng không phép", variant: "destructive" },
  LATE: { label: "Đi muộn", variant: "secondary" },
  MAKE_UP: { label: "Phụ đạo", variant: "outline" },
}

interface SessionDetailClientProps {
  session: Session
  teachers: { id: string; fullName: string }[]
  rooms: { id: string; name: string }[]
}

export default function SessionDetailClient({
  session,
  teachers,
  rooms,
}: SessionDetailClientProps) {
  const [editOpen, setEditOpen] = useState(false)
  const d = new Date(session.sessionDate)
  const statusConfig =
    sessionStatusMap[session.status] || { label: session.status, variant: "outline" as const }

  // Session COMPLETED chỉ cho sửa topic/notes (không cho sửa ngày/giờ)
  const readOnlyDateTime = session.status === "COMPLETED" || session.status === "CANCELLED"

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={statusConfig.variant} className="text-sm">
            {statusConfig.label}
          </Badge>
          {session.schedule && (
            <Badge variant="outline">
              Từ lịch cố định {DAY_OF_WEEK_LABELS[session.schedule.dayOfWeek]}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="w-4 h-4 mr-2" /> Sửa
          </Button>
          <CancelSessionButton sessionId={session.id} sessionStatus={session.status} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Thông tin buổi học */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin buổi học</CardTitle>
            <CardDescription>
              <Link
                href={`/admin/classes/${session.class.id}`}
                className="hover:underline text-primary"
              >
                {session.class.name}
              </Link>
              {" · "}
              {session.class.course.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground min-w-[100px]">Ngày:</span>
              <span className="font-medium">
                {format(d, "EEEE, dd/MM/yyyy", { locale: vi })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground min-w-[100px]">Giờ học:</span>
              <span className="font-medium">
                {session.startTime} - {session.endTime}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground min-w-[100px]">Giáo viên:</span>
              <span className="font-medium">
                {session.teacher?.fullName || (
                  <span className="text-muted-foreground italic">Chưa phân công</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground min-w-[100px]">Phòng:</span>
              <span className="font-medium">
                {session.room?.name || (
                  <span className="text-muted-foreground italic">Chưa phân công</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground min-w-[100px]">Sĩ số lớp:</span>
              <span className="font-medium">Tối đa {session.class.maxStudents} học viên</span>
            </div>
            {session.class.branch && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground min-w-[100px]">Chi nhánh:</span>
                <span className="font-medium">{session.class.branch.name}</span>
              </div>
            )}

            <Separator className="my-3" />

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <BookOpen className="w-4 h-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs mb-1">Chủ đề</p>
                  <p className="font-medium">
                    {session.topic || (
                      <span className="text-muted-foreground italic">Chưa có</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs mb-1">Ghi chú</p>
                  <p className="text-sm whitespace-pre-wrap">
                    {session.notes || (
                      <span className="text-muted-foreground italic">Chưa có</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thống kê điểm danh */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              Điểm danh
            </CardTitle>
            <CardDescription>
              {session._count.attendances} / {session.class.maxStudents} học viên
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {session.status === "SCHEDULED" || session.status === "MAKE_UP" ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Buổi học chưa diễn ra.
                <br />
                Điểm danh sẽ mở sau khi buổi học bắt đầu.
              </div>
            ) : session.status === "CANCELLED" ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Buổi học đã bị huỷ, không có điểm danh.
              </div>
            ) : session.attendances.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Chưa có dữ liệu điểm danh.
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(
                  session.attendances.reduce<Record<string, number>>((acc, a) => {
                    acc[a.status] = (acc[a.status] || 0) + 1
                    return acc
                  }, {})
                ).map(([status, count]) => {
                  const config = attendanceStatusMap[status] || {
                    label: status,
                    variant: "outline" as const,
                  }
                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between text-sm"
                    >
                      <Badge variant={config.variant}>{config.label}</Badge>
                      <span className="font-medium">{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Danh sách học viên đã điểm danh */}
      {session.attendances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách điểm danh</CardTitle>
            <CardDescription>
              {session.attendances.length} học viên đã được điểm danh
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {session.attendances.map((a) => {
                const config = attendanceStatusMap[a.status] || {
                  label: a.status,
                  variant: "outline" as const,
                }
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{a.student.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.student.phone || "—"}
                      </p>
                      {a.note && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Ghi chú: {a.note}
                        </p>
                      )}
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <EditSessionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        session={session}
        teachers={teachers}
        rooms={rooms}
        readOnlyDateTime={readOnlyDateTime}
      />
    </div>
  )
}
