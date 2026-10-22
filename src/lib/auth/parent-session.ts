import "server-only"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { base64UrlEncode, signPayload, verifySignedPayload } from "@/lib/auth/session"

// Cổng phụ huynh: đăng nhập bằng link chứa token ngẫu nhiên (gửi qua Zalo/SMS).
// DB chỉ lưu SHA-256 của token; cookie là payload ký HMAC giống phiên quản trị.
// Mỗi request đều kiểm tra lại dòng token trong DB nên "Thu hồi" có hiệu lực ngay.

export const PARENT_COOKIE = "rosy_parent"
export const PARENT_SESSION_MAX_AGE = 60 * 60 * 24 * 90 // 90 ngày
const PURPOSE = "parent"

/** Chỉ cập nhật "lần dùng gần nhất" khi đã cũ hơn 1 giờ, tránh ghi DB ở mọi lượt xem */
const LAST_USED_REFRESH_MS = 60 * 60 * 1000

export interface ParentSessionPayload {
  pid: string
  tid: string
  exp: number
}

export interface ParentSession {
  parentId: string
  tokenId: string
  parentName: string
}

/** Token 32 byte ngẫu nhiên, base64url (43 ký tự) */
export function generateParentToken() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}

export function isWellFormedParentToken(token: string | null | undefined): token is string {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token)
}

export async function hashParentToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export function isTokenActive(token: { revokedAt: Date | null; expiresAt: Date | null }, now = new Date()) {
  return !token.revokedAt && (!token.expiresAt || token.expiresAt.getTime() > now.getTime())
}

/** Cookie hết hạn sau 90 ngày, hoặc sớm hơn nếu link hết hạn sớm hơn */
export function parentCookieMaxAge(expiresAt: Date | null, now = new Date()) {
  if (!expiresAt) return PARENT_SESSION_MAX_AGE
  const seconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
  return Math.max(0, Math.min(PARENT_SESSION_MAX_AGE, seconds))
}

export async function createParentSessionCookie(parentId: string, tokenId: string, maxAge: number) {
  const payload: ParentSessionPayload = { pid: parentId, tid: tokenId, exp: Math.floor(Date.now() / 1000) + maxAge }
  return signPayload(payload, PURPOSE)
}

export function parentCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  }
}

/**
 * Phiên phụ huynh của request hiện tại, hoặc null nếu cookie không hợp lệ,
 * link đã bị thu hồi/hết hạn hoặc phụ huynh không còn tồn tại.
 */
export async function getParentSession(): Promise<ParentSession | null> {
  const cookieStore = await cookies()
  const payload = await verifySignedPayload<ParentSessionPayload>(cookieStore.get(PARENT_COOKIE)?.value, PURPOSE)
  if (!payload || typeof payload.pid !== "string" || typeof payload.tid !== "string") return null

  const token = await prisma.parentAccessToken.findUnique({
    where: { id: payload.tid },
    select: {
      id: true,
      parentId: true,
      revokedAt: true,
      expiresAt: true,
      lastUsedAt: true,
      parent: { select: { fullName: true } },
    },
  })
  if (!token || token.parentId !== payload.pid || !isTokenActive(token)) return null

  if (!token.lastUsedAt || Date.now() - token.lastUsedAt.getTime() > LAST_USED_REFRESH_MS) {
    // Không chặn trang nếu ghi lỗi
    await prisma.parentAccessToken.update({ where: { id: token.id }, data: { lastUsedAt: new Date() } }).catch(() => undefined)
  }

  return { parentId: token.parentId, tokenId: token.id, parentName: token.parent.fullName }
}
