"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { formatVietnam } from "@/lib/curriculum"
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
  receiptCode?: string | null
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  paymentMethod: string
  status: string
  createdAt: Date
  student: { id: string; fullName: string; phone?: string | null; email?: string | null; code?: string | null }
  class?: { id: string; name: string } | null
  course?: { name: string } | null
  qrPayload?: string | null
  bankName?: string | null
  bankAccountNo?: string | null
  bankAccountName?: string | null
  paymentDate?: Date | string | null
  dueDate?: Date | string | null
  note?: string | null
  lineItems?: any[]
}

import { PaymentDialog } from "./payment-dialog"

export const getColumns = (
  students: { id: string; fullName: string }[],
  onViewReceipt: (payment: PaymentData) => void
): ColumnDef<PaymentData>[] => [
  {
    accessorKey: "id",
    header: "Mã phiếu",
    cell: ({ row }) => {
      const payment = row.original
      const displayCode = payment.receiptCode || `#${payment.id.slice(0, 8)}`
      return (
        <button
          onClick={() => onViewReceipt(payment)}
          className="font-semibold text-xs uppercase px-4 text-primary hover:underline hover:text-primary/80 transition-colors block text-left"
        >
          {displayCode}
        </button>
      )
    },
  },
  {
    id: "student.fullName",
    accessorFn: (row) => row.student?.fullName || "",
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
      return (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{student?.fullName || "—"}</span>
          {student?.code && (
            <span className="text-muted-foreground font-mono text-[11px] mt-0.5">{student.code}</span>
          )}
        </div>
      )
    },
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
      return <BadgeStatus status={row.getValue("paymentMethod") as string} />
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      return <BadgeStatus status={row.getValue("status") as string} />
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return <div>{formatVietnam(new Date(date), "dd/MM/yyyy HH:mm")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original

      return (
        // Dialog render qua portal nhưng sự kiện React vẫn nổi lên hàng: chặn để click trong form sửa không mở biên lai
        <div className="flex items-center justify-end" onClick={(event) => event.stopPropagation()}>
          <PaymentDialog 
            initialData={payment}
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
              <DropdownMenuItem onClick={() => onViewReceipt(payment)}>
                Xem & In biên lai
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={`/admin/payments/${payment.id}`} />}>
                Ghi nhận thanh toán / Hoàn tiền
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
