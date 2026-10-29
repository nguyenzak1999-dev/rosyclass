import type { Metadata } from "next"
import Link from "next/link"
import { Bell } from "lucide-react"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, type AdminNavCounts } from "@/components/admin/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb"
import { ThemeToggle } from "@/components/theme-toggle"
import { hasPermission, PERMISSIONS, requireAdminUser } from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
}

/** Số việc đang chờ hiện cạnh mục menu; lỗi đếm không được làm hỏng cả trang */
async function navCounts(userId: string, canSeeClassroom: boolean): Promise<AdminNavCounts> {
  try {
    const [notifications, makeUp, homework] = await Promise.all([
      prisma.notification.count({ where: { userId, isRead: false } }),
      canSeeClassroom ? prisma.makeUpLesson.count({ where: { status: "PENDING" } }) : 0,
      canSeeClassroom ? prisma.homeworkSubmission.count({ where: { status: "SUBMITTED" } }) : 0,
    ])
    return { notifications, makeUp, homework }
  } catch (error) {
    console.error("Admin nav counts error:", error)
    return {}
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdminUser()
  const counts = await navCounts(user.id, hasPermission(user, PERMISSIONS.attendanceRead))
  const unread = counts.notifications ?? 0

  return (
    <SidebarProvider>
      <AppSidebar user={user} counts={counts} />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur transition-[width,height] ease-linear supports-[backdrop-filter]:bg-background/80 sm:h-16 sm:px-4 group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <AdminBreadcrumb />
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              render={<Link href="/admin/notifications" aria-label={unread > 0 ? `Thông báo, ${unread} chưa đọc` : "Thông báo"} />}
            >
              <Bell className="h-5 w-5" />
              {unread > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                  {unread > 99 ? "99+" : unread}
                </span>
              ) : null}
            </Button>
          </div>
        </header>
        <main className="flex min-w-0 flex-1 flex-col gap-4 p-3 sm:p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
