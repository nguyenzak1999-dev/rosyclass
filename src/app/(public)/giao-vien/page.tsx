import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { createPageMetadata } from "@/lib/seo"
import TeachersClient from "./teachers-client"

export const metadata: Metadata = createPageMetadata({
  title: "Đội ngũ giáo viên",
  description: "Gặp gỡ đội ngũ giáo viên RosyClass, những người đồng hành cùng học viên trong phát âm, giao tiếp, IELTS và lộ trình học tiếng Anh.",
  path: "/giao-vien",
})

export default async function TeachersPage() {
  let formattedTeachers: Array<{
    id: string
    fullName: string
    avatar: string | null
    bio: string
    specialties: string
    certificates: string
  }> = []

  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: {
          code: "TEACHER"
        },
        status: "ACTIVE"
      },
      include: {
        teacherProfile: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    formattedTeachers = teachers.map(user => ({
      id: user.id,
      fullName: user.fullName,
      avatar: user.teacherProfile?.avatar || user.avatar || null,
      bio: user.teacherProfile?.bio || "Giáo viên tận tâm với nhiều năm kinh nghiệm",
      specialties: user.teacherProfile?.specialties || "Giáo viên",
      certificates: user.teacherProfile?.certificates || ""
    }));
  } catch (error) {
    // Log the actual error so it appears in Vercel Logs instead of the generic Next.js error
    console.error("🔥 Lỗi Server Component tại trang /giao-vien:", error);
  }

  return <TeachersClient teachers={formattedTeachers} />
}
