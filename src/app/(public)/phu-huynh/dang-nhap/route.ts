import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  createParentSessionCookie,
  hashParentToken,
  isTokenActive,
  isWellFormedParentToken,
  PARENT_COOKIE,
  parentCookieMaxAge,
  parentCookieOptions,
} from "@/lib/auth/parent-session"

export const dynamic = "force-dynamic"

function redirectTo(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url), 303)
  // Token nằm trên URL: không để lộ qua Referer hay bộ nhớ đệm
  response.headers.set("Referrer-Policy", "no-referrer")
  response.headers.set("Cache-Control", "no-store")
  response.headers.set("X-Robots-Tag", "noindex, nofollow")
  return response
}

/** Link phụ huynh nhận qua Zalo/SMS: /phu-huynh/dang-nhap?t=<token> */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t")
  if (!isWellFormedParentToken(token)) return redirectTo(request, "/phu-huynh/link-khong-hop-le")

  try {
    const row = await prisma.parentAccessToken.findUnique({
      where: { tokenHash: await hashParentToken(token) },
      select: { id: true, parentId: true, revokedAt: true, expiresAt: true },
    })
    if (!row || !isTokenActive(row)) return redirectTo(request, "/phu-huynh/link-khong-hop-le")

    const maxAge = parentCookieMaxAge(row.expiresAt)
    await prisma.parentAccessToken.update({ where: { id: row.id }, data: { lastUsedAt: new Date() } })

    const response = redirectTo(request, "/phu-huynh")
    response.cookies.set(PARENT_COOKIE, await createParentSessionCookie(row.parentId, row.id, maxAge), parentCookieOptions(maxAge))
    return response
  } catch (error) {
    console.error("Parent login error:", error)
    return redirectTo(request, "/phu-huynh/link-khong-hop-le")
  }
}
