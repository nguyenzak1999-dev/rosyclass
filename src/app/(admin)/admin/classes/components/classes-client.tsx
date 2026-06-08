"use client"

import * as React from "react"
import { DataTable } from "@/components/ui/data-table"
import { type ClassData, getColumns } from "./columns"
import { LazyClassDialog } from "./class-dialog-lazy"
import { ExportExcelButton } from "./export-excel-button"

interface ClassesClientProps {
  classes: ClassData[]
  courses: { id: string; name: string }[]
  filterSlot?: React.ReactNode
}

export function ClassesClient({
  classes,
  courses,
  filterSlot,
}: ClassesClientProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Lớp học</h1>
          <p className="text-sm text-muted-foreground">
            Tổng {classes.length} lớp học
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportExcelButton data={classes} />
          <LazyClassDialog courses={courses} />
        </div>
      </div>

      {filterSlot}

      <DataTable
        columns={getColumns(courses)}
        data={classes}
        searchKey="name"
        searchPlaceholder="Tìm kiếm lớp học theo tên..."
      />
    </div>
  )
}
