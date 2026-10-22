"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { PlacementQuestion } from "@/generated/prisma/client"
import { Trash } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { deletePlacementQuestion } from "../actions"
import { PlacementQuestionDialog } from "./placement-question-dialog"

export const columns: ColumnDef<PlacementQuestion>[] = [
  {
    accessorKey: "question",
    header: "Câu hỏi",
    cell: ({ row }) => (
      <div className="max-w-[620px]">
        <div className="font-medium">{row.original.question}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {row.original.type}
          {row.original.level && ` · ${row.original.level}`}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "level",
    header: "Cấp độ",
    cell: ({ row }) =>
      row.original.level ? (
        <Badge variant="outline">{row.original.level}</Badge>
      ) : (
        <span className="text-muted-foreground text-xs">Chung</span>
      ),
  },
  {
    accessorKey: "correctIndex",
    header: "Đáp án",
    cell: ({ row }) => {
      const idx = row.original.correctIndex
      return (
        <Badge variant="secondary" className="font-mono">
          {String.fromCharCode(65 + idx)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "order",
    header: "Thứ tự",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.order}</span>
    ),
  },
  {
    accessorKey: "isPublished",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant={row.original.isPublished ? "default" : "secondary"}>
        {row.original.isPublished ? "Đang hiện" : "Ẩn"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const question = row.original
      return <RowActions question={question} />
    },
  },
]

function RowActions({ question }: { question: PlacementQuestion }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deletePlacementQuestion(question.id)
    setIsDeleting(false)
    if (result.success) {
      toast.success("Đã xoá câu hỏi")
      setDeleteOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <PlacementQuestionDialog question={question} />
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash className="h-4 w-4" />
      </Button>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá câu hỏi này?"
        description="Hành động này không thể hoàn tác. Câu hỏi sẽ bị xoá khỏi hệ thống."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
    </div>
  )
}
