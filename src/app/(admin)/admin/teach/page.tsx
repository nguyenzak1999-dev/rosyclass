import Link from "next/link"
import { Clock, MapPin, NotebookPen, Presentation, UsersRound } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { hasPermission, PERMISSIONS, requireAdminUser } from "@/lib/auth/permissions"
import { formatVietnamDate, lessonLabel, vietnamDayRange } from "@/lib/curriculum"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Sắp diễn ra",
  COMPLETED: "Đã điểm danh",
  MAKE_UP: "Buổi phụ đạo",
}

const sessionInclude = {
  class: {
    select: {
      id: true,
      name: true,
      teacherId: true,
      course: { select: { name: true } },
      _count: { select: { students: { where: { status: "ACTIVE" as const } } } },
    },
  },
  teacher: { select: { id: true, fullName: true } },
  room: { select: { name: true } },
  lesson: { select: { order: true, title: true, unit: { select: { order: true, title: true } } } },
  _count: { select: { attendances: true } },
}

export default async function TeachTodayPage() {
  const user = await requireAdminUser()
  const canWrite = hasPermission(user, PERMISSIONS.attendanceWrite)
  const isManager = user.roleCode === "SUPER_ADMIN" || user.roleCode === "ADMIN"

  const today = vietnamDayRange()
  const weekEnd = vietnamDayRange(new Date(), 7)

  const [teacher, todaySessions, upcomingSessions] = await Promise.all([
    prisma.teacher.findUnique({ where: { userId: user.id }, select: { id: true } }),
    prisma.classSession.findMany({
      where: { sessionDate: { gte: today.start, lt: today.end }, status: { not: "CANCELLED" } },
      include: sessionInclude,
      orderBy: [{ startTime: "asc" }],
    }),
    prisma.classSession.findMany({
      where: { sessionDate: { gte: today.end, lt: weekEnd.start }, status: { not: "CANCELLED" } },
      include: sessionInclude,
      orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
      take: 30,
    }),
  ])

  // Giáo viên (không phải quản lý) thấy buổi của mình trước
  const isMine = (session: (typeof todaySessions)[number]) =>
    Boolean(teacher) && (session.teacherId === teacher?.id || (!session.teacherId && session.class.teacherId === teacher?.id))
  const prioritise = <T extends (typeof todaySessions)[number]>(list: T[]) =>
    !isManager && teacher ? [...list.filter(isMine), ...list.filter((session) => !isMine(session))] : list

  const todayList = prioritise(todaySessions)
  const upcomingList = prioritise(upcomingSessions).slice(0, 12)

  return (
    <div className="theme-client -m-3 min-h-full bg-kid-cream p-4 text-kid-ink sm:-m-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-kid-ink-soft">{formatVietnamDate(new Date(), { weekday: "long" })}</p>
            <h1 className="font-kid-display text-3xl font-bold sm:text-4xl">Lên lớp hôm nay</h1>
          </div>
          <p className="text-sm text-kid-ink-soft">
            {todayList.length > 0 ? `${todayList.length} buổi học hôm nay` : "Hôm nay không có buổi học nào"}
          </p>
        </div>

        {todayList.length === 0 ? (
          <div className="kid-border rounded-[28px] bg-white p-8 text-center">
            <p className="font-kid-display text-xl font-bold">Hôm nay lớp được nghỉ 🎈</p>
            <p className="mt-1 text-sm text-kid-ink-soft">Các buổi sắp tới trong tuần nằm ở danh sách bên dưới.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {todayList.map((session) => (
              <div key={session.id} className="kid-border kid-shadow-sm flex flex-col gap-4 rounded-[28px] bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-kid-display text-2xl leading-tight font-bold">{session.class.name}</p>
                    <p className="truncate text-sm text-kid-ink-soft">{session.class.course.name}</p>
                  </div>
                  {isMine(session) && !isManager ? (
                    <span className="shrink-0 rounded-full bg-kid-sun-soft px-3 py-1 text-xs font-bold">Lớp của tôi</span>
                  ) : null}
                </div>
                <div className="grid gap-1.5 text-sm">
                  <span className="flex items-center gap-2 font-semibold">
                    <Clock className="h-4 w-4" /> {session.startTime} – {session.endTime}
                  </span>
                  <span className="flex items-center gap-2 text-kid-ink-soft">
                    <MapPin className="h-4 w-4" /> {session.room?.name ?? "Chưa có phòng"} · {session.teacher?.fullName ?? "Chưa phân công GV"}
                  </span>
                  <span className="flex items-center gap-2 text-kid-ink-soft">
                    <UsersRound className="h-4 w-4" /> {session._count.attendances}/{session.class._count.students} bé đã điểm danh
                    {STATUS_LABELS[session.status] ? ` · ${STATUS_LABELS[session.status]}` : ""}
                  </span>
                  <span className="flex items-start gap-2">
                    <NotebookPen className="mt-0.5 h-4 w-4 shrink-0" />
                    {session.lesson ? (
                      <span className="font-semibold">{lessonLabel(session.lesson)}</span>
                    ) : (
                      <span className="text-kid-ink-soft italic">{session.topic || "Chưa gắn bài"}</span>
                    )}
                  </span>
                </div>
                <Link
                  href={`/admin/teach/${session.id}`}
                  className="kid-border kid-shadow-sm kid-pop kid-focus mt-auto flex min-h-14 items-center justify-center gap-2 rounded-full bg-kid-rose px-6 text-lg font-bold text-white"
                >
                  <Presentation className="h-5 w-5" /> {canWrite ? "Lên lớp" : "Xem buổi học"}
                </Link>
              </div>
            ))}
          </div>
        )}

        {upcomingList.length > 0 ? (
          <section className="space-y-2">
            <h2 className="font-kid-display text-xl font-bold">Sắp tới trong tuần</h2>
            <div className="kid-border divide-y-2 divide-kid-ink/10 overflow-hidden rounded-[20px] bg-white">
              {upcomingList.map((session) => (
                <Link
                  key={session.id}
                  href={`/admin/teach/${session.id}`}
                  className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm hover:bg-kid-cream", "kid-focus")}
                >
                  <span className="w-24 shrink-0 font-bold">{formatVietnamDate(session.sessionDate, { weekday: "short", year: undefined })}</span>
                  <span className="w-24 shrink-0 text-kid-ink-soft">
                    {session.startTime} – {session.endTime}
                  </span>
                  <span className="min-w-0 flex-1 font-semibold">{session.class.name}</span>
                  <span className="min-w-0 text-kid-ink-soft">{session.lesson ? lessonLabel(session.lesson) : session.topic || "Chưa gắn bài"}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
