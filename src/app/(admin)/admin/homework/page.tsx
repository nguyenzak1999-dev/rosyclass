import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { hasPermission, PERMISSIONS, requireAdminUser } from "@/lib/auth/permissions"
import { daysAgo, formatVietnamDate, homeworkKindInfo } from "@/lib/curriculum"
import { cn } from "@/lib/utils"
import { HomeworkQueueClient, type QueueHomework, type QueueSubmission } from "./homework-queue-client"

export const dynamic = "force-dynamic"

export default async function HomeworkQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; classId?: string }>
}) {
  const params = await searchParams
  const user = await requireAdminUser()
  const canReview = hasPermission(user, PERMISSIONS.attendanceWrite)
  const showReviewed = params.status === "reviewed"
  const classId = params.classId || undefined

  const [classes, submissions, pendingCount, recentHomework] = await Promise.all([
    prisma.class.findMany({
      where: { homework: { some: {} } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.homeworkSubmission.findMany({
      where: {
        status: showReviewed ? "REVIEWED" : "SUBMITTED",
        ...(classId ? { homework: { classId } } : {}),
      },
      include: {
        student: { select: { id: true, fullName: true } },
        homework: { select: { id: true, title: true, kind: true, class: { select: { id: true, name: true } } } },
        reviewedBy: { select: { fullName: true } },
      },
      orderBy: showReviewed ? { reviewedAt: "desc" } : { createdAt: "asc" },
      take: showReviewed ? 50 : 100,
    }),
    prisma.homeworkSubmission.count({
      where: { status: "SUBMITTED", ...(classId ? { homework: { classId } } : {}) },
    }),
    prisma.homework.findMany({
      where: {
        createdAt: { gte: daysAgo(45) },
        ...(classId ? { classId } : {}),
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            students: { where: { status: "ACTIVE" }, select: { student: { select: { id: true, fullName: true } } } },
          },
        },
        session: { select: { sessionDate: true } },
        submissions: { select: { studentId: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ])

  const queue: QueueSubmission[] = submissions.map((row) => ({
    id: row.id,
    studentName: row.student.fullName,
    homeworkTitle: row.homework.title,
    kindEmoji: homeworkKindInfo(row.homework.kind).emoji,
    className: row.homework.class.name,
    classId: row.homework.class.id,
    submittedBy: row.submittedBy,
    submittedAt: formatVietnamDate(row.createdAt, { hour: "2-digit", minute: "2-digit" }),
    mediaUrl: row.mediaUrl,
    mediaType: row.mediaType,
    parentNote: row.parentNote,
    sticker: row.sticker,
    teacherComment: row.teacherComment,
    status: row.status,
    reviewedBy: row.reviewedBy?.fullName ?? null,
  }))

  const homework: QueueHomework[] = recentHomework.map((item) => {
    const submittedIds = new Set(item.submissions.map((row) => row.studentId))
    return {
      id: item.id,
      title: item.title,
      kindEmoji: homeworkKindInfo(item.kind).emoji,
      className: item.class.name,
      classId: item.class.id,
      dateLabel: formatVietnamDate(item.session?.sessionDate ?? item.createdAt),
      dueLabel: item.dueDate ? formatVietnamDate(item.dueDate) : null,
      submitted: item.submissions.length,
      reviewed: item.submissions.filter((row) => row.status === "REVIEWED").length,
      students: item.class.students.map(({ student }) => ({
        id: student.id,
        fullName: student.fullName,
        hasSubmission: submittedIds.has(student.id),
      })),
    }
  })

  const tabHref = (status: "pending" | "reviewed") => {
    const query = new URLSearchParams()
    if (status === "reviewed") query.set("status", "reviewed")
    if (classId) query.set("classId", classId)
    const text = query.toString()
    return text ? `/admin/homework?${text}` : "/admin/homework"
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Bài tập về nhà</h2>
          <p className="text-sm text-muted-foreground">
            Chấm bài phụ huynh gửi bằng sticker và một câu nhận xét. Giao bài mới ở màn hình Lên lớp hoặc tab &quot;Bài tập&quot; của lớp.
          </p>
        </div>
        <form className="flex items-center gap-2" action="/admin/homework">
          {showReviewed ? <input type="hidden" name="status" value="reviewed" /> : null}
          <label htmlFor="homework-class-filter" className="text-sm text-muted-foreground">
            Lớp
          </label>
          <select
            id="homework-class-filter"
            name="classId"
            defaultValue={classId ?? ""}
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
          >
            <option value="">Tất cả lớp</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <button type="submit" className="h-9 rounded-lg border px-3 text-sm font-medium hover:bg-muted">
            Lọc
          </button>
        </form>
      </div>

      <nav className="flex gap-2" aria-label="Trạng thái bài nộp">
        <Link
          href={tabHref("pending")}
          className={cn("rounded-full border px-4 py-1.5 text-sm font-medium", !showReviewed ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
        >
          Chờ chấm ({pendingCount})
        </Link>
        <Link
          href={tabHref("reviewed")}
          className={cn("rounded-full border px-4 py-1.5 text-sm font-medium", showReviewed ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
        >
          Đã chấm gần đây
        </Link>
      </nav>

      <HomeworkQueueClient submissions={queue} homework={homework} canReview={canReview} showReviewed={showReviewed} />
    </div>
  )
}
