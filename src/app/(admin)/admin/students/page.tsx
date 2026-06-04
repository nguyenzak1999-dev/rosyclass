import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { StudentDialog } from "./components/student-dialog"

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    include: {
      parent: true,
      classStudents: {
        include: {
          class: {
            include: { course: true }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Format data for table
  const formattedStudents = students.map(student => {
    const currentClassStudent = student.classStudents.find(cs => cs.status === 'ACTIVE')
    const currentClass = currentClassStudent?.class

    return {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      status: student.status,
      currentLevel: student.currentLevel,
      parentName: student.parent?.fullName,
      className: currentClass?.name,
      courseName: currentClass?.course?.name,
      joinedAt: student.joinedAt,
      createdAt: student.createdAt,
    }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Học viên</h1>
        <StudentDialog />
      </div>

      <DataTable 
        columns={columns as any} 
        data={formattedStudents} 
        searchKey="fullName" 
        searchPlaceholder="Tìm kiếm học viên theo tên, số điện thoại..." 
      />
    </div>
  )
}
