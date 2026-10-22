import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getParentSession } from "@/lib/auth/parent-session"
import { daysAgo, formatVietnamDate, vietnamDayRange } from "@/lib/curriculum"
import { KidBadge, toneAt, toneClasses } from "@/components/kids"
import { cn } from "@/lib/utils"
import { NeedLinkCard, PortalHeader } from "./components/portal-shell"

export default async function ParentPortalHome({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const session = await getParentSession()
  if (!session) return <NeedLinkCard reason={params["da-dang-xuat"] ? "signed-out" : "missing"} />

  const today = vietnamDayRange()
  const children = await prisma.student.findMany({
    where: { parentId: session.parentId },
    select: {
      id: true,
      fullName: true,
      classStudents: { where: { status: "ACTIVE" }, select: { class: { select: { id: true, name: true } } } },
    },
    orderBy: { fullName: "asc" },
  })

  const cards = await Promise.all(
    children.map(async (child) => {
      const classIds = child.classStudents.map((row) => row.class.id)
      const [stars, nextSession, openHomework] = await Promise.all([
        prisma.sessionFeedback.aggregate({ where: { studentId: child.id }, _sum: { stars: true } }),
        classIds.length
          ? prisma.classSession.findFirst({
              where: { classId: { in: classIds }, sessionDate: { gte: today.start }, status: { not: "CANCELLED" } },
              select: { sessionDate: true, startTime: true },
              orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
            })
          : null,
        classIds.length
          ? prisma.homework.count({
              where: {
                classId: { in: classIds },
                createdAt: { gte: daysAgo(30) },
                submissions: { none: { studentId: child.id } },
              },
            })
          : 0,
      ])
      return { child, stars: stars._sum.stars ?? 0, nextSession, openHomework }
    })
  )

  return (
    <>
      <PortalHeader parentName={session.parentName} />
      <h1 className="mb-1 text-[32px] leading-tight font-extrabold">Góc của ba mẹ</h1>
      <p className="mb-6 text-[17px] text-kid-ink-soft">Chọn bé để xem lịch học, nhận xét của cô và bài tập về nhà.</p>

      {cards.length === 0 ? (
        <p className="kid-border rounded-kid bg-white p-6 text-center">
          Trung tâm chưa liên kết hồ sơ của bé với ba mẹ. Ba mẹ nhắn trung tâm giúp con nhé.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map(({ child, stars, nextSession, openHomework }, index) => {
            const tone = toneAt(index)
            return (
              <Link
                key={child.id}
                href={`/phu-huynh/con/${child.id}`}
                className={cn("kid-border kid-shadow kid-pop kid-focus flex flex-col gap-3 rounded-kid p-5", toneClasses[tone].soft)}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-[24px] leading-tight font-extrabold">{child.fullName}</h2>
                  <span className="shrink-0 rounded-full border-2 border-kid-ink bg-white px-3 py-1 font-kid-display text-lg font-extrabold">
                    ⭐ {stars}
                  </span>
                </div>
                <p className="text-[15px] text-kid-ink-soft">
                  {child.classStudents.length > 0 ? child.classStudents.map((row) => row.class.name).join(", ") : "Chưa xếp lớp"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {nextSession ? (
                    <KidBadge tone="sky" className="text-[13px]">
                      📅 {formatVietnamDate(nextSession.sessionDate, { weekday: "short", year: undefined })} · {nextSession.startTime}
                    </KidBadge>
                  ) : null}
                  {openHomework > 0 ? (
                    <KidBadge tone="sun" className="text-[13px]">
                      🏠 {openHomework} bài chưa nộp
                    </KidBadge>
                  ) : null}
                </div>
                <span className="font-kid-display font-bold">Xem của con →</span>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
