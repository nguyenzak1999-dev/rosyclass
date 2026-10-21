"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ExternalLink, MoreHorizontal, Paintbrush } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageDialog } from "./page-dialog"
import { HOME_PAGE_SLUG, getPublicPagePath } from "@/lib/page-builder/constants"

export type PageData = {
  id: string
  title: string
  slug: string
  status: string
  seoTitle: string | null
  seoDescription: string | null
  createdAt: Date
}

export const columns: ColumnDef<PageData>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tiêu đề
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2 px-4 font-medium">
        <Link href={`/admin/cms/pages/${row.original.id}/builder`} className="hover:underline">
          {row.getValue("title")}
        </Link>
        {row.original.slug === HOME_PAGE_SLUG ? <Badge variant="secondary">Trang chủ</Badge> : null}
      </div>
    ),
  },
  {
    accessorKey: "slug",
    header: "Đường dẫn",
    cell: ({ row }) => <div className="text-muted-foreground">{getPublicPagePath(row.getValue("slug"))}</div>,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const key = status === "ACTIVE" ? "ACTIVE_USER" : status === "INACTIVE" ? "INACTIVE_USER" : status
      return <BadgeStatus status={key} />
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return <div>{format(new Date(date), "dd/MM/yyyy HH:mm")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const page = row.original

      return (
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" render={<Link href={`/admin/cms/pages/${page.id}/builder`} />}>
            <Paintbrush /> Thiết kế
          </Button>
          <PageDialog
            initialData={page}
            trigger={<Button variant="ghost" size="sm">Sửa</Button>}
          />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(page.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<a href={getPublicPagePath(page.slug)} target="_blank" rel="noopener noreferrer" />}>
                <ExternalLink /> Xem trên web
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
