import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"

export default async function AttendancePage() {
  // Get recent schedules
  const recentSchedules = await prisma.classSession.findMany({
    where: {
      sessionDate: {
        lte: new Date()
      }
    },
    orderBy: {
      sessionDate: 'desc'
    },
    include: {
      class: true,
      teacher: true,
      attendances: true
    },
    take: 20
  })

  const validSchedules = recentSchedules.map((schedule) => ({
    id: schedule.id,
    sessionDate: schedule.sessionDate,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    class: { name: schedule.class?.name || "—" },
    teacher: { fullName: schedule.teacher?.fullName || "—" },
    totalAttendances: schedule.attendances.length,
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Điểm danh</h1>
      </div>

      <DataTable 
        columns={columns} 
        data={validSchedules} 
      />
    </div>
  )
}
