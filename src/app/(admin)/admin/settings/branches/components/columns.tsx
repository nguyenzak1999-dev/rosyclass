"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BranchDialog } from "./branch-dialog"

export type BranchData = {
  id: string
  name: string
  phone: string | null
  address: string | null
  isActive: boolean
}

export const columns: ColumnDef<BranchData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên chi nhánh
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium px-4">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "address",
    header: "Địa chỉ",
  },
  {
    accessorKey: "phone",
    header: "Điện thoại",
  },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return <BadgeStatus status={isActive ? "ACTIVE_USER" : "INACTIVE_USER"} />
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const branch = row.original

      return (
        <div className="flex items-center justify-end">
          <BranchDialog 
            initialData={branch as any} 
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
                onClick={() => navigator.clipboard.writeText(branch.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Xem danh sách phòng</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
