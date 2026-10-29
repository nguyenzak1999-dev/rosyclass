"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCheck, Inbox, Trash2, Bell, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { formatVietnam } from "@/lib/curriculum"
import { vi } from "date-fns/locale"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "./actions"

interface Notification {
  id: string
  title: string
  message: string
  isRead: boolean
  link: string | null
  createdAt: string | Date
}

interface NotificationsClientProps {
  initialNotifications: Notification[]
}

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  // Đồng bộ lại khi server gửi danh sách mới (sau router.refresh: thông báo mới, đọc ở thiết bị khác...)
  const [prevInitial, setPrevInitial] = useState(initialNotifications)
  if (prevInitial !== initialNotifications) {
    setPrevInitial(initialNotifications)
    setNotifications(initialNotifications)
  }
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filtered = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    startTransition(async () => {
      const res = await markNotificationRead(id)
      if (res.success) router.refresh()
    })
  }

  const handleMarkAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    startTransition(async () => {
      const res = await markAllNotificationsRead()
      if (res.success) {
        toast.success("Đã đánh dấu tất cả là đã đọc")
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    startTransition(async () => {
      const res = await deleteNotification(id)
      if (res.success) {
        toast.success("Đã xoá thông báo")
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Tất cả ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Chưa đọc ({unreadCount})
          </Button>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={isPending}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Inbox className="w-8 h-8 opacity-50" />
            <p>
              {filter === "unread"
                ? "Không có thông báo chưa đọc."
                : "Chưa có thông báo nào."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.isRead ? "border-primary/50 bg-primary/5" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                        notification.isRead ? "bg-muted" : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{notification.title}</h4>
                        {!notification.isRead && (
                          <Badge variant="default" className="text-xs">
                            Mới
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span title={formatVietnam(new Date(notification.createdAt), "dd/MM/yyyy HH:mm")}>
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </span>
                        {notification.link && (
                          <Link
                            href={notification.link}
                            onClick={() => {
                              // Mở thông báo coi như đã đọc
                              if (!notification.isRead) void markNotificationRead(notification.id)
                            }}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> Xem chi tiết
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkRead(notification.id)}
                        disabled={isPending}
                      >
                        <CheckCheck className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(notification.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
