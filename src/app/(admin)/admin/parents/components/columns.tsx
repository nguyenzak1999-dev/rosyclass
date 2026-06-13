"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, MoreHorizontal, ExternalLink, Phone, Copy, Trash2 } from "lucide-react"
import Link from "next/link"
import { ParentDialog } from "./parent-dialog"
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
import { deleteParent } from "../actions"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export type ParentData = {
  id: string
  fullName: string
  phone: string
  email: string | null
  relationship: string | null
  address?: string | null
  students?: { id: string; fullName: string }[]
}

export const columns = (students: any[]): ColumnDef<ParentData>[] => [
  {
    accessorKey: "fullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên phụ huynh
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const parent = row.original
      return (
        <Link
          href={`/admin/parents/${parent.id}`}
          className="font-medium px-4 hover:underline text-primary"
        >
          {parent.fullName}
        </Link>
      )
    },
  },
  {
    accessorKey: "relationship",
    header: "Mối quan hệ",
    cell: ({ row }) => {
      const rel = row.getValue("relationship") as string | null
      return rel ? <Badge variant="outline">{rel}</Badge> : <span className="text-muted-foreground">—</span>
    },
  },
  {
    accessorKey: "phone",
    header: "Số điện thoại",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string
      return (
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-1 font-medium hover:underline"
        >
          <Phone className="w-3 h-3" /> {phone}
        </a>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="text-sm">{row.getValue("email") || "—"}</div>,
  },
  {
    id: "children",
    header: "Số con",
    cell: ({ row }) => {
      const children = row.original.students
      return (
        <Badge variant={children && children.length > 0 ? "default" : "outline"}>
          {children?.length || 0}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell parent={row.original} students={students} />,
  },
]

function ActionsCell({ parent, students }: { parent: ParentData; students: any[] }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteParent(parent.id)
    setIsDeleting(false)
    if (result.success) {
      toast.success("Đã xoá phụ huynh")
      setDeleteOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" render={<Link href={`/admin/parents/${parent.id}`} />}>
        <ExternalLink className="w-4 h-4 mr-1" /> Chi tiết
      </Button>
      <ParentDialog
        initialData={parent as any}
        students={students}
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
            onClick={() => navigator.clipboard.writeText(parent.id)}
          >
            <Copy className="w-4 h-4 mr-2" /> Sao chép ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href={`/admin/parents/${parent.id}`} />}>
            Xem hồ sơ
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa phụ huynh
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá phụ huynh này?"
        description="Lưu ý: Hành động này không thể hoàn tác. Tài khoản phụ huynh và các mối liên kết với học viên sẽ bị xóa khỏi hệ thống."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
    </div>
  )
}
