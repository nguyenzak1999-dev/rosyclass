import { prisma } from "@/lib/prisma"
import { TeachersClient } from "./components/teachers-client"

export default async function TeachersPage() {
  const staff = await prisma.user.findMany({
    where: {
      role: {
        code: {
          in: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STAFF']
        }
      }
    },
    include: {
      role: true,
      teacherProfile: { select: { id: true, bio: true, specialties: true, certificates: true, avatar: true, showOnHomepage: true, hourlyRate: true } }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return <TeachersClient staff={staff as any} />
}
