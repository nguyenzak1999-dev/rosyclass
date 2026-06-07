import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { createPageMetadata } from "@/lib/seo"
import { getSiteSettings } from "@/lib/get-site-settings"
import AboutClient from "./about-client"

export const metadata: Metadata = createPageMetadata({
  title: "Về chúng tôi",
  description: "Tìm hiểu RosyClass, trung tâm tiếng Anh tập trung vào lớp học nhỏ, lộ trình rõ ràng và theo dõi tiến bộ của từng học viên.",
  path: "/ve-chung-toi",
})

export default async function AboutPage() {
  const [studentCount, teacherCount, activeClassCount, paidPayments, settings] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.teacher.count({ where: { status: "ACTIVE" } }),
    prisma.class.count({ where: { status: "ACTIVE" } }),
    prisma.payment.count({ where: { status: "PAID" } }),
    getSiteSettings(),
  ])

  const stats = [
    { num: studentCount > 0 ? `${studentCount}+` : "Đang cập nhật", label: "Học viên xuất sắc" },
    { num: teacherCount > 0 ? `${teacherCount}+` : "Đang cập nhật", label: "Giáo viên bản ngữ" },
    { num: activeClassCount > 0 ? `${activeClassCount}` : "Đang cập nhật", label: "Lớp đang hoạt động" },
    { num: paidPayments > 0 ? `${paidPayments}+` : "Đang cập nhật", label: "Giao dịch thành công" },
  ]

  return <AboutClient stats={stats} imageUrl={settings.heroImageUrl || settings.ogImage || ""} />
}
