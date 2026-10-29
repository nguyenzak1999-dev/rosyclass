"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { deleteBranch } from "../actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BranchDialog } from "./branch-dialog"

export type BranchData = {
  id: string
  name: string
  phone: string | null
  address: string | null
  isActive: boolean
}

export const columns: ColumnDef<BranchData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên chi nhánh
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium px-4">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "address",
    header: "Địa chỉ",
  },
  {
    accessorKey: "phone",
    header: "Điện thoại",
  },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return <BadgeStatus status={isActive ? "ACTIVE_USER" : "INACTIVE_USER"} />
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell branch={row.original} />,
  },
]

function ActionsCell({ branch }: { branch: BranchData }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteBranch(branch.id)
    setIsDeleting(false)
    if (result.success) {
      toast.success("Đã xoá chi nhánh")
      setDeleteOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex items-center justify-end">
      <BranchDialog 
        initialData={branch} 
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
            onClick={() => navigator.clipboard.writeText(branch.id)}
          >
            Sao chép ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa chi nhánh
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá chi nhánh này?"
        description="Chỉ xoá được chi nhánh chưa có phòng học hay lớp nào."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
    </div>
  )
}
