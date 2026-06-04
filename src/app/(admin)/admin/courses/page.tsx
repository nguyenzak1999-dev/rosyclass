import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { CourseDialog } from "./components/course-dialog"

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Khóa học</h1>
        <CourseDialog />
      </div>

      <DataTable 
        columns={columns} 
        data={courses} 
        searchKey="name" 
        searchPlaceholder="Tìm kiếm khóa học theo tên..." 
      />
    </div>
  )
}
