import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { CalendarDays, Clock, GraduationCap, MapPin, Users, Wallet } from "lucide-react"

import {
  EmptyState,
  KidButton,
  KidCard,
  PageHero,
  RosyMascot,
  SectionHeading,
  Star,
  WaveDivider,
  toneAt,
  toneClasses,
} from "@/components/kids"
import { createPageMetadata, JsonLd } from "@/lib/seo"
import { prisma } from "@/lib/prisma"

const dayNames = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await props.params
  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      thumbnail: true,
    },
  })

  if (!course) {
    return createPageMetadata({
      title: "Không tìm thấy khóa học",
      description: "Không tìm thấy khóa học tại RosyClass.",
      path: `/khoa-hoc/${slug}`,
    })
  }

  return createPageMetadata({
    title: course.name,
    description: course.description || `Thông tin chi tiết khóa học ${course.name} tại RosyClass.`,
    image: course.thumbnail || undefined,
    path: `/khoa-hoc/${slug}`,
  })
}

export default async function CourseDetailPage(props: CourseDetailPageProps) {
  const { slug } = await props.params
  const course = await prisma.course.findFirst({
    where: {
      slug,
      isPublished: true,
      status: {
        in: ["ACTIVE", "PUBLISHED"],
      },
    },
    include: {
      classes: {
        where: {
          status: {
            in: ["UPCOMING", "ACTIVE"],
          },
        },
        include: {
          branch: true,
          schedules: {
            orderBy: [
              { dayOfWeek: "asc" },
              { startTime: "asc" },
            ],
          },
          students: {
            select: {
              studentId: true,
            },
          },
        },
        orderBy: [
          { startDate: "asc" },
          { createdAt: "asc" },
        ],
      },
    },
  })

  if (!course) notFound()

  const outcomes = course.learningOutcomes
    ? course.learningOutcomes.split("\n").map((item) => item.trim()).filter(Boolean)
    : []

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.name,
          description: course.description,
          provider: {
            "@type": "EducationalOrganization",
            name: "RosyClass",
          },
        }}
      />
      <div className="min-h-screen bg-kid-cream">
        <PageHero
          tone="mint"
          align="left"
          eyebrow={course.targetAudience || course.level}
          eyebrowIcon={<GraduationCap className="h-4 w-4" aria-hidden="true" />}
          title={course.name}
          description={course.description || undefined}
          aside={
            <div className="relative mx-auto w-full max-w-[520px]">
              <span aria-hidden="true" className="kid-border absolute inset-0 translate-x-3 translate-y-3 rotate-3 rounded-kid-lg bg-kid-sun" />
              <div className="kid-border relative aspect-[4/3] -rotate-2 overflow-hidden rounded-kid-lg bg-white">
                {course.thumbnail ? (
                  <Image src={course.thumbnail} alt={course.name} fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center text-kid-ink-soft">
                    <RosyMascot mood="happy" className="h-24 w-24" />
                    Chưa có ảnh đại diện khóa học trong CMS.
                  </div>
                )}
              </div>
              <Star className="kid-float absolute -top-6 -left-5 h-14 w-14 -rotate-12" />
            </div>
          }
        >
          <div className="mt-2 flex flex-wrap gap-3">
            <KidButton href={`/dang-ky?course=${course.slug}`} tone="rose" size="lg" className="text-kid-ink">
              Đăng ký tư vấn
            </KidButton>
            <KidButton href="/kiem-tra-trinh-do" tone="white" size="lg">
              Kiểm tra trình độ
            </KidButton>
          </div>
        </PageHero>

        <section className="py-14 md:py-20">
          <div className="mx-auto grid max-w-[1100px] gap-6 px-4 sm:px-8 md:grid-cols-3">
            {[
              { Icon: Clock, label: "Thời lượng", value: `${course.totalSessions} buổi · ${course.sessionDurationMinutes} phút` },
              { Icon: Users, label: "Đối tượng", value: course.targetAudience || "Chưa cập nhật" },
              { Icon: Wallet, label: "Học phí", value: `${(course.salePrice || course.tuitionFee).toLocaleString("vi-VN")} đ` },
            ].map((item, i) => (
              <KidCard key={item.label} tone={toneAt(i + 1)} className={i === 1 ? "md:-rotate-1" : "md:rotate-1"}>
                <span
                  aria-hidden="true"
                  className={`kid-border-2 mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${toneClasses[toneAt(i + 1)].solid}`}
                >
                  <item.Icon className="h-6 w-6" strokeWidth={2.5} />
                </span>
                <p className="text-[15px] font-bold text-kid-ink-soft">{item.label}</p>
                <p className="mt-1 font-kid-display text-[22px] leading-snug font-extrabold text-kid-ink">{item.value}</p>
              </KidCard>
            ))}
          </div>
        </section>

        <section className="relative bg-white">
          <WaveDivider className="text-kid-cream" flip />
          <div className="mx-auto max-w-[900px] px-4 py-14 sm:px-8 md:py-16">
            <SectionHeading eyebrow="Đầu ra" tone="sun" title="Kết quả đầu ra" align="left" />
            {outcomes.length > 0 ? (
              <ol className="mt-8 grid gap-4">
                {outcomes.map((outcome, i) => (
                  <li
                    key={outcome}
                    className="kid-border kid-shadow-sm flex items-start gap-4 rounded-kid bg-white p-5"
                  >
                    <span
                      aria-hidden="true"
                      className={`kid-border-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-kid-display text-[17px] font-extrabold ${toneClasses[toneAt(i)].soft}`}
                    >
                      {i + 1}
                    </span>
                    <p className="pt-1 text-[17px] font-semibold text-kid-ink">{outcome}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-6 text-kid-ink-soft">Chưa cập nhật kết quả đầu ra trong CMS.</p>
            )}
          </div>
          <WaveDivider className="text-kid-cream" />
        </section>

        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-[1100px] px-4 sm:px-8">
            <SectionHeading eyebrow="Lịch học" tone="grape" title="Lớp đang mở" align="left" />
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {course.classes.length > 0 ? course.classes.map((classItem, i) => {
                const spotsLeft = Math.max(classItem.maxStudents - classItem.students.length, 0)
                const tone = toneAt(i + 2)
                return (
                  <article key={classItem.id} className="kid-border kid-shadow overflow-hidden rounded-kid bg-white">
                    <div className={`border-b-[3px] border-kid-ink px-6 py-4 ${toneClasses[tone].soft}`}>
                      <h3 className="text-[22px] leading-snug font-extrabold text-kid-ink">{classItem.name}</h3>
                    </div>
                    <div className="space-y-3 p-6 text-[15px] text-kid-ink-soft">
                      <p className="flex items-start gap-3">
                        <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-kid-ink" aria-hidden="true" />
                        {classItem.startDate ? `Khai giảng ${classItem.startDate.toLocaleDateString("vi-VN")}` : "Chưa cập nhật ngày khai giảng"}
                      </p>
                      <p className="flex items-start gap-3">
                        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-kid-ink" aria-hidden="true" />
                        {classItem.schedules.length
                          ? classItem.schedules.map((schedule) => `${dayNames[schedule.dayOfWeek]} ${schedule.startTime}-${schedule.endTime}`).join(", ")
                          : "Chưa cập nhật lịch học"}
                      </p>
                      <p className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-kid-ink" aria-hidden="true" />
                        {classItem.branch?.name || "Chưa cập nhật cơ sở"}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-dashed border-kid-ink/15 pt-5">
                        <span
                          className={
                            spotsLeft > 0
                              ? "kid-border-2 rounded-full bg-kid-mint-soft px-3 py-1 text-[14px] font-bold text-kid-ink"
                              : "kid-border-2 rounded-full bg-kid-rose-soft px-3 py-1 text-[14px] font-bold text-[#b0124a]"
                          }
                        >
                          {spotsLeft > 0 ? `Còn ${spotsLeft} chỗ` : "Đã đủ sĩ số"}
                        </span>
                        <KidButton href={`/dang-ky?course=${course.slug}&class=${classItem.id}`} tone="sun" size="sm">
                          Đăng ký
                        </KidButton>
                      </div>
                    </div>
                  </article>
                )
              }) : (
                <EmptyState
                  className="md:col-span-2"
                  title="Chưa có lớp đang mở cho khóa học này."
                  action={
                    <KidButton href={`/dang-ky?course=${course.slug}`} tone="rose" className="text-kid-ink">
                      Đăng ký tư vấn
                    </KidButton>
                  }
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
