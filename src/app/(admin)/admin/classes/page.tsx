import { prisma } from "@/lib/prisma"
import { ClassesClient } from "./components/classes-client"
import { ClassFilters } from "./components/class-filters"
import { Prisma } from "@/generated/prisma/client"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{
    status?: string
    courseId?: string
    branchId?: string
    teacherId?: string
  }>
}

export default async function ClassesPage({ searchParams }: PageProps) {
  const filters = await searchParams
  const where: Prisma.ClassWhereInput = {}
  if (filters.status) {
    where.status = filters.status as Prisma.EnumClassStatusFilter
  }
  if (filters.courseId) {
    where.courseId = filters.courseId
  }
  if (filters.branchId) {
    where.branchId = filters.branchId
  }
  if (filters.teacherId) {
    where.teacherId = filters.teacherId
  }

  const [classes, courses, teachers, teachingAssistants, branches, rooms, students] = await Promise.all([
    prisma.class.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        courseId: true,
        teacherId: true,
        teachingAssistantId: true,
        branchId: true,
        roomId: true,
        maxStudents: true,
        status: true,
        notes: true,
        startDate: true,
        expectedEndDate: true,
        createdAt: true,
        course: { select: { name: true } },
        teacher: { select: { fullName: true } },
        teachingAssistant: { select: { fullName: true } },
        branch: { select: { name: true } },
        room: { select: { name: true } },
        students: {
          select: {
            studentId: true,
            status: true,
          },
        },
        _count: { select: { students: { where: { status: "ACTIVE" } } } },
      },
    }),
    prisma.course.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.teacher.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.user.findMany({
      where: {
        status: "ACTIVE",
        role: { code: { in: ["ADMIN", "SUPER_ADMIN", "TEACHER", "CONSULTANT"] } },
      },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.room.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        capacity: true,
        branchId: true,
        branch: { select: { name: true } },
      },
      orderBy: [{ branch: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.student.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true, phone: true, email: true },
      orderBy: { fullName: "asc" },
    }),
  ])

  return (
    <ClassesClient
      classes={classes}
      courses={courses}
      teachers={teachers}
      teachingAssistants={teachingAssistants}
      branches={branches}
      rooms={rooms}
      students={students}
      filterSlot={
        <ClassFilters
          key="class-filters"
          currentStatus={filters.status || ""}
          currentCourseId={filters.courseId || ""}
          currentBranchId={filters.branchId || ""}
          currentTeacherId={filters.teacherId || ""}
          courses={courses}
          teachers={teachers}
          branches={branches}
        />
      }
    />
  )
}
