import { Badge } from "@/components/ui/badge"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

export const STATUS_BADGE_MAP: Record<
  string,
  { label: string; variant: BadgeVariant }
> = {
  // Class status
  UPCOMING: { label: "Sắp mở", variant: "secondary" },
  ACTIVE: { label: "Đang học", variant: "default" },
  COMPLETED: { label: "Đã kết thúc", variant: "outline" },
  PAUSED: { label: "Tạm dừng", variant: "outline" },
  CANCELLED: { label: "Đã huỷ", variant: "destructive" },

  // Session status
  SCHEDULED: { label: "Sắp tới", variant: "default" },
  MAKE_UP: { label: "Phụ đạo", variant: "outline" },

  // Student status
  WAITING_CLASS: { label: "Chờ xếp lớp", variant: "outline" },
  RESERVED: { label: "Bảo lưu", variant: "secondary" },
  DROPPED: { label: "Đã nghỉ", variant: "destructive" },

  // Course status
  DRAFT: { label: "Bản nháp", variant: "outline" },
  PUBLISHED: { label: "Đã xuất bản", variant: "default" },
  INACTIVE: { label: "Khóa", variant: "destructive" },

  // Entity status (generic)
  ARCHIVED: { label: "Đã lưu trữ", variant: "outline" },

  // Lead status (bonus)
  NEW: { label: "Mới", variant: "default" },
  CONTACTED: { label: "Đã liên hệ", variant: "secondary" },
  NO_ANSWER: { label: "Không nghe", variant: "outline" },
  CONSULTED: { label: "Đã tư vấn", variant: "default" },
  PLACEMENT_TEST_BOOKED: { label: "Đã đặt lịch test", variant: "secondary" },
  TESTED: { label: "Đã test", variant: "secondary" },
  WAITING_FOR_PAYMENT: { label: "Chờ thanh toán", variant: "outline" },
  ENROLLED: { label: "Đã nhập học", variant: "default" },
  LOST: { label: "Đã mất", variant: "destructive" },

  // Payment status
  UNPAID: { label: "Chưa thanh toán", variant: "destructive" },
  PARTIAL: { label: "Một phần", variant: "outline" },
  PAID: { label: "Đã thanh toán", variant: "default" },
  REFUNDED: { label: "Đã hoàn tiền", variant: "secondary" },

  // User status
  BANNED: { label: "Bị cấm", variant: "destructive" },

  // Teacher status
  TEACHER_ACTIVE: { label: "Đang dạy", variant: "default" },
  TEACHER_INACTIVE: { label: "Ngừng dạy", variant: "outline" },
}

interface BadgeStatusProps {
  status: string | null | undefined
  fallback?: string
  className?: string
}

/**
 * Component Badge dùng chung, map status → label + variant từ STATUS_BADGE_MAP.
 * - Nếu status không có trong map → hiển thị status gốc + variant "outline"
 * - Nếu fallback được truyền → dùng khi status null/undefined
 */
export function BadgeStatus({ status, fallback, className }: BadgeStatusProps) {
  const config = status ? STATUS_BADGE_MAP[status] : null
  const label = config?.label || fallback || status || "—"
  const variant: BadgeVariant = config?.variant || "outline"

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
