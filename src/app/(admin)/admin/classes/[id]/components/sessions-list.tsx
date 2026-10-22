"use client"

import { useMemo, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarOff, ExternalLink, Presentation } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { DAY_OF_WEEK_LABELS } from "@/lib/schemas/schedule"
import { lessonLabel } from "@/lib/curriculum"

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

const sessionStatusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  SCHEDULED: { label: "Sắp tới", variant: "default" },
  COMPLETED: { label: "Hoàn thành", variant: "secondary" },
  CANCELLED: { label: "Đã huỷ", variant: "destructive" },
  MAKE_UP: { label: "Buổi phụ đạo", variant: "outline" },
}

interface SessionsListProps {
  sessions: Session[]
  onCancel: (sessionId: string) => void
}

export function SessionsList({ sessions, onCancel }: SessionsListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return sessions
    return sessions.filter((s) => s.status === statusFilter)
  }, [sessions, statusFilter])

  const columns = [
    {
      accessorKey: "sessionDate",
      header: "Ngày",
      cell: ({ row }: any) => {
        const d = new Date(row.original.sessionDate)
        return (
          <div className="px-4">
            <p className="font-medium">{format(d, "dd/MM/yyyy")}</p>
            <p className="text-xs text-muted-foreground">
              {DAY_OF_WEEK_LABELS[d.getDay()]}
            </p>
          </div>
        )
      },
    },
    {
      id: "time",
      header: "Giờ học",
      cell: ({ row }: any) => {
        const s = row.original
        return (
          <span>
            {s.startTime} - {s.endTime}
          </span>
        )
      },
    },
    {
      id: "topic",
      header: "Bài học / chủ đề",
      cell: ({ row }: any) => {
        const s = row.original as Session
        return (
          <div className="max-w-[280px] text-sm">
            {s.lesson ? (
              <p className="font-medium">{lessonLabel(s.lesson)}</p>
            ) : null}
            {s.topic ? (
              <p className={s.lesson ? "text-xs text-muted-foreground" : undefined}>{s.topic}</p>
            ) : s.lesson ? null : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        )
      },
    },
    {
      id: "teacher",
      header: "Giáo viên",
      cell: ({ row }: any) => (
        <span className="text-sm">{row.original.teacher?.fullName || "—"}</span>
      ),
    },
    {
      id: "room",
      header: "Phòng",
      cell: ({ row }: any) => (
        <span className="text-sm">{row.original.room?.name || "—"}</span>
      ),
    },
    {
      id: "attendance",
      header: "Điểm danh",
      cell: ({ row }: any) => {
        const count = row.original._count?.attendances ?? 0
        return (
          <Badge variant={count > 0 ? "default" : "outline"}>
            {count > 0 ? `${count} HV` : "Chưa có"}
          </Badge>
        )
      },
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: ({ row }: any) => {
        const s = row.original.status
        const config = sessionStatusMap[s] || { label: s, variant: "outline" }
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const s = row.original
        const isCancellable = s.status === "SCHEDULED" || s.status === "MAKE_UP"
        return (
          <div className="flex items-center justify-end gap-1">
            {s.status !== "CANCELLED" && (
              <Button variant="outline" size="sm" render={<Link href={`/admin/teach/${s.id}`} />} title="Lên lớp">
                <Presentation className="w-4 h-4" /> Lên lớp
              </Button>
            )}
            <Button variant="ghost" size="sm" render={<Link href={`/admin/schedules/${s.id}`} />}>
              <ExternalLink className="w-4 h-4" />
            </Button>
            {isCancellable && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onCancel(s.id)}
                title="Huỷ buổi học"
              >
                <CalendarOff className="w-4 h-4" />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  if (sessions.length === 0) {
    return (
      <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground gap-2">
        <p>Chưa có buổi học nào được sinh.</p>
        <p className="text-xs">
          Nhấn &quot;Sinh buổi học&quot; ở phía trên sau khi đã thêm lịch cố định.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Lọc theo trạng thái:</span>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as string)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả ({sessions.length})</SelectItem>
            <SelectItem value="SCHEDULED">
              Sắp tới ({sessions.filter((s) => s.status === "SCHEDULED").length})
            </SelectItem>
            <SelectItem value="COMPLETED">
              Hoàn thành ({sessions.filter((s) => s.status === "COMPLETED").length})
            </SelectItem>
            <SelectItem value="CANCELLED">
              Đã huỷ ({sessions.filter((s) => s.status === "CANCELLED").length})
            </SelectItem>
            <SelectItem value="MAKE_UP">
              Phụ đạo ({sessions.filter((s) => s.status === "MAKE_UP").length})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns as any}
        data={filtered}
        searchKey="topic"
        searchPlaceholder="Tìm theo chủ đề..."
      />
    </div>
  )
}
