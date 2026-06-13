import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CalendarDays, CheckCircle, Clock, MapPin, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
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
      <main className="min-h-screen bg-[#fcf5eb]">
        <section className="mx-auto grid max-w-[1200px] gap-10 px-4 pt-28 pb-16 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#e9edef] bg-white px-4 py-1.5 text-[13px] font-medium text-[#54656f]">
              {course.targetAudience || course.level}
            </p>
            <h1 className="text-[40px] leading-tight font-medium tracking-tight text-[#111b21] md:text-[56px]">
              {course.name}
            </h1>
            {course.description && (
              <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-[#54656f]">{course.description}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/dang-ky?course=${course.slug}`}>
                <Button className="h-12 rounded-full bg-[#25d366] px-6 font-medium text-[#111b21] hover:bg-[#111b21] hover:text-white">
                  Đăng ký tư vấn
                </Button>
              </Link>
              <Link href="/kiem-tra-trinh-do">
                <Button variant="outline" className="h-12 rounded-full border-[#111b21] px-6 font-medium text-[#111b21]">
                  Kiểm tra trình độ
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-[#e9edef] bg-white">
            {course.thumbnail ? (
              <Image src={course.thumbnail} alt={course.name} fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-8 text-center text-[#54656f]">
                Chưa có ảnh đại diện khóa học trong CMS.
              </div>
            )}
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-[1100px] gap-8 px-4 sm:px-8 lg:grid-cols-3">
            <div className="rounded-[20px] border border-[#e9edef] p-6">
              <Clock className="mb-4 h-6 w-6 text-[#25d366]" />
              <p className="text-sm text-[#54656f]">Thời lượng</p>
              <p className="mt-1 text-xl font-medium text-[#111b21]">{course.totalSessions} buổi · {course.sessionDurationMinutes} phút</p>
            </div>
            <div className="rounded-[20px] border border-[#e9edef] p-6">
              <Users className="mb-4 h-6 w-6 text-[#25d366]" />
              <p className="text-sm text-[#54656f]">Đối tượng</p>
              <p className="mt-1 text-xl font-medium text-[#111b21]">{course.targetAudience || "Chưa cập nhật"}</p>
            </div>
            <div className="rounded-[20px] border border-[#e9edef] p-6">
              <CalendarDays className="mb-4 h-6 w-6 text-[#25d366]" />
              <p className="text-sm text-[#54656f]">Học phí</p>
              <p className="mt-1 text-xl font-medium text-[#111b21]">
                {(course.salePrice || course.tuitionFee).toLocaleString("vi-VN")} đ
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-[900px] px-4 sm:px-8">
            <h2 className="text-[32px] font-medium tracking-tight text-[#111b21]">Kết quả đầu ra</h2>
            {outcomes.length > 0 ? (
              <div className="mt-8 space-y-4">
                {outcomes.map((outcome) => (
                  <div key={outcome} className="flex items-start rounded-[16px] border border-[#e9edef] bg-white p-5">
                    <CheckCircle className="mt-0.5 mr-3 h-5 w-5 shrink-0 text-[#25d366]" />
                    <p className="text-[#111b21]">{outcome}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-[#54656f]">Chưa cập nhật kết quả đầu ra trong CMS.</p>
            )}
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-[1100px] px-4 sm:px-8">
            <h2 className="text-[32px] font-medium tracking-tight text-[#111b21]">Lớp đang mở</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {course.classes.length > 0 ? course.classes.map((classItem) => {
                const spotsLeft = Math.max(classItem.maxStudents - classItem.students.length, 0)
                return (
                  <article key={classItem.id} className="rounded-[20px] border border-[#e9edef] p-6">
                    <h3 className="text-xl font-medium text-[#111b21]">{classItem.name}</h3>
                    <p className="mt-3 flex items-center text-sm text-[#54656f]">
                      <CalendarDays className="mr-2 h-4 w-4 text-[#25d366]" />
                      {classItem.startDate ? `Khai giảng ${classItem.startDate.toLocaleDateString("vi-VN")}` : "Chưa cập nhật ngày khai giảng"}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-[#54656f]">
                      <Clock className="mr-2 h-4 w-4 text-[#25d366]" />
                      {classItem.schedules.length
                        ? classItem.schedules.map((schedule) => `${dayNames[schedule.dayOfWeek]} ${schedule.startTime}-${schedule.endTime}`).join(", ")
                        : "Chưa cập nhật lịch học"}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-[#54656f]">
                      <MapPin className="mr-2 h-4 w-4 text-[#25d366]" />
                      {classItem.branch?.name || "Chưa cập nhật cơ sở"}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-[#e9edef] pt-5">
                      <span className={spotsLeft > 0 ? "text-sm font-medium text-[#25d366]" : "text-sm font-medium text-destructive"}>
                        {spotsLeft > 0 ? `Còn ${spotsLeft} chỗ` : "Đã đủ sĩ số"}
                      </span>
                      <Link href={`/dang-ky?course=${course.slug}&class=${classItem.id}`} className="text-sm font-medium text-[#111b21] hover:text-[#25d366]">
                        Đăng ký
                      </Link>
                    </div>
                  </article>
                )
              }) : (
                <p className="text-[#54656f]">Chưa có lớp đang mở cho khóa học này.</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
