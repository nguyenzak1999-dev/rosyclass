"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, ExternalLink, CalendarCheck, Copy } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export type ScheduleData = {
  id: string
  sessionDate: string | Date
  startTime: string
  endTime: string
  topic: string | null
  status: string
  class: {
    id: string
    name: string
    course?: { name: string }
    branch?: { name: string } | null
    teacher?: { fullName: string } | null
  } | null
  teacher: { fullName: string } | null
  room: { name: string } | null
  _count?: { attendances: number }
}

export const columns: ColumnDef<ScheduleData>[] = [
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
      return (
        <div className="font-medium px-4">
          {format(new Date(date), "dd/MM/yyyy")}
        </div>
      )
    },
  },
  {
    id: "time",
    header: "Giờ học",
    cell: ({ row }) => {
      const s = row.original
      return <div>{s.startTime} - {s.endTime}</div>
    },
  },
  {
    accessorKey: "class",
    header: "Lớp / Khóa",
    cell: ({ row }) => {
      const cls = row.original.class
      if (!cls) return <span className="text-muted-foreground">—</span>
      return (
        <div>
          <Link
            href={`/admin/classes/${cls.id}`}
            className="font-medium hover:underline text-primary"
          >
            {cls.name}
          </Link>
          {cls.course && (
            <div className="text-xs text-muted-foreground">{cls.course.name}</div>
          )}
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
    accessorKey: "room",
    header: "Phòng học",
    cell: ({ row }) => {
      const room = row.original.room
      return <div>{room?.name || "—"}</div>
    },
  },
  {
    id: "attendance",
    header: "Điểm danh",
    cell: ({ row }) => {
      const count = row.original._count?.attendances ?? 0
      return (
        <Badge variant={count > 0 ? "default" : "outline"}>
          {count > 0 ? `${count} HV` : "—"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <BadgeStatus status={row.getValue("status") as string} />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const schedule = row.original

      return (
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm" render={<Link href={`/admin/schedules/${schedule.id}`} />}>
            <ExternalLink className="w-4 h-4 mr-1" /> Chi tiết
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuItem render={<Link href={`/admin/schedules/${schedule.id}`} />}>
                Xem chi tiết buổi học
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={`/admin/attendance/${schedule.id}`} />}>
                <CalendarCheck className="w-4 h-4 mr-2" /> Điểm danh
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(schedule.id)}
              >
                <Copy className="w-4 h-4 mr-2" /> Sao chép ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
