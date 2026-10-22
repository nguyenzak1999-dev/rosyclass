import Link from "next/link"
import type React from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AdminPageHeaderProps {
  title: string
  description?: React.ReactNode
  /** Nút hành động bên phải (tạo mới, xuất Excel...) */
  actions?: React.ReactNode
  /** Quay lại trang danh sách */
  back?: { href: string; label?: string }
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

/** Tiêu đề trang dùng chung cho mọi trang admin, để các trang trông như một hệ thống */
export function AdminPageHeader({ title, description, actions, back, icon: Icon, className }: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {back ? (
          <Button variant="outline" size="icon" className="mt-0.5 shrink-0" render={<Link href={back.href} aria-label={back.label ?? "Quay lại"} />}>
            <ArrowLeft />
          </Button>
        ) : Icon ? (
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-balance">{title}</h1>
          {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
