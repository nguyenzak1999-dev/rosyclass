import { prisma } from "@/lib/prisma"
import ArrangeClient from "./arrange-client"

export const dynamic = "force-dynamic"

export default async function ArrangePage() {
  // Lấy HV đang chờ xếp lớp (WAITING_CLASS) + HV ACTIVE chưa có lớp nào + tất cả lớp
  const [waitingStudents, allActiveStudents, allClasses] = await Promise.all([
    prisma.student.findMany({
      where: { status: "WAITING_CLASS" },
      include: {
        parent: { select: { id: true, fullName: true, phone: true } },
        placementTests: {
          orderBy: { testDate: "desc" },
          take: 1,
          select: {
            id: true,
            levelResult: true,
            totalScore: true,
            suggestedCourse: { select: { id: true, name: true, level: true } },
            suggestedClass: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.student.findMany({
      where: {
        status: { in: ["ACTIVE", "WAITING_CLASS"] }
      },
      include: {
        parent: { select: { id: true, fullName: true, phone: true } },
        classStudents: {
          where: { status: "ACTIVE" },
          select: {
            class: {
              select: {
                id: true,
                name: true,
                course: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { fullName: "asc" }
    }),
    prisma.class.findMany({
      select: {
        id: true,
        name: true,
        courseId: true,
        status: true,
        maxStudents: true,
        course: { select: { name: true } },
        _count: { select: { students: { where: { status: "ACTIVE" } } } }
      },
      orderBy: { name: "asc" }
    })
  ])

  // Format
  const waiting = waitingStudents.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    phone: s.phone,
    currentLevel: s.currentLevel,
    learningGoal: s.learningGoal,
    age: s.dateOfBirth
      ? Math.floor((Date.now() - new Date(s.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))
      : null,
    parent: s.parent,
    placementTest: s.placementTests[0] || null
  }))

  const allStudents = allActiveStudents.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    phone: s.phone,
    currentLevel: s.currentLevel,
    status: s.status,
    currentClasses: s.classStudents.map((cs) => ({
      id: cs.class.id,
      name: cs.class.name,
      courseName: cs.class.course.name
    }))
  }))

  const allClassesFormatted = allClasses.map((c) => ({
    id: c.id,
    name: c.name,
    courseId: c.courseId,
    courseName: c.course.name,
    status: c.status,
    maxStudents: c.maxStudents,
    currentStudents: c._count.students
  }))

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Xếp lớp</h1>
        <p className="text-muted-foreground text-sm">
          Chọn học viên đang chờ xếp lớp hoặc học viên hiện tại để gợi ý lớp phù hợp, hoặc chuyển lớp.
        </p>
      </div>
      <ArrangeClient
        waitingStudents={JSON.parse(JSON.stringify(waiting))}
        allStudents={JSON.parse(JSON.stringify(allStudents))}
        allClasses={allClassesFormatted}
      />
    </div>
  )
}
