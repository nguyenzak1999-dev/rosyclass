"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, CalendarCheck, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { DAY_OF_WEEK_LABELS } from "@/lib/schemas/schedule"

export type AttendanceSessionData = {
  id: string
  sessionDate: string | Date
  startTime: string
  endTime: string
  class: { name: string; course: { name: string } }
  teacher: { fullName: string }
  status: string
  totalAttendances: number
}

const sessionStatusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  SCHEDULED: { label: "Sắp tới", variant: "default" },
  COMPLETED: { label: "Đã điểm danh", variant: "secondary" },
  CANCELLED: { label: "Đã huỷ", variant: "destructive" },
  MAKE_UP: { label: "Phụ đạo", variant: "outline" },
}

export const columns: ColumnDef<AttendanceSessionData>[] = [
  {
    accessorKey: "sessionDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ngày
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const d = new Date(row.original.sessionDate)
      return (
        <div className="px-4 font-medium">
          {format(d, "dd/MM/yyyy")}
          <div className="text-xs text-muted-foreground">
            {DAY_OF_WEEK_LABELS[d.getDay()]} · {row.original.startTime} - {row.original.endTime}
          </div>
        </div>
      )
    },
  },
  {
    id: "class.name",
    accessorFn: (row) => row.class.name,
    header: "Lớp / Khóa",
    cell: ({ row }) => {
      const cls = row.original.class
      return (
        <div>
          <Link
            href={`/admin/classes/${(row.original as any).classId || "#"}`}
            className="font-medium hover:underline text-primary"
          >
            {cls.name}
          </Link>
          <div className="text-xs text-muted-foreground">{cls.course.name}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "teacher",
    header: "Giáo viên",
    cell: ({ row }) => {
      const teacher = row.original.teacher
      return <div>{teacher?.fullName || "—"}</div>
    },
  },
  {
    accessorKey: "totalAttendances",
    header: "Đã điểm danh",
    cell: ({ row }) => {
      const total = row.getValue("totalAttendances") as number
      return (
        <Badge variant={total > 0 ? "default" : "outline"}>
          {total > 0 ? `${total} HV` : "Chưa có"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const config = sessionStatusMap[status] || { label: status, variant: "outline" }
      return <Badge variant={config.variant}>{config.label}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const session = row.original
      const total = row.original.totalAttendances
      const isCompleted = total > 0
      return (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" render={<Link href={`/admin/schedules/${session.id}`} />}>
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button size="sm" render={<Link href={`/admin/attendance/${session.id}`} />}>
            <CalendarCheck className="w-4 h-4 mr-1" />
            {isCompleted ? "Sửa" : "Điểm danh"}
          </Button>
        </div>
      )
    },
  },
]
