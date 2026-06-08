import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import AttendanceFormClient from "./attendance-form-client"

export default async function AttendanceDetailPage({
  params,
}: {
  params: { sessionId: string }
}) {
  const session = await prisma.classSession.findUnique({
    where: { id: params.sessionId },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          course: { select: { name: true } },
        },
      },
      teacher: { select: { id: true, fullName: true } },
      room: { select: { id: true, name: true } },
    },
  })

  if (!session) {
    return notFound()
  }

  // Lấy tất cả HV ACTIVE trong lớp + attendance hiện tại (nếu có)
  const [classStudents, existingAttendances] = await Promise.all([
    prisma.classStudent.findMany({
      where: { classId: session.classId, status: "ACTIVE" },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: { student: { fullName: "asc" } },
    }),
    prisma.attendance.findMany({
      where: { sessionId: session.id },
      select: { studentId: true, status: true, note: true },
    }),
  ])

  // Merge: students + existing attendance
  const attendanceMap = new Map(
    existingAttendances.map((a) => [a.studentId, { status: a.status, note: a.note }])
  )

  const students = classStudents.map((cs) => ({
    id: cs.student.id,
    fullName: cs.student.fullName,
    phone: cs.student.phone,
    email: cs.student.email,
    attendance: attendanceMap.get(cs.student.id) || null,
  }))

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href={`/admin/schedules/${session.id}`} />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Điểm danh</h2>
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

      <AttendanceFormClient
        sessionId={session.id}
        classId={session.classId}
        sessionStatus={session.status}
        students={JSON.parse(JSON.stringify(students))}
        sessionDate={session.sessionDate.toISOString()}
      />
    </div>
  )
}
