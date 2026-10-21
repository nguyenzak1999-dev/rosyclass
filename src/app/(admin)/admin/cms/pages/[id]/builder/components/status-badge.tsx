import { cn } from "@/lib/utils"
import type { PageStatus } from "@/lib/page-builder/constants"

const STATUS_META: Record<PageStatus, { label: string; className: string }> = {
  PUBLISHED: { label: "Đã xuất bản", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" },
  ACTIVE: { label: "Đang hiển thị", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" },
  DRAFT: { label: "Nháp", className: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" },
  INACTIVE: { label: "Đã ẩn", className: "bg-muted text-muted-foreground" },
}

export function StatusBadge({ status, className }: { status: PageStatus; className?: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.DRAFT
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", meta.className, className)}>
      {meta.label}
    </span>
  )
}
