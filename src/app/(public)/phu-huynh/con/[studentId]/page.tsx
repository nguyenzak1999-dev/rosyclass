import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireParentChild } from "@/lib/parent-portal"
import {
  daysAgo,
  formatVietnamDate,
  formatVietnamDayMonth,
  homeworkKindInfo,
  MOODS,
  parseJsonList,
  vietnamDayRange,
} from "@/lib/curriculum"
import { isMediaStorageConfigured } from "@/lib/media-storage"
import { KidBadge, KidCard } from "@/components/kids"
import { MediaPreview } from "@/components/learning/media-preview"
import { cn } from "@/lib/utils"
import { PortalHeader } from "../../components/portal-shell"
import { HomeworkSubmitForm } from "./homework-submit-form"

const PAYMENT_STATUS: Record<string, { label: string; tone: string }> = {
  UNPAID: { label: "Chưa đóng", tone: "bg-kid-rose-soft" },
  PARTIAL: { label: "Đóng một phần", tone: "bg-kid-sun-soft" },
  PAID: { label: "Đã đóng đủ", tone: "bg-kid-mint-soft" },
  REFUNDED: { label: "Đã hoàn", tone: "bg-kid-sky-soft" },
}

const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 })

function Section({ title, emoji, children, id }: { title: string; emoji: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="space-y-3" aria-labelledby={id ? `${id}-title` : undefined}>
      <h2 id={id ? `${id}-title` : undefined} className="text-[24px] leading-tight font-extrabold">
        <span aria-hidden="true">{emoji}</span> {title}
      </h2>
      {children}
    </section>
  )
}

function WordChips({ words }: { words: string[] }) {
  if (words.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Từ vựng">
      {words.map((word) => (
        <span key={word} className="rounded-full border-2 border-kid-ink bg-white px-3 py-1 font-kid-display text-base font-bold">
          {word}
        </span>
      ))}
    </div>
  )
}

