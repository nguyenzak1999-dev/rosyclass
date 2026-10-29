"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { formatVietnam } from "@/lib/curriculum"
import { StudentDialog } from "./student-dialog"
import Link from "next/link"
import type { StudentFormValues } from "@/lib/schemas/student"
import { toStudentFormInput } from "./student-form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { deleteStudent } from "../actions"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Trash2 } from "lucide-react"

export type StudentData = {
  id: string
  code: string | null
  fullName: string
  email: string | null
  phone: string | null
  status: StudentFormValues["status"]
  currentLevel: string | null
  dateOfBirth: Date | null
  gender: string | null
  address: string | null
  learningGoal: string | null
  source: string | null
  notes: string | null
  parentId: string | null
  parentName: string | undefined
  className: string | undefined
  courseName: string | undefined
  joinedAt: Date
  createdAt: Date
}


export const getColumns = (parents: any[]): ColumnDef<StudentData>[] => [
  {
    accessorKey: "code",
    header: "Mã HV",
    cell: ({ row }) => (
      <div className="font-mono text-xs font-semibold text-muted-foreground">
        {row.getValue("code") || "—"}
      </div>
    ),
  },
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
    cell: ({ row }) => (
      <BadgeStatus status={row.getValue("status") as string} />
    ),
  },
  {
    accessorKey: "joinedAt",
    header: "Ngày nhập học",
    cell: ({ row }) => {
      const date = row.getValue("joinedAt") as Date
      return <div>{date ? formatVietnam(new Date(date), "dd/MM/yyyy") : "—"}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell student={row.original} parents={parents} />,
  },
]

function ActionsCell({ student, parents }: { student: StudentData; parents: any[] }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteStudent(student.id)
    setIsDeleting(false)
    if (result.success) {
      toast.success("Đã xoá học viên")
      setDeleteOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const dialogStudent = useMemo(() => toStudentFormInput(student), [student])

  return (
    // Dropdown / dialog render qua portal nhưng sự kiện React vẫn nổi lên TableRow (onRowClick):
    // chặn lại để bấm "Xóa", gõ vào form sửa... không bị chuyển sang trang chi tiết
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa học viên
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá học viên này?"
        description="Lưu ý: Hành động này không thể hoàn tác. Học viên cùng lịch sử lớp học, điểm danh, bài tập liên quan sẽ bị xóa khỏi hệ thống. Học viên đã có phiếu thu học phí thì không xoá được."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
    </div>
  )
}
