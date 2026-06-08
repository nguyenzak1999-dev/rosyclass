"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { TeacherDialog } from "./teacher-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type StaffData = {
  id: string
  fullName: string
  email: string
  phone: string | null
  status: string
  role: {
    code: string
    name: string
  }
  teacherProfile?: {
    id?: string
    bio?: string | null
    specialties?: string | null
    certificates?: string | null
    avatar?: string | null
    showOnHomepage?: boolean | null
  } | null
  avatar?: string | null
  createdAt: Date
}

export const columns: ColumnDef<StaffData>[] = [
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
    cell: ({ row }) => {
      const user = row.original
      const teacherId = user.teacherProfile?.id
      if (teacherId) {
        return (
          <Link
            href={`/admin/teachers/${teacherId}`}
            className="font-medium px-4 hover:underline text-primary"
          >
            {user.fullName}
          </Link>
        )
      }
      return <div className="font-medium px-4">{user.fullName}</div>
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Số điện thoại",
    cell: ({ row }) => <div>{row.getValue("phone") || "—"}</div>,
  },
  {
    accessorKey: "role",
    header: "Vai trò",
    cell: ({ row }) => {
      const role = row.original.role
      return <Badge variant="outline">{role.name}</Badge>
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === 'ACTIVE' ? "default" : "destructive"}>
          {status === 'ACTIVE' ? "Hoạt động" : "Bị khóa"}
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
      const user = row.original
      const teacherId = user.teacherProfile?.id

      return (
        <div className="flex items-center justify-end">
          {teacherId && (
            <Button variant="ghost" size="sm" render={<Link href={`/admin/teachers/${teacherId}`} />}>
              <ExternalLink className="w-4 h-4 mr-1" /> Hồ sơ
            </Button>
          )}
          <TeacherDialog
            teacher={{
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              phone: user.phone || "",
              status: user.status as any,
              roleCode: user.role.code as any,
              bio: user.teacherProfile?.bio || "",
              specialties: user.teacherProfile?.specialties || "",
              certificates: user.teacherProfile?.certificates || "",
              avatar: user.teacherProfile?.avatar || user.avatar || "",
              showOnHomepage: user.teacherProfile?.showOnHomepage ?? false,
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
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {teacherId && (
                <DropdownMenuItem render={<Link href={`/admin/teachers/${teacherId}`} />}>
                  Xem hồ sơ giáo viên
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>Phân quyền</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
