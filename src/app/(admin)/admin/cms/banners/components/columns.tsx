"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Banner } from "@/generated/prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteBanner } from "../actions"

export const columns: ColumnDef<Banner>[] = [
  {
    accessorKey: "image",
    header: "Hình ảnh",
    cell: ({ row }) => {
      const banner = row.original
      return (
        <div className="w-32 h-16 relative bg-muted rounded-md overflow-hidden flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.image}
            alt={banner.title || "Hero"}
            className="object-cover w-full h-full"
          />
        </div>
      )
    },
  },
  {
    accessorKey: "title",
    header: "Tiêu đề",
    cell: ({ row }) => {
      const banner = row.original
      return (
        <div className="flex flex-col">
          <span className="font-medium">{banner.title || "(Không có tiêu đề)"}</span>
          {banner.subtitle && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {banner.subtitle}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "buttonText",
    header: "Nút CTA",
    cell: ({ row }) => {
      const banner = row.original
      return (
        <div className="text-xs">
          {banner.buttonText ? (
            <>
              <span className="font-medium">{banner.buttonText}</span>
              <br />
              <span className="text-muted-foreground font-mono">{banner.buttonUrl || "—"}</span>
            </>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "position",
    header: "Vị trí",
    cell: ({ row }) => (
      <Badge variant="outline">#{row.original.position}</Badge>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isActive = row.original.isActive
      return (
        <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500" : ""}>
          {isActive ? "Đang hiện" : "Đã ẩn"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const banner = row.original
      return <ActionsCell banner={banner} />
    },
  },
]

function ActionsCell({ banner }: { banner: Banner }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const res = await deleteBanner(banner.id)
    setIsDeleting(false)
    if (res.success) {
      toast.success("Đã xoá banner")
      setDeleteOpen(false)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        title="Sửa"
        render={<Link href={`/admin/cms/banners/${banner.id}/edit`} />}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá banner này?"
        description="Banner sẽ bị xoá khỏi hệ thống và không hiển thị trên website."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
    </div>
  )
}
