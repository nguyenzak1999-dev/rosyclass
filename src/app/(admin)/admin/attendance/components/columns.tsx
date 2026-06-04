"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"

export type AttendanceSessionData = {
  id: string
  sessionDate: Date
  startTime: string
  endTime: string
  class: { name: string } | null
  teacher: { fullName: string } | null
  totalAttendances: number
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
      const date = row.getValue("sessionDate") as Date
      const session = row.original
      return (
        <div className="px-4 font-medium">
          {format(new Date(date), "dd/MM/yyyy")}
          <div className="text-xs text-muted-foreground">{session.startTime} - {session.endTime}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "class",
    header: "Lớp học",
    cell: ({ row }) => {
      const cls = row.original.class
      return <div>{cls?.name || "—"}</div>
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
    header: "Sĩ số điểm danh",
    cell: ({ row }) => {
      const total = row.getValue("totalAttendances") as number
      return <div>{total > 0 ? `${total} học viên` : "—"}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const total = row.original.totalAttendances
      const isCompleted = total > 0
      return (
        <Badge variant={isCompleted ? "default" : "outline"}>
          {isCompleted ? "Đã điểm danh" : "Chưa điểm danh"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const total = row.original.totalAttendances
      const isCompleted = total > 0

      return (
        <div className="flex items-center justify-end">
          <Button variant="outline" size="sm">
            {isCompleted ? "Xem/Sửa" : "Điểm danh ngay"}
          </Button>
        </div>
      )
    },
  },
]
