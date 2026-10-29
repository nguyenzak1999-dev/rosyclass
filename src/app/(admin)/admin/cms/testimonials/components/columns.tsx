"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Testimonial } from "@/generated/prisma/client"
import { Trash2, Star } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
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
    cell: ({ row }) => (
      <div className="line-clamp-2 max-w-[560px] text-sm italic">
        &ldquo;{row.original.content}&rdquo;
      </div>
    ),
  },
  {
    accessorKey: "rating",
    header: "Đánh giá",
    cell: ({ row }) => {
      const rating = row.original.rating
      return (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
          <span className="ml-1.5 text-xs text-muted-foreground">{rating}/5</span>
        </div>
      )
    },
  },
  {
    accessorKey: "isPublished",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isPublished = row.original.isPublished
      return (
        <Badge variant={isPublished ? "default" : "secondary"} className={isPublished ? "bg-green-500" : ""}>
          {isPublished ? "Đang hiện" : "Ẩn"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell testimonial={row.original} />,
  },
]

function ActionsCell({ testimonial }: { testimonial: Testimonial }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteTestimonial(testimonial.id)
    setIsDeleting(false)
    if (result.success) {
      toast.success("Đã xoá cảm nhận")
      setDeleteOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex justify-end gap-1">
      <TestimonialDialog testimonial={testimonial} />
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
        title="Xoá cảm nhận này?"
        description="Cảm nhận sẽ bị xoá khỏi hệ thống và không hiển thị trên website."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
    </div>
  )
}
