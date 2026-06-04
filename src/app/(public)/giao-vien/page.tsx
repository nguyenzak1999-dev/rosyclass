import { prisma } from "@/lib/prisma"
import TeachersClient from "./teachers-client"

export default async function TeachersPage() {
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

    const formattedTeachers = teachers.map(user => ({
      id: user.id,
      fullName: user.fullName,
      avatar: user.teacherProfile?.avatar || user.avatar || null,
      bio: user.teacherProfile?.bio || "Giáo viên tận tâm với nhiều năm kinh nghiệm",
      specialties: user.teacherProfile?.specialties || "Giáo viên",
      certificates: user.teacherProfile?.certificates || ""
    }));

    return <TeachersClient teachers={formattedTeachers} />
  } catch (error) {
    // Log the actual error so it appears in Vercel Logs instead of the generic Next.js error
    console.error("🔥 Lỗi Server Component tại trang /giao-vien:", error);
    
    // Return empty list instead of crashing the page
    return <TeachersClient teachers={[]} />
  }
}
