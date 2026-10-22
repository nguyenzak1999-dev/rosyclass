import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { createPageMetadata } from "@/lib/seo"
import { getSiteSettings } from "@/lib/get-site-settings"
import AboutClient from "./about-client"

export const metadata: Metadata = createPageMetadata({
  title: "Về chúng tôi",
  description: "Tìm hiểu RosyClass — trung tâm tiếng Anh dành riêng cho trẻ mầm non và tiểu học tại Dương Xá, Gia Lâm, Hà Nội, với lớp học nhỏ, lộ trình rõ ràng và theo dõi tiến bộ của từng bé.",
  path: "/ve-chung-toi",
})

export default async function AboutPage() {
  const [studentCount, teacherCount, activeClassCount, settings] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.teacher.count({ where: { status: "ACTIVE" } }),
    prisma.class.count({ where: { status: "ACTIVE" } }),
    getSiteSettings(),
  ])

  const stats = [
    { num: studentCount > 0 ? `${studentCount}+` : "Đang cập nhật", label: "Bé đang theo học" },
    { num: teacherCount > 0 ? `${teacherCount}+` : "Đang cập nhật", label: "Thầy cô đồng hành" },
    { num: activeClassCount > 0 ? `${activeClassCount}` : "Đang cập nhật", label: "Lớp đang học" },
    { num: "3–11", label: "Tuổi: mầm non và tiểu học" },
  ]

  return <AboutClient stats={stats} imageUrl={settings.heroImageUrl || settings.ogImage || ""} />
}
