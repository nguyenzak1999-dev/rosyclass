import { Metadata } from "next"
import { ScheduleClient } from "./schedule-client"

export const metadata: Metadata = {
  title: "Lịch khai giảng | RosyClass",
  description: "Cập nhật lịch khai giảng các khóa học tiếng Anh mới nhất tại RosyClass.",
}

// Mock data for upcoming classes
const upcomingClasses = [
  {
    id: "class-1",
    name: "Tiếng Anh Trẻ Em (Starter)",
    level: "kids",
    startDate: "2024-07-15",
    schedule: "Thứ 2 - Thứ 4 (17:30 - 19:00)",
    branch: "Cơ sở 1 - Đội Cấn",
    teacher: "Ms. Emily",
    status: "opening", // opening, full, learning
    spotsLeft: 5,
  },
  {
    id: "class-2",
    name: "Luyện thi IELTS 6.5+",
    level: "ielts",
    startDate: "2024-07-20",
    schedule: "Thứ 3 - Thứ 5 - Thứ 7 (19:30 - 21:00)",
    branch: "Cơ sở 1 - Đội Cấn",
    teacher: "Mr. David",
    status: "opening",
    spotsLeft: 2,
  },
  {
    id: "class-3",
    name: "Giao tiếp cho người đi làm",
    level: "communication",
    startDate: "2024-07-25",
    schedule: "Thứ 2 - Thứ 4 - Thứ 6 (19:30 - 21:00)",
    branch: "Cơ sở 2 - Cầu Giấy",
    teacher: "Ms. Sarah",
    status: "full",
    spotsLeft: 0,
  },
  {
    id: "class-4",
    name: "Tiếng Anh Thiếu Niên (PET)",
    level: "teens",
    startDate: "2024-08-05",
    schedule: "Thứ 7 - Chủ Nhật (09:00 - 11:00)",
    branch: "Cơ sở 1 - Đội Cấn",
    teacher: "Mr. Thomas",
    status: "opening",
    spotsLeft: 8,
  },
  {
    id: "class-5",
    name: "IELTS Foundation (4.5-5.0)",
    level: "ielts",
    startDate: "2024-08-10",
    schedule: "Thứ 3 - Thứ 5 (18:00 - 20:00)",
    branch: "Cơ sở 2 - Cầu Giấy",
    teacher: "Ms. Anna",
    status: "opening",
    spotsLeft: 12,
  },
]

export default function SchedulePage() {
  return <ScheduleClient initialClasses={upcomingClasses} />
}
