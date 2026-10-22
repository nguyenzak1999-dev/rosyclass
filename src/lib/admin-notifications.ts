import "server-only"

import { prisma } from "@/lib/prisma"

// Tách khỏi file "use server": các hàm này không kiểm tra quyền nên không được
// lộ ra thành server action mà trình duyệt gọi trực tiếp được.

/**
 * Tạo notification cho 1 user.
 * Internal helper - không check permission vì thường được gọi từ action khác.
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        link: link || null,
      },
    })
  } catch (error) {
    console.error("Create notification error:", error)
  }
}

/**
 * Broadcast notification cho tất cả user có role SUPER_ADMIN + ADMIN.
 * Dùng khi có event quan trọng (xếp lớp mới, đổi lịch, v.v.)
 */
export async function notifyAdmins(title: string, message: string, link?: string) {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: { code: { in: ["SUPER_ADMIN", "ADMIN"] } },
        status: "ACTIVE",
      },
      select: { id: true },
    })
    if (admins.length === 0) return
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        title,
        message,
        link: link || null,
      })),
    })
  } catch (error) {
    console.error("Notify admins error:", error)
  }
}
