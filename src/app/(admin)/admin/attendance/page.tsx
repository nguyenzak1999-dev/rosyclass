import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { vietnamMonthStart } from "@/lib/curriculum"

export const dynamic = "force-dynamic"

export default async function AttendancePage() {
  // Lấy sessions trong khoảng 1 tháng trước + 1 tháng sau (tháng hiện tại)
  const now = new Date()
  const rangeStart = vietnamMonthStart(now, -1)
  const rangeEnd = vietnamMonthStart(now, 2)

  const sessions = await prisma.classSession.findMany({
    where: {
      sessionDate: { gte: rangeStart, lt: rangeEnd },
      status: { not: "CANCELLED" },
    },
    orderBy: { sessionDate: "asc" },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          course: { select: { name: true } },
        },
      },
      teacher: { select: { id: true, fullName: true } },
      _count: { select: { attendances: true } },
    },
  })

  // Format data cho DataTable
  const formattedSessions = sessions.map((session) => {
    const classStudentsCount = session._count.attendances
    return {
      id: session.id,
      classId: session.classId,
      sessionDate: session.sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      class: { name: session.class.name, course: session.class.course },
      teacher: { fullName: session.teacher?.fullName || "—" },
      status: session.status,
      totalAttendances: classStudentsCount,
    }
  })

  // Stats
  const stats = {
    total: formattedSessions.length,
    completed: formattedSessions.filter((s) => s.status === "COMPLETED").length,
    scheduled: formattedSessions.filter((s) => s.status === "SCHEDULED").length,
    makeUp: formattedSessions.filter((s) => s.status === "MAKE_UP").length,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Điểm danh</h1>
          <p className="text-sm text-muted-foreground">
            Tổng {stats.total} buổi ({stats.scheduled} sắp tới / {stats.completed} hoàn thành / {stats.makeUp} phụ đạo) trong khoảng ±1 tháng
          </p>
        </div>
      </div>

      {formattedSessions.length === 0 ? (
        <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
          Không có buổi học nào trong khoảng thời gian này.
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={formattedSessions}
          searchKey="class.name"
          searchPlaceholder="Tìm theo tên lớp..."
        />
      )}
    </div>
  )
}
