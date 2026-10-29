"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, ExternalLink, Phone } from "lucide-react"
import { formatVietnam } from "@/lib/curriculum"
import Link from "next/link"
import { LeadDialog } from "./lead-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type LeadData = {
  id: string
  fullName: string
  age: number | null
  phone: string
  email: string | null
  interestedCourse: { name: string } | null
  source: string | null
  status: string
  createdAt: string | Date
  assignedTo: { fullName: string } | null
}

export const columns: ColumnDef<LeadData>[] = [
  {
    accessorKey: "fullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Khách hàng
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const lead = row.original
      return (
        <div className="px-4">
          <Link
            href={`/admin/leads/${lead.id}`}
            className="font-medium hover:underline text-primary"
          >
            {lead.fullName}
          </Link>
          {lead.age && (
            <div className="text-sm text-muted-foreground">{lead.age} tuổi</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Liên hệ",
    cell: ({ row }) => {
      const lead = row.original
      return (
        <div>
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-1 font-medium hover:underline"
          >
            <Phone className="w-3 h-3" /> {lead.phone}
          </a>
          {lead.email && (
            <div className="text-sm text-muted-foreground">{lead.email}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "interestedCourse",
    header: "Khóa quan tâm",
    cell: ({ row }) => {
      const course = row.original.interestedCourse
      return <div className="text-sm">{course?.name || "—"}</div>
    },
  },
  {
    accessorKey: "source",
    header: "Nguồn",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("source") || "—"}</Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      return <BadgeStatus status={row.getValue("status") as string} />
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Tư vấn viên",
    cell: ({ row }) => {
      const assignedTo = row.original.assignedTo
      return <div className="text-sm">{assignedTo?.fullName || "—"}</div>
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date | string
      return <div className="text-sm">{formatVietnam(new Date(date), "dd/MM/yyyy")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const lead = row.original
      return (
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm" render={<Link href={`/admin/leads/${lead.id}`} />}>
            <ExternalLink className="w-4 h-4 mr-1" /> Chi tiết
          </Button>
          <LeadDialog
            lead={lead as any}
            trigger={<Button variant="ghost" size="sm">Sửa</Button>}
          />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuItem render={<Link href={`/admin/leads/${lead.id}`} />}>
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(lead.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href={`/admin/leads/${lead.id}`} />}>
                Thêm ghi chú
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
