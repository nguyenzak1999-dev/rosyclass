"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Faq } from "@prisma/client"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { deleteFaq } from "../actions"
import { FaqDialog } from "./faq-dialog"

export const columns: ColumnDef<Faq>[] = [
  {
    accessorKey: "question",
    header: "Câu hỏi",
    cell: ({ row }) => (
      <div className="max-w-[520px]">
        <div className="font-medium">{row.original.question}</div>
        <div className="line-clamp-2 text-xs text-muted-foreground mt-0.5">
          {row.original.answer}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Nhóm",
    cell: ({ row }) =>
      row.original.category ? (
        <Badge variant="outline">{row.original.category}</Badge>
      ) : (
        <span className="text-muted-foreground text-xs">Chung</span>
      ),
  },
  {
    accessorKey: "position",
    header: "Thứ tự",
    cell: ({ row }) => (
      <Badge variant="secondary">#{row.original.position}</Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.status
      const isActive = status === "ACTIVE" || status === "PUBLISHED"
      return (
        <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500" : ""}>
          {isActive ? "Đang hiện" : status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell faq={row.original} />,
  },
]

function ActionsCell({ faq }: { faq: Faq }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteFaq(faq.id)
    setIsDeleting(false)
    if (result.success) {
      toast.success("Đã xoá FAQ")
      setDeleteOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex justify-end gap-1">
      <FaqDialog faq={faq} />
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá FAQ này?"
        description="FAQ sẽ bị xoá khỏi hệ thống và không hiển thị trên website."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
    </div>
  )
}
