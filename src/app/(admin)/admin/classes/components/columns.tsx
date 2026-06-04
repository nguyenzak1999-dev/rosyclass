"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type ClassData = {
  id: string
  name: string
  course: { name: string } | null
  teacher: { fullName: string } | null
  branch: { name: string } | null
  status: string
}

import { ClassDialog } from "./class-dialog"

export const getColumns = (courses: any[]): ColumnDef<ClassData>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên lớp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium px-4">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "course",
    header: "Khóa học",
    cell: ({ row }) => {
      const course = row.original.course
      return <div>{course?.name || "—"}</div>
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
    accessorKey: "branch",
    header: "Chi nhánh",
    cell: ({ row }) => {
      const branch = row.original.branch
      return <div>{branch?.name || "—"}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === 'ACTIVE' ? "default" : "secondary"}>
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const classData = row.original

      return (
        <div className="flex items-center justify-end">
          <ClassDialog 
            initialData={classData as any} 
            courses={courses} 
            trigger={<Button variant="ghost" size="sm">Sửa</Button>} 
          />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(classData.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Lịch học</DropdownMenuItem>
              <DropdownMenuItem>Điểm danh</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
