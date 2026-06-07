"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { PlacementQuestion } from "@prisma/client"
import { Trash } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { deletePlacementQuestion } from "../actions"
import { PlacementQuestionDialog } from "./placement-question-dialog"

export const columns: ColumnDef<PlacementQuestion>[] = [
  {
    accessorKey: "question",
    header: "Câu hỏi",
    cell: ({ row }) => (
      <div className="max-w-[620px]">
        <div className="font-medium">{row.original.question}</div>
        <div className="text-xs text-muted-foreground">{row.original.type}</div>
      </div>
    ),
  },
  {
    accessorKey: "level",
    header: "Cấp độ",
    cell: ({ row }) => row.original.level || "Chung",
  },
  {
    accessorKey: "correctIndex",
    header: "Đáp án",
    cell: ({ row }) => String.fromCharCode(65 + row.original.correctIndex),
  },
  {
    accessorKey: "order",
    header: "Thứ tự",
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
      const handleDelete = async () => {
        if (!confirm("Bạn có chắc muốn xóa câu hỏi này?")) return
        const result = await deletePlacementQuestion(question.id)
        if (result.success) toast.success("Đã xóa câu hỏi")
        else toast.error(result.error)
      }

      return (
        <div className="flex justify-end gap-2">
          <PlacementQuestionDialog question={question} />
          <Button variant="ghost" size="icon" className="text-destructive" onClick={handleDelete}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
