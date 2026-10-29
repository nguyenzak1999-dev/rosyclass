import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Award, BookOpen, CalendarDays, Heart, Sparkles, Star as StarIcon } from "lucide-react"

import {
  EmptyState,
  KidBadge,
  KidButton,
  KidCard,
  RosyMascot,
  SectionHeading,
  Sparkle,
  Star,
  WaveDivider,
  toneAt,
  toneClasses,
} from "@/components/kids"
import { createPageMetadata, JsonLd } from "@/lib/seo"
import { prisma } from "@/lib/prisma"
import { formatVietnamDate } from "@/lib/curriculum"

interface TeacherDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: TeacherDetailPageProps): Promise<Metadata> {
  const { id } = await props.params
  // Cùng điều kiện với trang: hồ sơ đã ẩn không lộ tên trong tiêu đề trang 404
  const teacher = await prisma.teacher.findFirst({
    where: { id, status: "ACTIVE" },
    select: {
      fullName: true,
      bio: true,
      avatar: true,
    },
  })

  if (!teacher) {
    return createPageMetadata({
      title: "Không tìm thấy giáo viên",
      description: "Không tìm thấy hồ sơ giáo viên tại RosyClass.",
      path: `/giao-vien/${id}`,
    })
  }

  return createPageMetadata({
    title: teacher.fullName,
    description: teacher.bio || `Hồ sơ giáo viên ${teacher.fullName} tại RosyClass.`,
    image: teacher.avatar || undefined,
    path: `/giao-vien/${id}`,
  })
}

