import { prisma } from "@/lib/prisma"
import HomeClient from "./home-client"
import { getSiteSettings } from "@/lib/get-site-settings"

const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]

export const revalidate = 300

export default async function HomePage() {
  const [courses, upcomingClasses, teachers, settings, heroSlides, testimonials, faqs] =
    await Promise.all([
      safeQuery(
        "homepage courses",
        () =>
          prisma.course.findMany({
            where: {
              status: "PUBLISHED",
              isPublished: true
            },
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              thumbnail: true,
              level: true,
              targetAudience: true,
              learningOutcomes: true,
            },
            orderBy: {
              createdAt: "asc"
            },
            take: 3,
          }),
        []
      ),
      safeQuery(
        "homepage upcoming classes",
        () =>
          prisma.class.findMany({
            where: {
              status: "UPCOMING",
            },
            select: {
              id: true,
              name: true,
              startDate: true,
              maxStudents: true,
              course: {
                select: {
                  name: true,
                },
              },
              teacher: {
                select: {
                  fullName: true,
                },
              },
              branch: {
                select: {
                  name: true,
                },
              },
              schedules: {
                select: {
                  dayOfWeek: true,
                  startTime: true,
                  endTime: true,
                },
                orderBy: [
                  {
                    dayOfWeek: "asc",
                  },
                  {
                    startTime: "asc",
                  },
                ],
                take: 3,
              },
              _count: {
                select: {
                  students: true,
                },
              },
            },
            orderBy: [
              {
                startDate: "asc",
              },
              {
                createdAt: "asc",
              },
            ],
            take: 3,
          }),
        []
      ),
      safeQuery(
        "homepage teachers",
        () =>
          prisma.teacher.findMany({
            where: {
              status: "ACTIVE",
              showOnHomepage: true,
            },
            select: {
              id: true,
              fullName: true,
              avatar: true,
              bio: true,
              specialties: true,
              certificates: true,
            },
            orderBy: {
              createdAt: "asc",
            },
            take: 3,
          }),
        []
      ),
      getSiteSettings(),
      safeQuery(
        "homepage hero slides",
        () =>
          prisma.banner.findMany({
            where: {
              isActive: true,
            },
            select: {
              id: true,
              title: true,
              subtitle: true,
              image: true,
              buttonText: true,
              buttonUrl: true,
            },
            orderBy: [
              {
                position: "asc",
              },
              {
                createdAt: "asc",
              },
            ],
            take: 3,
          }),
        []
      ),
      safeQuery(
        "homepage testimonials",
        () =>
          prisma.testimonial.findMany({
            where: {
              isPublished: true,
            },
            select: {
              id: true,
              avatar: true,
              authorName: true,
              authorTitle: true,
              content: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          }),
        []
      ),
      safeQuery(
        "homepage faqs",
        () =>
          prisma.faq.findMany({
            where: {
              status: {
                in: ["ACTIVE", "PUBLISHED"],
              },
            },
            select: {
              question: true,
              answer: true,
            },
            orderBy: [
              { position: "asc" },
              { createdAt: "asc" },
            ],
            take: 4,
          }),
        []
      ),
    ]);

  return (
    <HomeClient
      courses={courses}
      settings={settings}
      heroSlides={heroSlides.map((slide) => ({
        id: slide.id,
        title: slide.title,
        subtitle: slide.subtitle,
        image: slide.image,
        buttonText: slide.buttonText,
        buttonUrl: slide.buttonUrl,
      }))}
      upcomingClasses={upcomingClasses.map((classItem) => ({
        id: classItem.id,
        name: classItem.name,
        courseName: classItem.course?.name || "Đang cập nhật khóa học",
        startDate: classItem.startDate?.toISOString() || null,
        schedule:
          classItem.schedules.length > 0
            ? classItem.schedules
                .map((schedule) => `${dayNames[schedule.dayOfWeek] || "Lịch học"} ${schedule.startTime}-${schedule.endTime}`)
                .join(", ")
            : "Đang cập nhật lịch học",
        branchName: classItem.branch?.name || "Đang cập nhật cơ sở",
        teacherName: classItem.teacher?.fullName || "Đang cập nhật giáo viên",
        spotsLeft: Math.max(classItem.maxStudents - classItem._count.students, 0),
      }))}
      teachers={teachers.map((teacher) => ({
        id: teacher.id,
        fullName: teacher.fullName,
        avatar: teacher.avatar,
        bio: teacher.bio || "",
        specialties: teacher.specialties || "",
        certificates: teacher.certificates || "",
      }))}
      testimonials={testimonials.map((testimonial) => ({
        id: testimonial.id,
        avatar: testimonial.avatar,
        name: testimonial.authorName,
        title: testimonial.authorTitle,
        content: testimonial.content,
      }))}
      faqs={faqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
      }))}
    />
  )
}

async function safeQuery<T>(
  label: string,
  query: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await query()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.warn(`[homepage] Không thể lấy dữ liệu ${label}. Đang dùng dữ liệu dự phòng. ${message}`)
    return fallback
  }
}
