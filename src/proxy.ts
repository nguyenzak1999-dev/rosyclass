import { NextResponse, type NextRequest } from "next/server"
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth/session"

export async function proxy(request: NextRequest) {
  // Chỉ kiểm tra chữ ký cookie để chuyển hướng nhanh; quyền thực sự được kiểm tra với DB ở server
  const session = await readSessionToken(request.cookies.get(SESSION_COOKIE)?.value)
  const isAuthRoute = request.nextUrl.pathname.startsWith("/admin-login")
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin") && !isAuthRoute

  // Không tự chuyển /admin-login sang dashboard: cookie hợp lệ nhưng tài khoản đã bị khoá
  // sẽ bị server đẩy về /admin-login, chuyển ngược lại sẽ tạo vòng lặp
  if (isAdminRoute && !session) {
    return NextResponse.redirect(new URL("/admin-login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/admin-login"],
}
