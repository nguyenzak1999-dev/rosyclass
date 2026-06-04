"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type PaymentData = {
  id: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  paymentMethod: string
  status: string
  createdAt: Date
  student: { fullName: string }
}

import { PaymentDialog } from "./payment-dialog"

export const getColumns = (students: any[]): ColumnDef<PaymentData>[] => [
  {
    accessorKey: "id",
    header: "Mã phiếu",
    cell: ({ row }) => {
      const id = row.getValue("id") as string
      return <div className="font-medium text-xs uppercase px-4">{id.split('-')[0]}</div>
    },
  },
  {
    accessorKey: "student",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Học viên
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const student = row.original.student
      return <div>{student?.fullName || "—"}</div>
    },
    filterFn: (row, id, value) => {
      return row.original.student?.fullName.toLowerCase().includes(value.toLowerCase())
    }
  },
  {
    accessorKey: "totalAmount",
    header: "Tổng tiền",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"))
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount)
      return <div className="font-semibold text-primary">{formatted}</div>
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Phương thức",
    cell: ({ row }) => {
      return <Badge variant="outline">{row.getValue("paymentMethod")}</Badge>
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === 'PAID' ? 'default' : 'destructive'}>
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
      return <div>{format(new Date(date), "dd/MM/yyyy HH:mm")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original

      return (
        <div className="flex items-center justify-end">
          <PaymentDialog 
            initialData={payment as any} 
            students={students} 
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
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>In biên lai</DropdownMenuItem>
              <DropdownMenuItem>Cập nhật trạng thái</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
