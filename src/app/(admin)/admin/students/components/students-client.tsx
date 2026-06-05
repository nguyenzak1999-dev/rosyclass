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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Học viên</h1>
        <div className="flex items-center gap-2">
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
