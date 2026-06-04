import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { TeacherDialog } from "./components/teacher-dialog"

export default async function TeachersPage() {
  const staff = await prisma.user.findMany({
    where: {
      role: {
        code: {
          in: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STAFF']
        }
      }
    },
    include: {
      role: true,
      teacherProfile: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Nhân sự</h1>
        <TeacherDialog />
      </div>

      <DataTable 
        columns={columns} 
        data={staff} 
        searchKey="fullName" 
        searchPlaceholder="Tìm kiếm nhân sự theo tên..." 
      />
    </div>
  )
}