export default async function ParentChildPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params
  const { session, student } = await requireParentChild(studentId)

  const classIds = student.classStudents.map((row) => row.class.id)
  const today = vietnamDayRange()
  const weekEnd = vietnamDayRange(new Date(), 7)
  const lessonSelect = {
    select: {
      order: true,
      title: true,
      homework: true,
      unit: { select: { order: true, title: true, vocabulary: true, sentencePatterns: true, songUrl: true } },
    },
  }

  const [upcoming, lastLessonSession, feedbacks, stars, homework, reports, payments] = await Promise.all([
    classIds.length
      ? prisma.classSession.findMany({
          where: { classId: { in: classIds }, sessionDate: { gte: today.start, lt: weekEnd.start }, status: { not: "CANCELLED" } },
          select: {
            id: true,
            sessionDate: true,
            startTime: true,
            endTime: true,
            topic: true,
            class: { select: { name: true } },
            room: { select: { name: true } },
            lesson: lessonSelect,
          },
          orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
        })
      : [],
    // Không có buổi hôm nay: cho ba mẹ ôn lại bài gần nhất
    classIds.length
      ? prisma.classSession.findFirst({
          where: { classId: { in: classIds }, sessionDate: { lt: today.start }, status: { not: "CANCELLED" }, lessonId: { not: null } },
          select: { sessionDate: true, class: { select: { name: true } }, lesson: lessonSelect },
          orderBy: [{ sessionDate: "desc" }, { startTime: "desc" }],
        })
      : null,
    prisma.sessionFeedback.findMany({
      where: { studentId: student.id },
      select: {
        id: true,
        stars: true,
        praises: true,
        mood: true,
        comment: true,
        session: {
          select: {
            sessionDate: true,
            class: { select: { name: true } },
            lesson: { select: { order: true, title: true, unit: { select: { order: true } } } },
          },
        },
      },
      orderBy: { session: { sessionDate: "desc" } },
      take: 10,
    }),
    prisma.sessionFeedback.aggregate({ where: { studentId: student.id }, _sum: { stars: true } }),
    classIds.length
      ? prisma.homework.findMany({
          where: { classId: { in: classIds }, createdAt: { gte: daysAgo(60) } },
          select: {
            id: true,
            title: true,
            instructions: true,
            kind: true,
            dueDate: true,
            createdAt: true,
            class: { select: { name: true } },
            submissions: {
              where: { studentId: student.id },
              select: {
                mediaUrl: true,
                mediaType: true,
                parentNote: true,
                sticker: true,
                teacherComment: true,
                status: true,
                submittedBy: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : [],
    prisma.progressReport.findMany({
      where: { studentId: student.id, status: "PUBLISHED" },
      select: { id: true, title: true, periodStart: true, periodEnd: true, publishedAt: true },
      orderBy: { periodStart: "desc" },
      take: 12,
    }),
    prisma.payment.findMany({
      where: { studentId: student.id, status: { not: "CANCELLED" } },
      select: {
        id: true,
        receiptCode: true,
        totalAmount: true,
        paidAmount: true,
        remainingAmount: true,
        status: true,
        dueDate: true,
        paymentDate: true,
        class: { select: { name: true } },
        course: { select: { name: true } },
        lineItems: { select: { description: true }, take: 3 },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])

  const todaySessions = upcoming.filter((session) => session.sessionDate.getTime() < today.end.getTime())
  const laterSessions = upcoming.filter((session) => session.sessionDate.getTime() >= today.end.getTime())
  const totalRemaining = payments.reduce((sum, payment) => sum + Math.max(0, payment.remainingAmount), 0)
  const uploadsEnabled = isMediaStorageConfigured()
  const moodLabel = (value: string | null) => MOODS.find((mood) => mood.value === value)?.label

  return (
    <div className="space-y-8">
      <PortalHeader parentName={session.parentName} backHref="/phu-huynh" backLabel="Các con" />

      <KidCard tone="rose" className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-[32px] leading-tight font-extrabold">{student.fullName}</h1>
          <p className="text-[15px] text-kid-ink-soft">
            {student.classStudents.length > 0
              ? student.classStudents
                  .map(({ class: item }) => `${item.name}${item.teacher ? ` · GV ${item.teacher.fullName}` : ""}`)
                  .join(" | ")
              : "Con chưa được xếp lớp"}
          </p>
        </div>
        <div className="kid-border rounded-[24px] bg-white px-5 py-3 text-center">
          <p className="font-kid-display text-4xl leading-none font-extrabold">⭐ {stars._sum.stars ?? 0}</p>
          <p className="text-sm font-bold text-kid-ink-soft">sao con đã nhận</p>
        </div>
      </KidCard>

      <nav aria-label="Mục lục" className="-mt-4 flex gap-2 overflow-x-auto pb-1">
        {[
          ["#lich-hoc", "📅 Lịch học"],
          ["#bai-tap", "🏠 Bài tập"],
          ["#nhan-xet", "💬 Nhận xét"],
          ["#bao-cao", "📊 Báo cáo"],
          ["#hoc-phi", "💳 Học phí"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="kid-focus shrink-0 rounded-full border-2 border-kid-ink bg-white px-3 py-1.5 text-sm font-bold">
            {label}
          </a>
        ))}
      </nav>

      <Section title={todaySessions.length > 0 ? "Hôm nay con học" : "Bài con học gần nhất"} emoji="📘" id="lich-hoc">
        {todaySessions.length > 0 ? (
          todaySessions.map((session) => (
            <KidCard key={session.id} tone="sun" className="space-y-3 p-5">
              <p className="font-bold">
                {session.startTime} – {session.endTime} · {session.class.name}
                {session.room ? ` · ${session.room.name}` : ""}
              </p>
              {session.lesson ? (
                <>
                  <div>
                    <p className="text-sm font-bold text-kid-rose">
                      Unit {session.lesson.unit.order}: {session.lesson.unit.title}
                    </p>
                    <p className="font-kid-display text-[22px] leading-tight font-extrabold">
                      Bài {session.lesson.order}: {session.lesson.title}
                    </p>
                  </div>
                  <WordChips words={parseJsonList(session.lesson.unit.vocabulary)} />
                  {parseJsonList(session.lesson.unit.sentencePatterns).length > 0 ? (
                    <p className="text-[15px]">
                      <span className="font-bold">Mẫu câu: </span>
                      {parseJsonList(session.lesson.unit.sentencePatterns).join(" · ")}
                    </p>
                  ) : null}
                  {session.lesson.homework ? (
                    <p className="rounded-2xl border-2 border-kid-ink bg-white p-3 text-[15px]">
                      <span className="font-bold">🏠 Bài về nhà: </span>
                      {session.lesson.homework}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-[15px]">{session.topic || "Cô sẽ cập nhật nội dung buổi học sau."}</p>
              )}
            </KidCard>
          ))
        ) : lastLessonSession?.lesson ? (
          <KidCard tone="sky" className="space-y-3 p-5">
            <p className="text-sm font-bold text-kid-ink-soft">
              {formatVietnamDate(lastLessonSession.sessionDate, { weekday: "long" })} · {lastLessonSession.class.name}
            </p>
            <p className="font-kid-display text-[22px] leading-tight font-extrabold">
              Unit {lastLessonSession.lesson.unit.order} – Bài {lastLessonSession.lesson.order}: {lastLessonSession.lesson.title}
            </p>
            <WordChips words={parseJsonList(lastLessonSession.lesson.unit.vocabulary)} />
            <p className="text-[15px] text-kid-ink-soft">Ba mẹ cùng con ôn lại các từ này nhé!</p>
          </KidCard>
        ) : (
          <p className="text-[15px] text-kid-ink-soft">Hôm nay con không có buổi học.</p>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-extrabold">7 ngày tới</h3>
          {laterSessions.length === 0 ? (
            <p className="text-[15px] text-kid-ink-soft">Chưa có buổi học nào trong 7 ngày tới.</p>
          ) : (
            <ul className="space-y-2">
              {laterSessions.map((session) => (
                <li key={session.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border-2 border-kid-ink bg-white p-3">
                  <span className="font-kid-display text-lg font-extrabold">
                    {formatVietnamDate(session.sessionDate, { weekday: "short", year: undefined })}
                  </span>
                  <span className="font-bold">
                    {session.startTime} – {session.endTime}
                  </span>
                  <span className="text-[15px] text-kid-ink-soft">
                    {session.class.name}
                    {session.lesson ? ` · Unit ${session.lesson.unit.order} – Bài ${session.lesson.order}: ${session.lesson.title}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      <Section title="Bài tập về nhà" emoji="🏠" id="bai-tap">
        {homework.length === 0 ? (
          <p className="text-[15px] text-kid-ink-soft">Chưa có bài tập về nhà nào trong 2 tháng gần đây.</p>
        ) : (
          <div className="space-y-3">
            {homework.map((item) => {
              const submission = item.submissions[0] ?? null
              const kind = homeworkKindInfo(item.kind)
              const reviewed = submission?.status === "REVIEWED"
              return (
                <KidCard key={item.id} className={cn("space-y-3 p-5", reviewed && "bg-kid-mint-soft")}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-kid-display text-[20px] leading-tight font-extrabold">
                        <span aria-hidden="true">{kind.emoji}</span> {item.title}
                      </p>
                      <p className="text-sm text-kid-ink-soft">
                        {kind.label} · Giao {formatVietnamDayMonth(item.createdAt)}
                        {item.dueDate ? ` · Hạn ${formatVietnamDayMonth(item.dueDate)}` : ""}
                      </p>
                    </div>
                    <KidBadge tone={reviewed ? "mint" : submission ? "sky" : "sun"} className="text-[13px]">
                      {reviewed ? "Cô đã chấm" : submission ? "Đã nộp, chờ cô chấm" : "Chưa nộp"}
                    </KidBadge>
                  </div>
                  {item.instructions ? <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{item.instructions}</p> : null}

                  {submission ? (
                    <div className="space-y-2 rounded-2xl border-2 border-dashed border-kid-ink/40 bg-white/70 p-3">
                      {submission.submittedBy === "TEACHER" ? (
                        <p className="text-[15px] font-bold">Con đã làm bài này trên lớp 🎉</p>
                      ) : null}
                      <MediaPreview url={submission.mediaUrl} type={submission.mediaType} alt={`Bài của ${student.fullName}`} />
                      {submission.parentNote ? <p className="text-[15px]">Ba mẹ nhắn: {submission.parentNote}</p> : null}
                      {reviewed && (submission.sticker || submission.teacherComment) ? (
                        <p className="text-[17px]">
                          {submission.sticker ? <span className="mr-2 font-kid-display font-extrabold">{submission.sticker}</span> : null}
                          {submission.teacherComment}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {!reviewed ? (
                    <HomeworkSubmitForm
                      homeworkId={item.id}
                      studentId={student.id}
                      kind={item.kind}
                      hasSubmission={Boolean(submission)}
                      uploadsEnabled={uploadsEnabled}
                    />
                  ) : null}
                </KidCard>
              )
            })}
          </div>
        )}
      </Section>

      <Section title="Cô nhận xét" emoji="💬" id="nhan-xet">
        {feedbacks.length === 0 ? (
          <p className="text-[15px] text-kid-ink-soft">Cô chưa có nhận xét nào cho con.</p>
        ) : (
          <ol className="relative space-y-3 border-l-[3px] border-dashed border-kid-ink/30 pl-5">
            {feedbacks.map((feedback) => {
              const praises = parseJsonList(feedback.praises)
              return (
                <li key={feedback.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-3 -left-[31px] h-4 w-4 rounded-full border-[3px] border-kid-ink bg-kid-sun"
                  />
                  <div className="kid-border space-y-2 rounded-[22px] bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold">
                        {formatVietnamDate(feedback.session.sessionDate, { weekday: "short" })}
                        {feedback.session.lesson
                          ? ` · Unit ${feedback.session.lesson.unit.order} – Bài ${feedback.session.lesson.order}`
                          : ` · ${feedback.session.class.name}`}
                      </p>
                      {feedback.stars > 0 ? (
                        <span className="font-kid-display text-lg font-extrabold" aria-label={`${feedback.stars} sao`}>
                          {"⭐".repeat(feedback.stars)}
                        </span>
                      ) : null}
                    </div>
                    {praises.length > 0 || feedback.mood ? (
                      <div className="flex flex-wrap gap-1.5">
                        {feedback.mood ? (
                          <span className="rounded-full border-2 border-kid-ink bg-kid-sky-soft px-3 py-0.5 text-sm font-bold">
                            {feedback.mood} {moodLabel(feedback.mood)}
                          </span>
                        ) : null}
                        {praises.map((praise) => (
                          <span key={praise} className="rounded-full border-2 border-kid-ink bg-kid-rose-soft px-3 py-0.5 text-sm font-bold">
                            {praise}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {feedback.comment ? <p className="text-[15px] leading-relaxed">{feedback.comment}</p> : null}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </Section>

      <Section title="Báo cáo tiến bộ" emoji="📊" id="bao-cao">
        {reports.length === 0 ? (
          <p className="text-[15px] text-kid-ink-soft">Cô sẽ gửi báo cáo tiến bộ của con vào cuối tháng hoặc cuối Unit.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {reports.map((report) => (
              <li key={report.id}>
                <Link
                  href={`/phu-huynh/con/${student.id}/bao-cao/${report.id}`}
                  className="kid-border kid-shadow-sm kid-pop kid-focus flex flex-col gap-1 rounded-[22px] bg-kid-grape-soft p-4"
                >
                  <span className="font-kid-display text-lg leading-tight font-extrabold">{report.title}</span>
                  <span className="text-sm text-kid-ink-soft">
                    {formatVietnamDate(report.periodStart)} – {formatVietnamDate(report.periodEnd)}
                  </span>
                  <span className="text-sm font-bold">Xem báo cáo →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Học phí" emoji="💳" id="hoc-phi">
        {payments.length === 0 ? (
          <p className="text-[15px] text-kid-ink-soft">Chưa có phiếu học phí nào.</p>
        ) : (
          <div className="space-y-3">
            <p
              className={cn(
                "kid-border rounded-[22px] p-4 text-[17px] font-bold",
                totalRemaining > 0 ? "bg-kid-sun-soft" : "bg-kid-mint-soft"
              )}
            >
              {totalRemaining > 0 ? `Còn cần đóng: ${vnd.format(totalRemaining)}` : "Ba mẹ đã đóng đủ học phí. Cảm ơn ba mẹ! 💐"}
            </p>
            <ul className="space-y-2">
              {payments.map((payment) => {
                const status = PAYMENT_STATUS[payment.status] ?? { label: payment.status, tone: "bg-white" }
                const name =
                  payment.lineItems.map((line) => line.description).join(", ") ||
                  payment.class?.name ||
                  payment.course?.name ||
                  "Học phí"
                return (
                  <li key={payment.id} className="space-y-1 rounded-2xl border-2 border-kid-ink bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold">{name}</p>
                      <span className={cn("rounded-full border-2 border-kid-ink px-3 py-0.5 text-sm font-bold", status.tone)}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-[15px]">
                      Tổng {vnd.format(payment.totalAmount)} · Đã đóng {vnd.format(payment.paidAmount)}
                      {payment.remainingAmount > 0 ? (
                        <span className="font-bold"> · Còn lại {vnd.format(payment.remainingAmount)}</span>
                      ) : null}
                    </p>
                    <p className="text-sm text-kid-ink-soft">
                      {payment.receiptCode ? `Mã phiếu ${payment.receiptCode}` : ""}
                      {payment.dueDate && payment.remainingAmount > 0 ? ` · Hạn đóng ${formatVietnamDate(payment.dueDate)}` : ""}
                      {payment.paymentDate ? ` · Đóng ngày ${formatVietnamDate(payment.paymentDate)}` : ""}
                    </p>
                  </li>
                )
              })}
            </ul>
            <p className="text-sm text-kid-ink-soft">Ba mẹ cần đối soát hoặc đóng học phí, vui lòng liên hệ trung tâm.</p>
          </div>
        )}
      </Section>
    </div>
  )
}
