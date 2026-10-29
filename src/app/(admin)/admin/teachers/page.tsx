import { prisma } from "@/lib/prisma"
import { TeachersClient } from "./components/teachers-client"

export default async function TeachersPage() {
  const staff = await prisma.user.findMany({
    where: {
      role: {
        code: {
          // Đủ các vai trò mà form nhân sự cho phép tạo, nếu không tư vấn viên / kế toán vừa tạo sẽ không hiện ra
          in: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STAFF', 'CONSULTANT', 'ACCOUNTANT']
        }
      }
    },
    // select thay cho include: không gửi passwordHash xuống trình duyệt
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatar: true,
      status: true,
      roleId: true,
      createdAt: true,
      updatedAt: true,
      role: true,
      teacherProfile: { select: { id: true, bio: true, specialties: true, certificates: true, avatar: true, showOnHomepage: true, hourlyRate: true } }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return <TeachersClient staff={staff as any} />
}
