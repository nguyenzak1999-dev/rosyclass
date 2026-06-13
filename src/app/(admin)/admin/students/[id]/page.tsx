import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { StudentDetailClient } from "./student-detail-client"

export default async function StudentDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [student, availableClasses] = await Promise.all([
    prisma.student.findUnique({
      where: { id },
      include: {
        parent: true,
        classStudents: {
          include: {
            class: {
              include: {
                course: true,
                teacher: true,
                schedules: true,
                _count: { select: { students: true } },
              }
            }
          }
        },
        attendances: {
          include: {
            session: true
          },
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        },
        placementTests: {
          orderBy: { testDate: 'desc' }
        }
      }
    }),
    prisma.class.findMany({
      where: { status: { in: ['UPCOMING', 'ACTIVE'] } },
      include: {
        course: true,
        schedules: true,
        _count: { select: { students: { where: { status: 'ACTIVE' } } } }
      },
      orderBy: { name: 'asc' }
    })
  ])

  if (!student) {
    notFound()
  }

  return <StudentDetailClient student={student} availableClasses={availableClasses} />
}
