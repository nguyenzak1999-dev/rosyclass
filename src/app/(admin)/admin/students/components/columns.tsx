"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { StudentDialog } from "./student-dialog"
import Link from "next/link"
import type { StudentFormValues } from "@/lib/schemas/student"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type StudentData = {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  status: StudentFormValues["status"]
  currentLevel: string | null
  parentName: string | undefined
  className: string | undefined
  courseName: string | undefined
  joinedAt: Date
  createdAt: Date
}

const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Đang học", variant: "default" },
  WAITING_CLASS: { label: "Chờ xếp lớp", variant: "outline" },
  RESERVED: { label: "Bảo lưu", variant: "secondary" },
  PAUSED: { label: "Tạm dừng", variant: "secondary" },
  COMPLETED: { label: "Hoàn thành", variant: "default" },
  DROPPED: { label: "Đã nghỉ", variant: "destructive" },
}

export const getColumns = (parents: any[]): ColumnDef<StudentData>[] => [
  {
    accessorKey: "fullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Họ tên
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium px-4">
        <Link href={`/admin/students/${row.original.id}`} className="hover:underline text-primary">
          {row.getValue("fullName")}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Số điện thoại",
    cell: ({ row }) => <div>{row.getValue("phone") || "—"}</div>,
  },
  {
    accessorKey: "parentName",
    header: "Phụ huynh",
    cell: ({ row }) => <div>{row.getValue("parentName") || "—"}</div>,
  },
  {
    accessorKey: "currentLevel",
    header: "Trình độ",
    cell: ({ row }) => <div>{row.getValue("currentLevel") || "—"}</div>,
  },
  {
    accessorKey: "className",
    header: "Lớp hiện tại",
    cell: ({ row }) => <div>{row.getValue("className") || "—"}</div>,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const config = statusMap[status] || { label: status, variant: "outline" }
      return (
        <Badge variant={config.variant as any}>
          {config.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "joinedAt",
    header: "Ngày nhập học",
    cell: ({ row }) => {
      const date = row.getValue("joinedAt") as Date
      return <div>{date ? format(new Date(date), "dd/MM/yyyy") : "—"}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original
      const dialogStudent: StudentFormValues = {
        id: student.id,
        fullName: student.fullName,
        email: student.email || "",
        phone: student.phone || "",
        status: student.status,
        currentLevel: student.currentLevel || undefined,
      }

      return (
        <div className="flex items-center justify-end">
          <StudentDialog 
            student={dialogStudent}
            parents={parents}
            trigger={<Button variant="ghost" size="sm">Sửa</Button>} 
          />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuItem render={<Link href={`/admin/students/${student.id}`} />}>
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(student.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
