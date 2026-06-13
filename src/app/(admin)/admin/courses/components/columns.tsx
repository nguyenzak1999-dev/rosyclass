"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Trash2 } from "lucide-react"
import { CourseDialog } from "./course-dialog"
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
import { deleteCourse } from "../actions"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export type CourseData = {
  id: string
  name: string
  slug: string
  level: string
  description: string | null
  targetAudience: string | null
  learningOutcomes: string | null
  totalSessions: number
  sessionDurationMinutes: number
  tuitionFee: number
  salePrice: number | null
  thumbnail: string | null
  isPublished: boolean
  status: string
  createdAt: Date
  updatedAt: Date
}

export const columns: ColumnDef<CourseData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên khóa học
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium px-4">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "tuitionFee",
    header: "Mức phí",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("tuitionFee"))
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount)
      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "totalSessions",
    header: "Số buổi",
  },
  {
    accessorKey: "level",
    header: "Cấp độ",
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      return <BadgeStatus status={row.getValue("status") as string} />
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell course={row.original} />,
  },
]

function ActionsCell({ course }: { course: CourseData }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteCourse(course.id)
    setIsDeleting(false)
    if (result.success) {
      toast.success("Đã xoá khóa học")
      setDeleteOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <CourseDialog 
        course={course} 
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
            onClick={() => navigator.clipboard.writeText(course.id)}
          >
            Sao chép ID khóa học
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
          <DropdownMenuItem>Quản lý lớp học</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa khóa học
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá khóa học này?"
        description="Lưu ý: Hành động này không thể hoàn tác. Khóa học sẽ bị xóa vĩnh viễn khỏi hệ thống."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
    </div>
  )
}
