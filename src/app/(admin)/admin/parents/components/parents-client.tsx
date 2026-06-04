"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { ParentDialog } from "./parent-dialog"

interface ParentsClientProps {
  parents: any[]
  students: any[]
}

export function ParentsClient({ parents, students }: ParentsClientProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Phụ huynh</h1>
        <ParentDialog students={students} />
      </div>

      <DataTable 
        columns={columns(students)} 
        data={parents} 
        searchKey="fullName" 
        searchPlaceholder="Tìm kiếm phụ huynh theo tên..." 
      />
    </div>
  )
}
