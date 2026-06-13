import { Badge } from "@/components/ui/badge"

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "info"
  | "purple"
  | "orange"
  | "pink"
  | "teal"

export const STATUS_BADGE_MAP: Record<
  string,
  { label: string; variant: BadgeVariant }
> = {
  // ── Lớp học (Class status) ─────────────────────────
  UPCOMING:  { label: "Sắp mở",       variant: "info" },
  ACTIVE:    { label: "Đang học",     variant: "success" },
  COMPLETED: { label: "Đã kết thúc", variant: "secondary" },
  PAUSED:    { label: "Tạm dừng",    variant: "warning" },
  CANCELLED: { label: "Đã huỷ",      variant: "destructive" },

  // ── Buổi học (Session status) ──────────────────────
  SCHEDULED: { label: "Sắp tới",  variant: "info" },
  MAKE_UP:   { label: "Phụ đạo", variant: "purple" },

  // ── Học viên (Student status) ──────────────────────
  WAITING_CLASS: { label: "Chờ xếp lớp", variant: "warning" },
  RESERVED:      { label: "Bảo lưu",     variant: "orange" },
  DROPPED:       { label: "Đã nghỉ",     variant: "destructive" },

  // ── Khóa học (Course status) ───────────────────────
  DRAFT:     { label: "Bản nháp",    variant: "secondary" },
  PUBLISHED: { label: "Đã xuất bản", variant: "success" },
  INACTIVE:  { label: "Khóa",        variant: "destructive" },

  // ── Chung (Entity status) ──────────────────────────
  ARCHIVED: { label: "Đã lưu trữ", variant: "outline" },

  // ── Người dùng / Nhân sự ───────────────────────────
  BANNED: { label: "Bị cấm", variant: "destructive" },

  // ── Trạng thái kích hoạt chung ─────────────────────
  // (dùng cho branch, page, teacher…)
  ACTIVE_USER:   { label: "Hoạt động", variant: "success" },
  INACTIVE_USER: { label: "Bị khóa",   variant: "destructive" },

  // ── Lead (CRM) status ──────────────────────────────
  NEW:                   { label: "Mới",              variant: "info" },
  CONTACTED:             { label: "Đã liên hệ",       variant: "teal" },
  NO_ANSWER:             { label: "Không nghe",        variant: "secondary" },
  CONSULTED:             { label: "Đã tư vấn",        variant: "purple" },
  PLACEMENT_TEST_BOOKED: { label: "Đã đặt lịch test", variant: "orange" },
  TESTED:                { label: "Đã test",           variant: "warning" },
  WAITING_FOR_PAYMENT:   { label: "Chờ thanh toán",   variant: "warning" },
  ENROLLED:              { label: "Đã nhập học",       variant: "success" },
  LOST:                  { label: "Đã mất",            variant: "destructive" },

  // ── Phiếu thu (Payment status) ─────────────────────
  UNPAID:   { label: "Chưa thanh toán", variant: "destructive" },
  PARTIAL:  { label: "Một phần",        variant: "warning" },
  PAID:     { label: "Đã thanh toán",   variant: "success" },
  REFUNDED: { label: "Đã hoàn tiền",    variant: "info" },

  // ── Phương thức thanh toán ─────────────────────────
  CASH:     { label: "Tiền mặt",    variant: "orange" },
  TRANSFER: { label: "Chuyển khoản", variant: "info" },
  VNPAY:    { label: "VNPay",        variant: "purple" },
  MOMO:     { label: "MoMo",         variant: "pink" },

  // ── Điểm danh (Attendance) ─────────────────────────
  PRESENT:  { label: "Có mặt",  variant: "success" },
  ABSENT:   { label: "Vắng",    variant: "destructive" },
  LATE:     { label: "Trễ",     variant: "warning" },
  EXCUSED:  { label: "Phép",    variant: "info" },
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
  const variant = config?.variant || "outline"

  return (
    <Badge variant={variant as any} className={className}>
      {label}
    </Badge>
  )
}
