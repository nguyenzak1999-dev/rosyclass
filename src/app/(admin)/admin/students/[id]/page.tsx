import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { StudentDetailClient } from "./student-detail-client"
import { findSiblings } from "@/lib/monthly-billing"

export default async function StudentDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [student, availableClasses, noteLogs] = await Promise.all([
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
    }),
    // Ghi chú theo dõi lưu ở ActivityLog (xem addStudentNote)
    prisma.activityLog.findMany({
      where: { entityType: "STUDENT_NOTE", entityId: id },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ])

  if (!student) {
    notFound()
  }

  const notes = noteLogs.map((log) => ({
    id: log.id,
    type: log.action,
    content: log.details || "",
    createdAt: log.createdAt,
    author: log.user?.fullName || "—",
  }))

  // Anh chị em: các bé có phụ huynh cùng SĐT
  const siblings = await findSiblings(student.id, student.parent?.phone)

  return <StudentDetailClient student={student} availableClasses={availableClasses} notes={notes} siblings={siblings} />
}
