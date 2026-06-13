"use client"

import { ColumnDef } from "@tanstack/react-table"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LazyClassDialog } from "./class-dialog-lazy"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteClass } from "../actions"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

type ClassStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED"

export type ClassData = {
  id: string
  name: string
  courseId: string
  teacherId: string | null
  teachingAssistantId: string | null
  branchId: string | null
  roomId: string | null
  maxStudents: number
  status: ClassStatus
  notes: string | null
  startDate: Date | string | null
  expectedEndDate: Date | string | null
  createdAt: Date | string
  course: { name: string } | null
  teacher: { fullName: string } | null
  teachingAssistant: { fullName: string } | null
  branch: { name: string } | null
  room: { name: string } | null
  students?: { studentId: string; status: string }[]
  _count?: { students: number }
}

export const getColumns = (
  courses: { id: string; name: string }[]
): ColumnDef<ClassData>[] => [
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
      return <BadgeStatus status={row.getValue("status") as string} />
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell classData={row.original} courses={courses} />,
  },
]

function ActionsCell({ classData, courses }: { classData: ClassData; courses: { id: string; name: string }[] }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteClass(classData.id)
    setIsDeleting(false)
    if (result.success) {
      toast.success("Đã xoá lớp học")
      setDeleteOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <LazyClassDialog
        initialData={{
          id: classData.id,
          name: classData.name,
          courseId: classData.courseId,
          maxStudents: classData.maxStudents,
          status: classData.status,
          studentIds: [],
          notes: classData.notes ?? undefined,
        }}
        courses={courses} 
        trigger={<Button variant="ghost" size="sm">Sửa</Button>} 
      />
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
          <span className="sr-only">Mở menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => window.location.href = `/admin/classes/${classData.id}`}>
              Xem chi tiết lớp học
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(classData.id)}
            >
              Sao chép ID
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Lịch học</DropdownMenuItem>
            <DropdownMenuItem>Điểm danh</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa lớp học
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá lớp học này?"
        description="Lưu ý: Hành động này không thể hoàn tác. Lớp học và tất cả thông tin liên quan (điểm danh, lịch học...) sẽ bị xóa khỏi hệ thống."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
    </div>
  )
}
