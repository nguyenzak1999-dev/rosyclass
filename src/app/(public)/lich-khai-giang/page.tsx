import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { createPageMetadata } from "@/lib/seo"
import { vietnamDateKey } from "@/lib/curriculum"
import { ScheduleClient, type ScheduleLevelGroup } from "@/app/(public)/lich-khai-giang/schedule-client"

export const metadata: Metadata = createPageMetadata({
  title: "Lịch khai giảng",
  description: "Lịch khai giảng các lớp tiếng Anh cho bé mầm non và tiểu học tại RosyClass, Dương Xá, Gia Lâm, Hà Nội.",
  path: "/lich-khai-giang",
})

const dayNames = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]

// Gom CourseLevel (enum trong DB) thành nhóm tuổi hiển thị trên bộ lọc.
// Các level không dành cho trẻ mầm non / tiểu học rơi vào nhóm "khac".
function getLevelGroup(level: string): ScheduleLevelGroup {
  if (level === "KIDS") return "mam-non"
  if (level === "STARTER" || level === "A1" || level === "A2") return "tieu-hoc"
  if (level === "ONE_ON_ONE") return "kem-1-1"
  return "khac"
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
      // Chỉ học viên còn học mới chiếm chỗ (HV đã nghỉ / chuyển lớp không tính)
      students: {
        where: { status: "ACTIVE" },
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
          startDate: classItem.startDate ? vietnamDateKey(classItem.startDate) : "",
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
