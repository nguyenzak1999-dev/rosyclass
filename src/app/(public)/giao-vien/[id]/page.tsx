import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Award, BookOpen, CalendarDays, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createPageMetadata, JsonLd } from "@/lib/seo"
import { prisma } from "@/lib/prisma"

export async function generateMetadata(props: PageProps<"/giao-vien/[id]">): Promise<Metadata> {
  const { id } = await props.params
  const teacher = await prisma.teacher.findUnique({
    where: { id },
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

export default async function TeacherDetailPage(props: PageProps<"/giao-vien/[id]">) {
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
      <main className="min-h-screen bg-[#fcf5eb]">
        <section className="mx-auto grid max-w-[1100px] gap-10 px-4 pt-28 pb-16 sm:px-8 lg:grid-cols-[0.8fr_1fr] lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] border border-[#e9edef] bg-white">
            {teacher.avatar ? (
              <Image src={teacher.avatar} alt={teacher.fullName} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-8 text-center text-[#54656f]">
                Chưa có ảnh giáo viên trong CMS.
              </div>
            )}
          </div>
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#e9edef] bg-white px-4 py-1.5 text-[13px] font-medium text-[#54656f]">
              Giáo viên RosyClass
            </p>
            <h1 className="text-[40px] leading-tight font-medium tracking-tight text-[#111b21] md:text-[56px]">
              {teacher.fullName}
            </h1>
            {teacher.bio && <p className="mt-6 text-[18px] leading-relaxed text-[#54656f]">{teacher.bio}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dang-ky">
                <Button className="h-12 rounded-full bg-[#25d366] px-6 font-medium text-[#111b21] hover:bg-[#111b21] hover:text-white">
                  Đăng ký học thử
                </Button>
              </Link>
              <Link href="/giao-vien">
                <Button variant="outline" className="h-12 rounded-full border-[#111b21] px-6 font-medium text-[#111b21]">
                  Xem đội ngũ
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-[1100px] gap-8 px-4 sm:px-8 lg:grid-cols-2">
            <div>
              <h2 className="text-[30px] font-medium tracking-tight text-[#111b21]">Chuyên môn</h2>
              <div className="mt-6 space-y-3">
                {specialties.length > 0 ? specialties.map((item) => (
                  <div key={item} className="flex items-center rounded-[16px] border border-[#e9edef] p-4">
                    <Star className="mr-3 h-5 w-5 text-[#25d366]" />
                    <span>{item}</span>
                  </div>
                )) : <p className="text-[#54656f]">Chưa cập nhật chuyên môn trong CMS.</p>}
              </div>
            </div>
            <div>
              <h2 className="text-[30px] font-medium tracking-tight text-[#111b21]">Chứng chỉ</h2>
              <div className="mt-6 space-y-3">
                {certificates.length > 0 ? certificates.map((item) => (
                  <div key={item} className="flex items-center rounded-[16px] border border-[#e9edef] p-4">
                    <Award className="mr-3 h-5 w-5 text-[#25d366]" />
                    <span>{item}</span>
                  </div>
                )) : <p className="text-[#54656f]">Chưa cập nhật chứng chỉ trong CMS.</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-[1100px] px-4 sm:px-8">
            <h2 className="text-[30px] font-medium tracking-tight text-[#111b21]">Lớp đang phụ trách</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {teacher.classes.length > 0 ? teacher.classes.map((classItem) => (
                <Link key={classItem.id} href={`/khoa-hoc/${classItem.course.slug}`} className="rounded-[18px] border border-[#e9edef] bg-white p-5 transition-colors hover:border-[#25d366]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-[#111b21]">{classItem.name}</p>
                      <p className="mt-1 text-sm text-[#54656f]">{classItem.course.name}</p>
                    </div>
                    <BookOpen className="h-5 w-5 shrink-0 text-[#25d366]" />
                  </div>
                  <p className="mt-4 flex items-center text-sm text-[#54656f]">
                    <CalendarDays className="mr-2 h-4 w-4 text-[#25d366]" />
                    {classItem.startDate ? classItem.startDate.toLocaleDateString("vi-VN") : "Chưa cập nhật ngày khai giảng"}
                  </p>
                </Link>
              )) : <p className="text-[#54656f]">Chưa có lớp đang mở của giáo viên này.</p>}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
