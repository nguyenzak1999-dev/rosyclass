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
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Quản lý Lớp học</h1>
          <p className="text-sm text-muted-foreground">
            Tổng {classes.length} lớp học
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
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
