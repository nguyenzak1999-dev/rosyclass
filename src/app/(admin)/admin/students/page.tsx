import { prisma } from "@/lib/prisma"
import { StudentsClient } from "./components/students-client"

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

  const parents = await prisma.parent.findMany({
    select: { id: true, fullName: true, phone: true },
    orderBy: { fullName: 'asc' }
  })

  // Format data for table
  const formattedStudents = students.map(student => {
    const currentClassStudent = student.classStudents.find(cs => cs.status === 'ACTIVE')
    const currentClass = currentClassStudent?.class

    return {
      id: student.id,
      code: student.code,
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      status: student.status,
      currentLevel: student.currentLevel,
      // Đủ các trường cho form sửa, tránh lưu đè thành trống
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      address: student.address,
      learningGoal: student.learningGoal,
      source: student.source,
      notes: student.notes,
      parentId: student.parentId,
      parentName: student.parent?.fullName,
      className: currentClass?.name,
      courseName: currentClass?.course?.name,
      joinedAt: student.joinedAt,
      createdAt: student.createdAt,
    }
  })

  return <StudentsClient formattedStudents={formattedStudents} parents={parents} />
}
