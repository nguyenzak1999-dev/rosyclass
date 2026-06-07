"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Faq } from "@prisma/client"
import { Trash } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { deleteFaq } from "../actions"
import { FaqDialog } from "./faq-dialog"

export const columns: ColumnDef<Faq>[] = [
  {
    accessorKey: "question",
    header: "Câu hỏi",
    cell: ({ row }) => (
      <div className="max-w-[520px]">
        <div className="font-medium">{row.original.question}</div>
        <div className="line-clamp-2 text-xs text-muted-foreground">{row.original.answer}</div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Nhóm",
    cell: ({ row }) => row.original.category || "Chung",
  },
  {
    accessorKey: "position",
    header: "Thứ tự",
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "ACTIVE" || row.original.status === "PUBLISHED" ? "default" : "secondary"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const faq = row.original
      const handleDelete = async () => {
        if (!confirm("Bạn có chắc muốn xóa FAQ này?")) return
        const result = await deleteFaq(faq.id)
        if (result.success) toast.success("Đã xóa FAQ")
        else toast.error(result.error)
      }

      return (
        <div className="flex justify-end gap-2">
          <FaqDialog faq={faq} />
          <Button variant="ghost" size="icon" className="text-destructive" onClick={handleDelete}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
