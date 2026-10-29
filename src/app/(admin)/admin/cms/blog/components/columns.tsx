"use client"

import { ColumnDef } from "@tanstack/react-table"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ArrowUpDown, ExternalLink, Pencil, Trash2 } from "lucide-react"
import { formatVietnam } from "@/lib/curriculum"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteBlogPost } from "../actions"

export type BlogPostData = {
  id: string
  title: string
  slug: string
  status: string
  publishedAt: Date | null
  createdAt: Date
  excerpt: string | null
}

export const columns: ColumnDef<BlogPostData>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Tiêu đề <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const post = row.original
      return (
        <div className="px-4">
          <p className="font-medium line-clamp-1">{post.title}</p>
          {post.excerpt && (
            <p className="text-xs text-muted-foreground line-clamp-1">{post.excerpt}</p>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground font-mono">
        /goc-hoc-tap/{row.getValue("slug")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <BadgeStatus status={row.getValue("status") as string} />,
  },
  {
    accessorKey: "publishedAt",
    header: "Ngày xuất bản",
    cell: ({ row }) => {
      const date = row.getValue("publishedAt") as Date | null
      return <div className="text-sm">{date ? formatVietnam(new Date(date), "dd/MM/yyyy") : "—"}</div>
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return <div className="text-sm">{formatVietnam(new Date(date), "dd/MM/yyyy")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell post={row.original} />,
  },
]

function ActionsCell({ post }: { post: BlogPostData }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteBlogPost(post.id)
    setIsDeleting(false)
    if (result.success) {
      toast.success("Đã xoá bài viết")
      setDeleteOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex items-center justify-end">
      <Button
        variant="ghost"
        size="sm"
        render={<Link href={`/admin/cms/blog/${post.id}/edit`} />}
      >
        <Pencil className="h-4 w-4" />
        Sửa
      </Button>
      <Button
        variant="ghost"
        size="icon"
        render={
          <Link href={`/goc-hoc-tap/${post.slug}`} target="_blank" />
        }
      >
        <ExternalLink className="w-4 h-4" />
      </Button>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá bài viết này?"
        description="Hành động này không thể hoàn tác. Bài viết sẽ bị xoá khỏi hệ thống."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
