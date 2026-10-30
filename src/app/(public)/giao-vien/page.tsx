import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import TeachersClient from "./teachers-client"
import { DesignedPage, designedPageMetadata } from "@/components/page-builder/designed-page"

export async function generateMetadata(): Promise<Metadata> {
  return designedPageMetadata("giao-vien", {
    title: "Đội ngũ giáo viên",
    description: "Gặp gỡ đội ngũ giáo viên RosyClass — những thầy cô đồng hành cùng các bé mầm non và tiểu học trên hành trình làm quen và yêu thích tiếng Anh.",
    path: "/giao-vien",
  })
}

async function TeachersPageContent() {
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

    // Trang chi tiết /giao-vien/[id] tìm theo id hồ sơ Teacher, không phải id tài khoản User
    formattedTeachers = teachers
      .filter((user) => user.teacherProfile && user.teacherProfile.status === "ACTIVE")
      .map(user => ({
      id: user.teacherProfile!.id,
      fullName: user.fullName,
      avatar: user.teacherProfile?.avatar || user.avatar || null,
      bio: user.teacherProfile?.bio || "Giáo viên tận tâm, đồng hành cùng các bé",
      specialties: user.teacherProfile?.specialties || "Giáo viên",
      certificates: user.teacherProfile?.certificates || ""
    }));
  } catch (error) {
    // Log the actual error so it appears in Vercel Logs instead of the generic Next.js error
    console.error("🔥 Lỗi Server Component tại trang /giao-vien:", error);
  }

  return <TeachersClient teachers={formattedTeachers} />
}

// Trang thiết kế lại được trong CMS (page builder); phần trên là nội dung chính của trang
export default function TeachersPage() {
  return (
    <DesignedPage slug="giao-vien">
      <TeachersPageContent />
    </DesignedPage>
  )
}
