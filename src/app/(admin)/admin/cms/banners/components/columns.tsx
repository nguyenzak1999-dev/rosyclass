"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Banner } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { BannerDialog } from "./banner-dialog"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { deleteBanner } from "../actions"
import { toast } from "sonner"

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
    }
  },
  {
    accessorKey: "title",
    header: "Tiêu đề",
    cell: ({ row }) => {
      const banner = row.original
      return (
        <div className="flex flex-col">
          <span className="font-medium">{banner.title || "(Không có tiêu đề)"}</span>
          {banner.subtitle && <span className="text-xs text-muted-foreground">{banner.subtitle}</span>}
        </div>
      )
    }
  },
  {
    accessorKey: "position",
    header: "Vị trí",
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
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const banner = row.original

      const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa hero này?")) return
        const res = await deleteBanner(banner.id)
        if (res.success) {
          toast.success("Đã xóa hero")
        } else {
          toast.error(res.error)
        }
      }

      return (
        <div className="flex items-center justify-end gap-2">
          <BannerDialog banner={banner} />
          <Button variant="ghost" size="icon" onClick={handleDelete} title="Xóa" className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      )
    },
  },
]
