"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
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
  sessionDate: Date
  startTime: string
  endTime: string
  class: { name: string, teacher: { fullName: string } | null } | null
  room: { name: string } | null
  status: string
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
      return <div className="font-medium px-4">{format(new Date(date), "dd/MM/yyyy")}</div>
    },
  },
  {
    id: "time",
    header: "Giờ học",
    cell: ({ row }) => {
      const schedule = row.original
      return <div>{schedule.startTime} - {schedule.endTime}</div>
    },
  },
  {
    accessorKey: "class",
    header: "Lớp",
    cell: ({ row }) => {
      const cls = row.original.class
      return <div>{cls?.name || "—"}</div>
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
    id: "teacher",
    header: "Giáo viên",
    cell: ({ row }) => {
      const teacher = row.original.class?.teacher
      return <div>{teacher?.fullName || "—"}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === 'SCHEDULED' ? 'outline' : status === 'COMPLETED' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const schedule = row.original

      return (
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm">Chi tiết</Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(schedule.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sửa lịch</DropdownMenuItem>
              <DropdownMenuItem>Điểm danh</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
