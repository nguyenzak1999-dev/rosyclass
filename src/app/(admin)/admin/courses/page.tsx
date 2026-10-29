import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { CourseDialog } from "./components/course-dialog"
import { ExportExcelButton } from "./components/export-excel-button"
import { CourseFilters } from "./components/course-filters"
import { Prisma } from "@/generated/prisma/client"
import { courseSchema } from "@/lib/schemas/course"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{
    level?: string
    status?: string
    isPublished?: string
  }>
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const filters = await searchParams
  // Build Prisma where clause
  const where: Prisma.CourseWhereInput = {}
  // Giá trị lạ trên URL làm Prisma ném lỗi enum và sập trang: chỉ lọc khi hợp lệ
  if (filters.level && (courseSchema.shape.level.options as readonly string[]).includes(filters.level)) {
    where.level = filters.level as Prisma.EnumCourseLevelFilter
  }
  if (filters.status && (courseSchema.shape.status.unwrap().options as readonly string[]).includes(filters.status)) {
    where.status = filters.status as Prisma.EnumEntityStatusFilter
  }
  if (filters.isPublished === "true") {
    where.isPublished = true
  } else if (filters.isPublished === "false") {
    where.isPublished = false
  }

  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  // Stats
  const stats = {
    total: courses.length,
    active: courses.filter((c) => c.status === "ACTIVE").length,
    published: courses.filter((c) => c.isPublished).length,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Khóa học</h1>
          <p className="text-sm text-muted-foreground">
            Tổng {stats.total} khóa học · {stats.active} đang mở · {stats.published} đã xuất bản
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportExcelButton data={courses} />
          <CourseDialog />
        </div>
      </div>

      <CourseFilters
        currentLevel={filters.level || ""}
        currentStatus={filters.status || ""}
        currentIsPublished={filters.isPublished || ""}
      />

      <DataTable
        columns={columns}
        data={courses}
        searchKey="name"
        searchPlaceholder="Tìm kiếm khóa học theo tên..."
      />
    </div>
  )
}
