"use server"

import { prisma } from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/errors"

const NOTIFICATION_PERMISSIONS = [
  PERMISSIONS.studentsRead,
  PERMISSIONS.classesRead,
  PERMISSIONS.schedulesRead,
  PERMISSIONS.attendanceRead,
]

/**
 * Lấy danh sách thông báo cho admin hiện tại (gần nhất 50).
 * Nếu user chưa đăng nhập → trả mảng rỗng.
 */
export async function getMyNotifications() {
  try {
    const user = await requirePermission(NOTIFICATION_PERMISSIONS[0])
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return { success: true, data: { notifications, unreadCount: notifications.filter((n) => !n.isRead).length } }
  } catch {
    return { success: true, data: { notifications: [], unreadCount: 0 } }
  }
}

/**
 * Đánh dấu 1 notification đã đọc.
 */
export async function markNotificationRead(id: string) {
  try {
    const user = await requirePermission(NOTIFICATION_PERMISSIONS[0])
    await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { isRead: true },
    })
    revalidatePath("/admin/notifications")
    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

/**
 * Đánh dấu tất cả notification của user hiện tại là đã đọc.
 */
export async function markAllNotificationsRead() {
  try {
    const user = await requirePermission(NOTIFICATION_PERMISSIONS[0])
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    })
    revalidatePath("/admin/notifications")
    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

/**
 * Xoá 1 notification.
 */
export async function deleteNotification(id: string) {
  try {
    const user = await requirePermission(NOTIFICATION_PERMISSIONS[0])
    await prisma.notification.deleteMany({
      where: { id, userId: user.id },
    })
    revalidatePath("/admin/notifications")
    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

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
