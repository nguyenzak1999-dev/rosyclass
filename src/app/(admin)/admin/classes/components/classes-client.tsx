"use client"

import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "./columns"
import { ClassDialog } from "./class-dialog"

interface ClassesClientProps {
  classes: any[]
  courses: { id: string; name: string }[]
}

export function ClassesClient({ classes, courses }: ClassesClientProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Lớp học</h1>
        <ClassDialog courses={courses} />
      </div>

      <DataTable
        columns={getColumns(courses)}
        data={classes}
        searchKey="name"
        searchPlaceholder="Tìm kiếm lớp học theo tên..."
      />
    </div>
  )
}
