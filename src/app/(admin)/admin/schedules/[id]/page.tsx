import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import SessionDetailClient from "./session-detail-client"
import { lessonLabel, formatVietnamDate } from "@/lib/curriculum"

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await prisma.classSession.findUnique({
    where: { id },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          course: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
          maxStudents: true,
          curriculumId: true,
        },
      },
      lesson: {
        select: {
          id: true,
          order: true,
          title: true,
          objectives: true,
          unit: { select: { order: true, title: true } },
        },
      },
      schedule: true,
      teacher: true,
      room: true,
      attendances: {
        include: {
          student: { select: { id: true, fullName: true, phone: true } },
        },
        orderBy: { student: { fullName: "asc" } },
      },
      _count: { select: { attendances: true } },
    },
  })

  if (!session) {
    return notFound()
  }

  // Lấy giáo viên + phòng + bài của chương trình lớp cho edit dialog
  const [teachers, rooms, curriculumLessons] = await Promise.all([
    prisma.teacher.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.room.findMany({
      where: { isActive: true },
      select: { id: true, name: true, capacity: true },
      orderBy: { name: "asc" },
    }),
    session.class.curriculumId
      ? prisma.lesson.findMany({
          where: { unit: { curriculumId: session.class.curriculumId } },
          orderBy: [{ unit: { order: "asc" } }, { order: "asc" }],
          select: { id: true, order: true, title: true, unit: { select: { order: true } } },
        })
      : Promise.resolve([]),
  ])
  const lessons = curriculumLessons.map((lesson) => ({ id: lesson.id, label: lessonLabel(lesson) }))
  // Bài đang gắn có thể thuộc chương trình cũ của lớp: vẫn đưa vào danh sách để hiện đúng tên
  if (session.lesson && !lessons.some((lesson) => lesson.id === session.lesson?.id)) {
    lessons.unshift({ id: session.lesson.id, label: lessonLabel(session.lesson) })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/schedules">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Buổi học</h2>
          <p className="text-muted-foreground text-sm">
            <Link
              href={`/admin/classes/${session.class.id}`}
              className="hover:underline"
            >
              {session.class.name}
            </Link>
            {" · "}
            {formatVietnamDate(session.sessionDate)}
            {" · "}
            {session.startTime} - {session.endTime}
          </p>
        </div>
      </div>

      <SessionDetailClient
        session={JSON.parse(JSON.stringify(session))}
        teachers={teachers}
        rooms={rooms}
        lessons={lessons}
      />
    </div>
  )
}
