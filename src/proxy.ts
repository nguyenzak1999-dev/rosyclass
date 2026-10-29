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
    const loginUrl = new URL("/admin-login", request.url)
    // Đăng nhập xong quay lại đúng trang đang mở
    const next = `${request.nextUrl.pathname}${request.nextUrl.search}`
    if (next !== "/admin" && next !== "/admin/") loginUrl.searchParams.set("next", next)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/admin-login"],
}
