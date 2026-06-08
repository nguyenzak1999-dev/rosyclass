import { prisma } from "@/lib/prisma"
import { requireAdminUser } from "@/lib/auth/permissions"
import { Bell, CheckCheck, Trash2, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NotificationsClient } from "./notifications-client"

export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  const user = await requireAdminUser()

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Thông báo
          </h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} thông báo chưa đọc / ${notifications.length} tổng`
              : `${notifications.length} thông báo`}
          </p>
        </div>
      </div>

      <NotificationsClient
        initialNotifications={JSON.parse(JSON.stringify(notifications))}
      />
    </div>
  )
}
