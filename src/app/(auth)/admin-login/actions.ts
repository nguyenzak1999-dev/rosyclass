"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { hashPassword, isBcryptHash, verifyPassword } from "@/lib/auth/password"
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session"

const INVALID_CREDENTIALS = "Email hoặc mật khẩu không chính xác."

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "")

  if (!email || !password) {
    return { error: INVALID_CREDENTIALS }
  }

  const adminUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      status: true,
      passwordHash: true,
    },
  })

  if (!adminUser || !(await verifyPassword(password, adminUser.passwordHash))) {
    return { error: INVALID_CREDENTIALS }
  }

  if (adminUser.status !== "ACTIVE") {
    return { error: "Tài khoản chưa được cấp quyền truy cập hệ thống quản trị." }
  }

  let passwordHash = adminUser.passwordHash
  // Mật khẩu bcrypt chuyển từ Supabase được nâng cấp sang PBKDF2 ở lần đăng nhập đầu tiên
  if (isBcryptHash(passwordHash)) {
    passwordHash = await hashPassword(password)
    await prisma.user.update({ where: { id: adminUser.id }, data: { passwordHash } })
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, await createSessionToken(adminUser.id, passwordHash), sessionCookieOptions)

  revalidatePath("/", "layout")
  redirect("/admin/campus")
}
