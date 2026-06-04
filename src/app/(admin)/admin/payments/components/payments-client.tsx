"use client"

import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "./columns"
import { PaymentDialog } from "./payment-dialog"

interface PaymentsClientProps {
  payments: any[]
  students: { id: string; fullName: string }[]
}

export function PaymentsClient({ payments, students }: PaymentsClientProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Tài chính (Học phí)</h1>
        <PaymentDialog students={students} />
      </div>

      <DataTable
        columns={getColumns(students)}
        data={payments}
        searchKey="student"
        searchPlaceholder="Tìm kiếm phiếu thu theo tên học viên..."
      />
    </div>
  )
}
