"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { StudentDialog } from "./student-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define the shape of our data
export type StudentData = {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  status: string
  createdAt: Date
}

export const columns: ColumnDef<StudentData>[] = [
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
    cell: ({ row }) => <div className="font-medium px-4">{row.getValue("fullName")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.getValue("email") || "—"}</div>,
  },
  {
    accessorKey: "phone",
    header: "Số điện thoại",
    cell: ({ row }) => <div>{row.getValue("phone") || "—"}</div>,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === 'ACTIVE' ? "default" : "destructive"}>
          {status === 'ACTIVE' ? "Đang học" : "Đã nghỉ"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tham gia",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return <div>{format(new Date(date), "dd/MM/yyyy")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original

      return (
        <div className="flex items-center justify-end">
          <StudentDialog 
            student={{
              id: student.id,
              fullName: student.fullName,
              email: student.email || "",
              phone: student.phone || "",
              status: student.status as any,
            }} 
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
                onClick={() => navigator.clipboard.writeText(student.id)}
              >
                Sao chép ID học viên
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
              <DropdownMenuItem>Lịch sử học phí</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
