import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { createPageMetadata } from "@/lib/seo"
import { ScheduleClient } from "@/app/(public)/lich-khai-giang/schedule-client"

export const metadata: Metadata = createPageMetadata({
  title: "Lịch khai giảng",
  description: "Cập nhật lịch khai giảng các khóa học tiếng Anh mới nhất tại RosyClass.",
  path: "/lich-khai-giang",
})

const dayNames = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]

function getLevelGroup(level: string) {
  if (level === "KIDS" || level === "STARTER") return "kids"
  if (level === "A1" || level === "A2" || level === "B1" || level === "B2") return "teens"
  if (level.startsWith("IELTS")) return "ielts"
  if (level === "COMMUNICATION" || level === "ONE_ON_ONE" || level === "TOEIC") return "communication"
  return "all"
}

export default async function SchedulePage() {
  const upcomingClasses = await prisma.class.findMany({
    where: {
      status: {
        in: ["UPCOMING", "ACTIVE"],
      },
      course: {
        isPublished: true,
        status: {
          in: ["ACTIVE", "PUBLISHED"],
        },
      },
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          level: true,
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
  })

  return (
    <ScheduleClient
      initialClasses={upcomingClasses.map((classItem) => {
        const spotsLeft = Math.max(classItem.maxStudents - classItem.students.length, 0)

        return {
          id: classItem.id,
          courseId: classItem.course.id,
          name: classItem.name || classItem.course.name,
          level: getLevelGroup(classItem.course.level),
          startDate: classItem.startDate?.toISOString().slice(0, 10) || "",
          schedule: classItem.schedules.length
            ? classItem.schedules.map((schedule) => `${dayNames[schedule.dayOfWeek] || "Lịch học"} ${schedule.startTime}-${schedule.endTime}`).join(", ")
            : "Chưa cập nhật",
          branch: classItem.branch?.name || "Chưa cập nhật",
          teacher: classItem.teacher?.fullName || "Chưa cập nhật",
          status: spotsLeft > 0 ? "opening" : "full",
          spotsLeft,
        }
      })}
    />
  )
}
