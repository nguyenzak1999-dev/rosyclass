import { prisma } from "@/lib/prisma"
import AboutClient from "./about-client"

export default async function AboutPage() {
  const [studentCount, teacherCount, activeClassCount, paidPayments] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.teacher.count({ where: { status: "ACTIVE" } }),
    prisma.class.count({ where: { status: "ACTIVE" } }),
    prisma.payment.count({ where: { status: "PAID" } }),
  ])

  const stats = [
    { num: studentCount > 0 ? `${studentCount}+` : "Đang cập nhật", label: "Học viên xuất sắc" },
    { num: teacherCount > 0 ? `${teacherCount}+` : "Đang cập nhật", label: "Giáo viên bản ngữ" },
    { num: activeClassCount > 0 ? `${activeClassCount}` : "Đang cập nhật", label: "Lớp đang hoạt động" },
    { num: paidPayments > 0 ? `${paidPayments}+` : "Đang cập nhật", label: "Giao dịch thành công" },
  ]

  return <AboutClient stats={stats} />
}
