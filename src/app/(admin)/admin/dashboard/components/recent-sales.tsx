"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export type RecentSaleItem = {
  id: string
  studentName: string
  studentEmail: string | null
  amount: number
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function RecentSales({ data }: { data: RecentSaleItem[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Chưa có giao dịch thanh toán.</p>
  }

  return (
    <div className="space-y-8">
      {data.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{getInitials(sale.studentName) || "HV"}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm leading-none font-medium">{sale.studentName}</p>
            <p className="text-sm text-muted-foreground">{sale.studentEmail || "Chưa có email"}</p>
          </div>
          <div className="ml-auto font-medium">+{sale.amount.toLocaleString("vi-VN")} đ</div>
        </div>
      ))}
    </div>
  )
}
