"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
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
  createdAt: Date
}

const getStatusBadgeVariant = (status: string) => {
  switch(status) {
    case 'NEW': return 'default'
    case 'CONTACTED': return 'secondary'
    case 'TESTING': return 'outline'
    case 'CONVERTED': return 'default' 
    case 'DEAD': return 'destructive'
    default: return 'outline'
  }
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
          <div className="font-medium">{lead.fullName}</div>
          {lead.age && <div className="text-sm text-muted-foreground">{lead.age} tuổi</div>}
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
          <div>{lead.phone}</div>
          {lead.email && <div className="text-sm text-muted-foreground">{lead.email}</div>}
        </div>
      )
    },
  },
  {
    accessorKey: "interestedCourse",
    header: "Khóa quan tâm",
    cell: ({ row }) => {
      const course = row.original.interestedCourse
      return <div>{course?.name || "—"}</div>
    },
  },
  {
    accessorKey: "source",
    header: "Nguồn",
    cell: ({ row }) => <div>{row.getValue("source") || "—"}</div>,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={getStatusBadgeVariant(status)}>
          {status}
        </Badge>
      )
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
    cell: ({ row }) => {
      const lead = row.original

      return (
        <div className="flex items-center justify-end">
          <LeadDialog lead={lead as any} trigger={<Button variant="ghost" size="sm">Sửa</Button>} />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(lead.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Chuyển thành Học viên</DropdownMenuItem>
              <DropdownMenuItem>Thêm ghi chú</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
