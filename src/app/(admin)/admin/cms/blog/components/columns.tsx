"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BlogPostDialog } from "./blog-post-dialog"
import { deleteBlogPost } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export type BlogPostData = {
  id: string
  title: string
  slug: string
  status: string
  publishedAt: Date | null
  createdAt: Date
}

function ActionsCell({ post }: { post: BlogPostData }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return
    const result = await deleteBlogPost(post.id)
    if (result.success) {
      toast.success("Đã xóa bài viết")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex items-center justify-end">
      <BlogPostDialog
        initialData={post}
        trigger={<Button variant="ghost" size="sm">Sửa</Button>}
      />
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
          <span className="sr-only">Mở menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => window.open(`/goc-hoc-tap/${post.slug}`, '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" /> Xem trên web
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
            Xóa bài viết
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const columns: ColumnDef<BlogPostData>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Tiêu đề <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium px-4">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => <div className="text-muted-foreground text-sm">/goc-hoc-tap/{row.getValue("slug")}</div>,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === 'PUBLISHED' ? 'default' : 'secondary'}>
          {status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}
        </Badge>
      )
    },
  },
  {
    accessorKey: "publishedAt",
    header: "Ngày xuất bản",
    cell: ({ row }) => {
      const date = row.getValue("publishedAt") as Date | null
      return <div>{date ? format(new Date(date), "dd/MM/yyyy") : "—"}</div>
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return <div>{format(new Date(date), "dd/MM/yyyy")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell post={row.original} />,
  },
]
