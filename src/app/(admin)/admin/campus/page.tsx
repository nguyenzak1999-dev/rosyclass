import { prisma } from "@/lib/prisma"
import { hasPermission, requireAdminUser } from "@/lib/auth/permissions"
import { BUILDINGS, type BuildingId, type CampusBuilding } from "./buildings"
import CampusClient from "./campus-client"

async function count(label: string, query: () => Promise<number>) {
  try {
    return await query()
  } catch (error) {
    console.warn(`[campus] Không đếm được ${label}`, error)
    return null
  }
}

// Worker chạy theo UTC; "hôm nay" phải tính theo giờ Việt Nam (UTC+7)
function vietnamToday() {
  const VN_OFFSET = 7 * 60 * 60 * 1000
  const DAY = 24 * 60 * 60 * 1000
  const startOfDay = new Date(Math.floor((Date.now() + VN_OFFSET) / DAY) * DAY - VN_OFFSET)
  return { startOfDay, endOfDay: new Date(startOfDay.getTime() + DAY) }
}

export default async function CampusPage() {
  const user = await requireAdminUser()
  const visible = BUILDINGS.filter((building) => hasPermission(user, building.permission))

  const { startOfDay, endOfDay } = vietnamToday()

  // Chỉ đếm cho những toà nhà người dùng được vào
  const counters: Partial<Record<BuildingId, { label: string; run: () => Promise<number> }>> = {
    classes: { label: "lớp đang học", run: () => prisma.class.count({ where: { status: "ACTIVE" } }) },
    schedule: {
      label: "buổi học hôm nay",
      run: () => prisma.classSession.count({ where: { sessionDate: { gte: startOfDay, lt: endOfDay } } }),
    },
    admissions: { label: "lead mới chưa liên hệ", run: () => prisma.lead.count({ where: { status: "NEW" } }) },
    students: { label: "học viên đang học", run: () => prisma.student.count({ where: { status: "ACTIVE" } }) },
    teachers: { label: "giáo viên đang dạy", run: () => prisma.teacher.count({ where: { status: "ACTIVE" } }) },
    finance: {
      label: "phiếu chưa thu đủ",
      run: () => prisma.payment.count({ where: { status: { in: ["UNPAID", "PARTIAL"] } } }),
    },
    library: {
      label: "bài viết đã đăng",
      run: () => prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    },
  }

  const stats = await Promise.all(
    visible.map(async (building) => {
      const counter = counters[building.id]
      if (!counter) return null
      const value = await count(counter.label, counter.run)
      return value === null ? null : { value, label: counter.label }
    })
  )

  const buildings: CampusBuilding[] = visible.map((building, index) => ({
    ...building,
    stat: stats[index],
    links: building.links.filter((link) => hasPermission(user, link.permission)),
  }))

  return <CampusClient userName={user.fullName} buildings={buildings} />
}