export default async function TeacherDetailPage(props: TeacherDetailPageProps) {
  const { id } = await props.params
  const teacher = await prisma.teacher.findFirst({
    where: {
      id,
      status: "ACTIVE",
    },
    include: {
      classes: {
        where: {
          status: {
            in: ["UPCOMING", "ACTIVE"],
          },
        },
        include: {
          course: {
            select: {
              name: true,
              slug: true,
              isPublished: true,
              status: true,
            },
          },
        },
        orderBy: [
          { startDate: "asc" },
          { createdAt: "asc" },
        ],
        take: 6,
      },
    },
  })

  if (!teacher) notFound()

  const certificates = teacher.certificates
    ? teacher.certificates.split(",").map((item) => item.trim()).filter(Boolean)
    : []
  const specialties = teacher.specialties
    ? teacher.specialties.split(",").map((item) => item.trim()).filter(Boolean)
    : []

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: teacher.fullName,
          jobTitle: "English Teacher",
          description: teacher.bio,
          image: teacher.avatar,
          worksFor: {
            "@type": "EducationalOrganization",
            name: "RosyClass",
          },
        }}
      />
      <div className="min-h-screen bg-kid-cream">
        <section className="relative overflow-hidden bg-kid-grape-soft">
          <div aria-hidden="true" className="kid-dots pointer-events-none absolute inset-0 opacity-70" />
          <Sparkle className="kid-spin-slow pointer-events-none absolute top-10 right-[8%] h-8 w-8 fill-kid-rose" />
          <div className="relative mx-auto grid max-w-[1100px] items-center gap-12 px-4 pt-12 pb-24 sm:px-8 md:pt-16 lg:grid-cols-[0.8fr_1fr] lg:pb-28">
            <div className="kid-rise relative mx-auto w-full max-w-[400px]">
              <span aria-hidden="true" className="kid-border absolute inset-0 translate-x-3 translate-y-3 rotate-3 rounded-kid-lg bg-kid-sun" />
              <div className="kid-border relative -rotate-2 rounded-kid-lg bg-white p-3">
                <span
                  aria-hidden="true"
                  className="absolute -top-3 left-1/2 z-10 h-7 w-20 -translate-x-1/2 -rotate-3 rounded-md border-2 border-kid-ink/30 bg-kid-mint-soft/90"
                />
                <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] border-[3px] border-kid-ink bg-kid-sky-soft">
                  {teacher.avatar ? (
                    <Image src={teacher.avatar} alt={teacher.fullName} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center text-kid-ink-soft">
                      <RosyMascot mood="happy" className="h-24 w-24" />
                      Chưa có ảnh giáo viên trong CMS.
                    </div>
                  )}
                </div>
              </div>
              <Star className="kid-float absolute -right-4 -bottom-5 h-14 w-14 rotate-12" />
            </div>
            <div className="kid-rise [--kid-delay:0.1s]">
              <KidBadge tone="sun" className="kid-shadow-sm mb-5 -rotate-2 text-[15px]">
                <Heart className="h-4 w-4" aria-hidden="true" />
                Giáo viên RosyClass
              </KidBadge>
              <h1 className="text-[38px] leading-[1.08] font-extrabold break-words text-kid-ink md:text-[58px]">
                {teacher.fullName}
              </h1>
              {teacher.bio && <p className="mt-6 text-[18px] leading-relaxed text-kid-ink-soft">{teacher.bio}</p>}
              <div className="mt-8 flex flex-wrap gap-3">
                <KidButton href="/dang-ky" tone="rose" size="lg" className="text-kid-ink">
                  Đăng ký học thử
                </KidButton>
                <KidButton href="/giao-vien" tone="white" size="lg">
                  Xem đội ngũ
                </KidButton>
              </div>
            </div>
          </div>
          <WaveDivider className="absolute inset-x-0 -bottom-px text-kid-cream" />
        </section>

        <section className="py-14 md:py-20">
          <div className="mx-auto grid max-w-[1100px] gap-8 px-4 sm:px-8 lg:grid-cols-2">
            <KidCard tone="sky" className="md:-rotate-1">
              <h2 className="flex items-center gap-3 text-[28px] font-extrabold text-kid-ink">
                <span aria-hidden="true" className="kid-border-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-kid-sun">
                  <Sparkles className="h-5 w-5" strokeWidth={2.5} />
                </span>
                Chuyên môn
              </h2>
              <ul className="mt-6 space-y-3">
                {specialties.length > 0 ? specialties.map((item) => (
                  <li key={item} className="kid-border-2 flex items-center gap-3 rounded-2xl bg-white p-4 font-semibold text-kid-ink">
                    <StarIcon className="h-5 w-5 shrink-0 fill-kid-sun text-kid-ink" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                )) : <li className="text-kid-ink-soft">Chưa cập nhật chuyên môn trong CMS.</li>}
              </ul>
            </KidCard>
            <KidCard tone="mint" className="md:rotate-1">
              <h2 className="flex items-center gap-3 text-[28px] font-extrabold text-kid-ink">
                <span aria-hidden="true" className="kid-border-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-kid-rose-soft">
                  <Award className="h-5 w-5" strokeWidth={2.5} />
                </span>
                Chứng chỉ
              </h2>
              <ul className="mt-6 space-y-3">
                {certificates.length > 0 ? certificates.map((item) => (
                  <li key={item} className="kid-border-2 flex items-center gap-3 rounded-2xl bg-white p-4 font-semibold text-kid-ink">
                    <Award className="h-5 w-5 shrink-0 text-kid-grape" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                )) : <li className="text-kid-ink-soft">Chưa cập nhật chứng chỉ trong CMS.</li>}
              </ul>
            </KidCard>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-[1100px] px-4 sm:px-8">
            <SectionHeading title="Lớp đang phụ trách" highlight="phụ trách" align="left" />
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {teacher.classes.length > 0 ? teacher.classes.map((classItem, i) => (
                <Link
                  key={classItem.id}
                  // Khoá học chưa hiển thị trên website thì trỏ về lịch khai giảng thay vì trang 404
                  href={
                    classItem.course.isPublished && ["ACTIVE", "PUBLISHED"].includes(classItem.course.status)
                      ? `/khoa-hoc/${classItem.course.slug}`
                      : "/lich-khai-giang"
                  }
                  className={`kid-border kid-shadow kid-pop kid-focus block rounded-kid p-5 ${toneClasses[toneAt(i)].soft}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-kid-display text-[20px] font-extrabold text-kid-ink">{classItem.name}</p>
                      <p className="mt-1 text-[15px] text-kid-ink-soft">{classItem.course.name}</p>
                    </div>
                    <span aria-hidden="true" className="kid-border-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                      <BookOpen className="h-5 w-5 text-kid-ink" />
                    </span>
                  </div>
                  <p className="mt-4 flex items-center text-[15px] font-semibold text-kid-ink">
                    <CalendarDays className="mr-2 h-4 w-4" aria-hidden="true" />
                    {classItem.startDate ? formatVietnamDate(classItem.startDate) : "Chưa cập nhật ngày khai giảng"}
                  </p>
                </Link>
              )) : (
                <EmptyState className="md:col-span-2" title="Chưa có lớp đang mở của giáo viên này." />
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
