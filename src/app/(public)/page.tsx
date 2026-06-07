import { prisma } from "@/lib/prisma"
import HomeClient from "./home-client"
import { getSiteSettings } from "@/lib/get-site-settings"

const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]

export default async function HomePage() {
  const courses = await prisma.course.findMany({
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
  });

  const upcomingClasses = await prisma.class.findMany({
    where: {
      status: "UPCOMING",
    },
    include: {
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
      students: {
        select: {
          studentId: true,
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
  });

  // Lấy 3 giáo viên ACTIVE đầu tiên cho trang chủ
  const teachers = await prisma.teacher.findMany({
    where: {
      status: "ACTIVE",
      showOnHomepage: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 3,
  });

  const settings = await getSiteSettings();
  const heroSlides = await prisma.banner.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      {
        position: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });
  const testimonials = await prisma.testimonial.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });
  const faqs = await prisma.faq.findMany({
    where: {
      status: {
        in: ["ACTIVE", "PUBLISHED"],
      },
    },
    orderBy: [
      { position: "asc" },
      { createdAt: "asc" },
    ],
    take: 4,
  });

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
        courseName: classItem.course.name,
        startDate: classItem.startDate?.toISOString() || null,
        schedule:
          classItem.schedules.length > 0
            ? classItem.schedules
                .map((schedule) => `${dayNames[schedule.dayOfWeek] || "Lịch học"} ${schedule.startTime}-${schedule.endTime}`)
                .join(", ")
            : "Đang cập nhật lịch học",
        branchName: classItem.branch?.name || "Đang cập nhật cơ sở",
        teacherName: classItem.teacher?.fullName || "Đang cập nhật giáo viên",
        spotsLeft: Math.max(classItem.maxStudents - classItem.students.length, 0),
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
