"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, ExternalLink, Trash2 } from "lucide-react"
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
import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteTeacher } from "../actions"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

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
    hourlyRate?: number | null
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
      // Map generic ACTIVE/INACTIVE to named keys for clarity
      const key = status === "ACTIVE" ? "ACTIVE_USER" : status === "INACTIVE" ? "INACTIVE_USER" : status
      return <BadgeStatus status={key} />
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
    id: "hourlyRate",
    header: "Lương/giờ",
    cell: ({ row }) => {
      const profile = row.original.teacherProfile
      if (!profile || row.original.role.code !== "TEACHER") return <div className="text-muted-foreground">—</div>
      const rate = profile.hourlyRate ?? 0
      return (
        <div className="tabular-nums text-sm">
          {rate > 0 ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(rate) : <span className="text-muted-foreground">Chưa cấu hình</span>}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell user={row.original} />,
  },
]

function ActionsCell({ user }: { user: StaffData }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteTeacher(user.id)
    setIsDeleting(false)
    if (result.success) {
      toast.success("Đã xoá nhân sự")
      setDeleteOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const teacherId = user.teacherProfile?.id

  return (
    <div className="flex items-center justify-end gap-1">
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
          hourlyRate: user.teacherProfile?.hourlyRate ?? 0,
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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa nhân sự
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá nhân sự này?"
        description="Lưu ý: Hành động này không thể hoàn tác. Tài khoản và thông tin nhân sự/giáo viên sẽ bị xóa khỏi hệ thống."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
    </div>
  )
}
