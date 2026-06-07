"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Testimonial } from "@prisma/client"
import { Trash } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { deleteTestimonial } from "../actions"
import { TestimonialDialog } from "./testimonial-dialog"

export const columns: ColumnDef<Testimonial>[] = [
  {
    accessorKey: "authorName",
    header: "Người gửi",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.authorName}</div>
        <div className="text-xs text-muted-foreground">{row.original.authorTitle || "Không có mô tả"}</div>
      </div>
    ),
  },
  {
    accessorKey: "content",
    header: "Nội dung",
    cell: ({ row }) => <div className="line-clamp-2 max-w-[560px]">{row.original.content}</div>,
  },
  {
    accessorKey: "rating",
    header: "Sao",
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
      const testimonial = row.original
      const handleDelete = async () => {
        if (!confirm("Bạn có chắc muốn xóa cảm nhận này?")) return
        const result = await deleteTestimonial(testimonial.id)
        if (result.success) toast.success("Đã xóa cảm nhận")
        else toast.error(result.error)
      }

      return (
        <div className="flex justify-end gap-2">
          <TestimonialDialog testimonial={testimonial} />
          <Button variant="ghost" size="icon" className="text-destructive" onClick={handleDelete}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
