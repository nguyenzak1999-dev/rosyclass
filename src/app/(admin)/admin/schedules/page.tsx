import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus, CalendarDays } from "lucide-react"
import { ScheduleFilters } from "./components/schedule-filters"
import Link from "next/link"
import { Prisma } from "@prisma/client"
import { addDays, startOfMonth, endOfMonth, subMonths, startOfDay } from "date-fns"
import { SchedulesClient } from "./components/schedules-client"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{
    month?: string // YYYY-MM
    status?: string // SCHEDULED | COMPLETED | CANCELLED | MAKE_UP
    branchId?: string
    classId?: string
    teacherId?: string
  }>
}

export default async function SchedulesPage({ searchParams }: PageProps) {
  const filters = await searchParams
  // Xác định range ngày từ month filter (mặc định: tháng hiện tại + 1 tháng tới)
  const now = new Date()
  const monthStr = filters.month || formatMonth(now)
  const [year, month] = monthStr.split("-").map(Number)
  const monthStart = startOfMonth(new Date(year, month - 1, 1))
  const monthEnd = endOfMonth(new Date(year, month - 1, 1))

  // Hiển thị từ tháng trước đến cuối tháng sau (để thấy cả buổi quá khứ + tương lai)
  const rangeFrom = startOfDay(subMonths(monthStart, 1))
  const rangeTo = endOfMonth(addDays(monthEnd, 30))

  // Build Prisma where clause
  const where: Prisma.ClassSessionWhereInput = {
    sessionDate: { gte: rangeFrom, lte: rangeTo },
  }
  if (filters.status) {
    where.status = filters.status as Prisma.EnumSessionStatusFilter
  }
  if (filters.classId) {
    where.classId = filters.classId
  }
  if (filters.teacherId) {
    where.teacherId = filters.teacherId
  }
  if (filters.branchId) {
    where.class = { branchId: filters.branchId }
  }

  const [schedules, classes, teachers, branches] = await Promise.all([
    prisma.classSession.findMany({
      where,
      orderBy: { sessionDate: "asc" },
      include: {
        class: {
          include: {
            teacher: true,
            branch: true,
            course: { select: { id: true, name: true } },
          },
        },
        teacher: true,
        room: true,
        _count: { select: { attendances: true } },
      },
    }),
    prisma.class.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.teacher.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  // Thống kê nhanh
  const stats = {
    total: schedules.length,
    scheduled: schedules.filter((s) => s.status === "SCHEDULED").length,
    completed: schedules.filter((s) => s.status === "COMPLETED").length,
    cancelled: schedules.filter((s) => s.status === "CANCELLED").length,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thời khóa biểu</h1>
          <p className="text-sm text-muted-foreground">
            Tháng {monthStr} · Tổng {stats.total} buổi ({stats.scheduled} sắp tới / {stats.completed} hoàn thành / {stats.cancelled} huỷ)
          </p>
        </div>
        <Button render={<Link href="/admin/classes" />}>
          <Plus className="w-4 h-4 mr-2" /> Tạo lịch từ lớp học
        </Button>
      </div>

      <ScheduleFilters
        currentMonth={monthStr}
        currentStatus={filters.status || ""}
        currentBranchId={filters.branchId || ""}
        currentClassId={filters.classId || ""}
        currentTeacherId={filters.teacherId || ""}
        classes={classes}
        teachers={teachers}
        branches={branches}
      />

      {schedules.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground gap-2">
          <CalendarDays className="w-8 h-8 opacity-50" />
          <p>Không có buổi học nào trong khoảng thời gian này.</p>
          <p className="text-xs">Thử đổi tháng hoặc bỏ bộ lọc.</p>
        </div>
      ) : (
        <SchedulesClient schedules={JSON.parse(JSON.stringify(schedules))} />
      )}
    </div>
  )
}

function formatMonth(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}
