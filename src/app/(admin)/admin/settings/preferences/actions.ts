"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { requireAdminUser } from "@/lib/auth/permissions"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session"

const MIN_PASSWORD_LENGTH = 8

/**
 * Đổi mật khẩu của chính người đang đăng nhập.
 * Phiên ký kèm dấu vân tay mật khẩu nên mọi phiên cũ (thiết bị khác) tự hết hiệu lực; phiên hiện tại được cấp lại cookie.
 */
export async function changeOwnPassword(data: { currentPassword: string; newPassword: string }) {
  try {
    const actor = await requireAdminUser()
    const currentPassword = String(data.currentPassword || "")
    const newPassword = String(data.newPassword || "")

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return { success: false, error: `Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự` }
    }

    const user = await prisma.user.findUnique({ where: { id: actor.id }, select: { passwordHash: true } })
    if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
      return { success: false, error: "Mật khẩu hiện tại không đúng" }
    }
    if (currentPassword === newPassword) {
      return { success: false, error: "Mật khẩu mới phải khác mật khẩu hiện tại" }
    }

    const passwordHash = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: actor.id }, data: { passwordHash } })

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, await createSessionToken(actor.id, passwordHash), sessionCookieOptions)
    return { success: true }
  } catch (error) {
    console.error("Change password error:", error)
    return { success: false, error: "Không thể đổi mật khẩu, vui lòng thử lại" }
  }
}
