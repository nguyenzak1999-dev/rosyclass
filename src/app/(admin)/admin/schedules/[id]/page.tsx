import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import SessionDetailClient from "./session-detail-client"

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

  // Lấy giáo viên + phòng cho edit dialog
  const [teachers, rooms] = await Promise.all([
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
  ])

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
            {new Date(session.sessionDate).toLocaleDateString("vi-VN")}
            {" · "}
            {session.startTime} - {session.endTime}
          </p>
        </div>
      </div>

      <SessionDetailClient
        session={JSON.parse(JSON.stringify(session))}
        teachers={teachers}
        rooms={rooms}
      />
    </div>
  )
}
