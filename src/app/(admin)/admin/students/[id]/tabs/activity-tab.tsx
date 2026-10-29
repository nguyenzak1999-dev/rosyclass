"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatVietnam } from "@/lib/curriculum"
import { Activity, UserPlus, GraduationCap, CreditCard, ClipboardCheck, AlertCircle, Pencil } from "lucide-react"

const EVENT_ICONS: Record<string, any> = {
  CREATED: UserPlus,
  UPDATED: Pencil,
  CLASS_ADDED: GraduationCap,
  CLASS_DROPPED: GraduationCap,
  PAYMENT: CreditCard,
  ATTENDANCE: ClipboardCheck,
  NOTE: AlertCircle,
}

const EVENT_LABELS: Record<string, string> = {
  CREATED: "Hồ sơ được tạo",
  UPDATED: "Cập nhật thông tin",
  CLASS_ADDED: "Xếp vào lớp học",
  CLASS_DROPPED: "Nghỉ khỏi lớp học",
  PAYMENT: "Thanh toán học phí",
  ATTENDANCE: "Điểm danh ghi nhận",
  NOTE: "Ghi chú được thêm",
}

// Build activity log from existing data
function buildActivityLog(student: any) {
  const events: any[] = []

  // Created
  events.push({
    id: "created",
    type: "CREATED",
    label: "Hồ sơ học viên được tạo trong hệ thống",
    date: student.createdAt || student.joinedAt,
  })

  // Classes
  student.classStudents?.forEach((cs: any) => {
    events.push({
      id: `class-${cs.classId}`,
      type: "CLASS_ADDED",
      label: `Được xếp vào lớp "${cs.class?.name}"`,
      date: cs.joinedAt,
      meta: cs.class?.course?.name,
    })
    if (cs.status === 'DROPPED') {
      events.push({
        id: `class-drop-${cs.classId}`,
        type: "CLASS_DROPPED",
        label: `Nghỉ khỏi lớp "${cs.class?.name}"`,
        date: cs.updatedAt || cs.joinedAt,
        meta: cs.class?.course?.name,
      })
    }
  })

  // Payments
  student.payments?.forEach((p: any) => {
    events.push({
      id: `payment-${p.id}`,
      type: "PAYMENT",
      label: `Hóa đơn học phí được tạo`,
      date: p.createdAt,
      meta: `${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.totalAmount)}`,
    })
  })

  // Sort newest first
  return events.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
}

export function ActivityTab({ student }: { student: any }) {
  const activities = buildActivityLog(student)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Nhật ký hoạt động</h3>
        <p className="text-sm text-muted-foreground">Toàn bộ lịch sử thay đổi và hoạt động của học viên</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          {activities.length === 0 ? (
            <div className="py-10 text-center">
              <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Chưa có nhật ký hoạt động</p>
            </div>
          ) : (
            <ol className="relative border-l border-border ml-4 space-y-6">
              {activities.map((evt) => {
                const Icon = EVENT_ICONS[evt.type] || Activity
                return (
                  <li key={evt.id} className="ml-6">
                    <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border ring-2 ring-background">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">{evt.label}</p>
                      {evt.meta && <p className="text-xs text-muted-foreground">{evt.meta}</p>}
                      <time className="text-xs text-muted-foreground">
                        {evt.date ? formatVietnam(new Date(evt.date), "dd/MM/yyyy HH:mm") : "—"}
                      </time>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
