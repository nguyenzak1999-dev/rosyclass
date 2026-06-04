import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { Button } from "@/components/ui/button"

export default async function SchedulesPage() {
  const schedules = await prisma.classSession.findMany({
    orderBy: {
      sessionDate: 'asc'
    },
    include: {
      class: {
        include: {
          teacher: true
        }
      },
      room: true
    },
    take: 50 // limit for now
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Thời khóa biểu</h1>
        <Button>+ Xếp lịch</Button>
      </div>

      <DataTable 
        columns={columns} 
        data={schedules} 
      />
    </div>
  )
}
