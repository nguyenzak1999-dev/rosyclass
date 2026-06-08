"use client"

import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "./columns"
import { StudentDialog } from "./student-dialog"
import { ExportExcelButton } from "./export-excel-button"

interface StudentsClientProps {
  formattedStudents: any[]
  parents: any[]
}

export function StudentsClient({ formattedStudents, parents }: StudentsClientProps) {
  const columns = getColumns(parents)

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Quản lý Học viên</h1>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <ExportExcelButton data={formattedStudents} />
          <StudentDialog parents={parents} />
        </div>
      </div>

      <DataTable 
        columns={columns as any} 
        data={formattedStudents} 
        searchKey="fullName" 
        searchPlaceholder="Tìm kiếm học viên theo tên, số điện thoại..." 
      />
    </div>
  )
}
