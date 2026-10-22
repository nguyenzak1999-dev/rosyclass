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
