import Link from "next/link"
import { CalendarClock } from "lucide-react"
import { vi } from "date-fns/locale"
import { prisma } from "@/lib/prisma"
import { hasPermission, PERMISSIONS, requireAdminUser } from "@/lib/auth/permissions"
import { AdminPageHeader } from "@/components/admin/page-header"
import { daysAgo, formatVietnam, vietnamDateKey, vietnamDayRange } from "@/lib/curriculum"
import { MAKE_UP_MINUTES } from "@/lib/monthly-billing-shared"
import { cn } from "@/lib/utils"
import { MakeUpClient, type MakeUpRow } from "./make-up-client"

export const dynamic = "force-dynamic"

const ABSENCE_LABELS: Record<string, string> = {
  ABSENT_WITH_PERMISSION: "Nghỉ có phép",
  ABSENT_WITHOUT_PERMISSION: "Nghỉ không phép",
}

export default async function MakeUpPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams
  const user = await requireAdminUser()
  const canEdit = hasPermission(user, PERMISSIONS.attendanceWrite)
  const showDone = params.tab === "done"
  const today = vietnamDayRange()

  const [lessons, pendingCount, overdueCount] = await Promise.all([
    prisma.makeUpLesson.findMany({
      where: showDone ? { status: { in: ["DONE", "MISSED"] }, updatedAt: { gte: daysAgo(60) } } : { status: "PENDING" },
      select: {
        id: true,
        scheduledDate: true,
        startTime: true,
        durationMinutes: true,
        status: true,
        note: true,
        creditedPayment: { select: { id: true, receiptCode: true } },
        student: { select: { id: true, fullName: true } },
        teacher: { select: { fullName: true } },
        session: {
          select: {
            sessionDate: true,
            startTime: true,
            class: { select: { id: true, name: true } },
            attendances: { select: { studentId: true, status: true } },
          },
        },
      },
      orderBy: showDone ? { updatedAt: "desc" } : [{ scheduledDate: "asc" }, { startTime: "asc" }],
      take: 200,
    }),
    prisma.makeUpLesson.count({ where: { status: "PENDING" } }),
    prisma.makeUpLesson.count({ where: { status: "PENDING", scheduledDate: { lt: today.start } } }),
  ])

  const rows: MakeUpRow[] = lessons.map((lesson) => ({
    id: lesson.id,
    studentId: lesson.student.id,
    studentName: lesson.student.fullName,
    classId: lesson.session.class.id,
    className: lesson.session.class.name,
    absentDate: formatVietnam(lesson.session.sessionDate, "EEEE dd/MM", { locale: vi }),
    absenceLabel:
      ABSENCE_LABELS[lesson.session.attendances.find((row) => row.studentId === lesson.student.id)?.status ?? ""] ?? "Nghỉ",
    scheduledKey: vietnamDateKey(lesson.scheduledDate),
    scheduledLabel: formatVietnam(lesson.scheduledDate, "dd/MM/yyyy"),
    startTime: lesson.startTime,
    durationMinutes: lesson.durationMinutes || MAKE_UP_MINUTES,
    teacherName: lesson.teacher?.fullName ?? null,
    status: lesson.status,
    note: lesson.note,
    overdue: lesson.status === "PENDING" && lesson.scheduledDate < today.start,
    creditedReceipt: lesson.creditedPayment ? { id: lesson.creditedPayment.id, code: lesson.creditedPayment.receiptCode } : null,
  }))

  const tabs = [
    { href: "/admin/make-up", label: `Chờ kèm bù (${pendingCount})`, active: !showDone },
    { href: "/admin/make-up?tab=done", label: "Đã xử lý (60 ngày)", active: showDone },
  ]

  return (
    <div className="space-y-4">
      <AdminPageHeader
        icon={CalendarClock}
        title="Kèm bù"
        description={
          <>
            Bé nghỉ học được tự xếp kèm bù {MAKE_UP_MINUTES} phút vào hôm sau. Đã kèm bù thì không trừ học phí; không bù
            được thì tự trừ vào phiếu thu tháng kế tiếp.
            {overdueCount > 0 ? <span className="font-medium text-destructive"> {overdueCount} buổi đã quá hạn.</span> : null}
          </>
        }
      />
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              tab.active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <MakeUpClient rows={rows} canEdit={canEdit} />
    </div>
  )
}
