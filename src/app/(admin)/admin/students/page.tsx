import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { StudentDialog } from "./components/student-dialog"

export default async function StudentsPage() {
  const students = await prisma.user.findMany({
    where: {
      role: {
        code: 'STUDENT'
      }
    },
    include: {
      role: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedStudents = students.map(student => ({
    id: student.id,
    fullName: student.fullName,
    email: student.email,
    phone: student.phone,
    status: student.status,
    createdAt: student.createdAt,
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Học viên</h1>
        <StudentDialog />
      </div>

      <DataTable 
        columns={columns} 
        data={formattedStudents} 
        searchKey="fullName" 
        searchPlaceholder="Tìm kiếm học viên theo tên..." 
      />
    </div>
  )
}
