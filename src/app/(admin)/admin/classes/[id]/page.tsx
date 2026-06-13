import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ClassDetailClient from "./class-detail-client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const classData = await prisma.class.findUnique({
    where: { id },
    include: {
      course: true,
      teacher: true,
      branch: true,
      room: true,
      students: {
        include: {
          student: true
        }
      },
      schedules: {
        include: { teacher: true, room: true },
        orderBy: { dayOfWeek: "asc" }
      },
      sessions: {
        include: { teacher: true, room: true, _count: { select: { attendances: true } } },
        orderBy: { sessionDate: "asc" }
      },
      classNotes: { orderBy: { createdAt: "desc" }, take: 5 }
    }
  })

  if (!classData) {
    return notFound()
  }

  // Lấy tất cả học viên đang ACTIVE để có thể add vào lớp
  const allStudents = await prisma.student.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, fullName: true, phone: true, email: true }
  })

  // Lookup data cho schedule & session dialogs
  const [teachers, rooms, scores] = await Promise.all([
    prisma.teacher.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" }
    }),
    prisma.room.findMany({
      where: { isActive: true },
      select: { id: true, name: true, capacity: true },
      orderBy: { name: "asc" }
    }),
    prisma.score.findMany({
      where: { classId: id },
      orderBy: { date: "desc" },
      include: {
        student: { select: { id: true, fullName: true } },
        session: { select: { id: true, sessionDate: true, topic: true } }
      }
    })
  ])

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/classes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Lớp học: {classData.name}</h2>
          <p className="text-muted-foreground text-sm">
            Khóa học: {classData.course.name} | Trạng thái: {classData.status}
          </p>
        </div>
      </div>

      <ClassDetailClient
        classData={classData as any}
        allStudents={allStudents}
        teachers={teachers}
        rooms={rooms}
        scores={JSON.parse(JSON.stringify(scores))}
      />
    </div>
  )
}
