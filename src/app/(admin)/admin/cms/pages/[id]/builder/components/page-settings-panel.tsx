"use client"

import { Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { generateSlug } from "@/lib/slug"
import { cn } from "@/lib/utils"
import { isPublicStatus, type PageStatus } from "@/lib/page-builder/constants"
import { pageMetaSchema, type PageMetaInput } from "@/lib/page-builder/meta"
import { StatusBadge } from "./status-badge"

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={cn("text-xs", value.length > max ? "font-medium text-destructive" : "text-muted-foreground")}>
      {value.length}/{max}
    </span>
  )
}

export function PageSettingsPanel({
  meta,
  onChange,
  isHome,
  status,
  hasDraft,
  canWrite,
  busy,
  onUnpublish,
}: {
  meta: PageMetaInput
  onChange: (meta: PageMetaInput) => void
  isHome: boolean
  status: PageStatus
  hasDraft: boolean
  canWrite: boolean
  busy: boolean
  onUnpublish: () => void
}) {
  const result = pageMetaSchema.safeParse(meta)
  const errors: Partial<Record<keyof PageMetaInput, string>> = {}
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof PageMetaInput
      errors[key] ??= issue.message
    }
  }
  const set = (key: keyof PageMetaInput, value: string) => onChange({ ...meta, [key]: value })
  const published = isPublicStatus(status)

  return (
    <div className="space-y-5 p-4">
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">Trạng thái</span>
          <StatusBadge status={status} />
        </div>
        <p className="text-xs text-muted-foreground">
          {published
            ? hasDraft
              ? "Trang đang hiển thị trên website. Bạn đang chỉnh bản nháp – bấm “Xuất bản” để cập nhật lên website."
              : "Trang đang hiển thị trên website. “Lưu nháp” sẽ lưu riêng bản nháp, website giữ nguyên tới khi bạn xuất bản."
            : isHome
              ? "Trang chủ chưa xuất bản: website đang dùng trang chủ mặc định. Bấm “Xuất bản” để áp dụng thiết kế này."
              : "Trang chưa hiển thị trên website. Bấm “Xuất bản” khi đã sẵn sàng."}
        </p>
        {published && canWrite ? (
          <Button type="button" variant="outline" size="sm" className="w-full" disabled={busy} onClick={onUnpublish}>
            Gỡ xuất bản
          </Button>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pb-title">Tiêu đề trang *</Label>
        <Input id="pb-title" value={meta.title} aria-invalid={Boolean(errors.title)} onChange={(e) => set("title", e.target.value)} />
        {errors.title ? <p className="text-xs font-medium text-destructive">{errors.title}</p> : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pb-slug">Đường dẫn (slug) *</Label>
        <div className="flex gap-2">
          <div className="flex min-w-0 flex-1 items-center rounded-lg border border-input pl-2.5 text-sm text-muted-foreground focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            /
            <input
              id="pb-slug"
              className="h-8 min-w-0 flex-1 bg-transparent pr-2.5 text-foreground outline-none disabled:opacity-60"
              value={meta.slug}
              disabled={isHome}
              aria-invalid={Boolean(errors.slug)}
              onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            />
          </div>
          {!isHome ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Tạo slug từ tiêu đề"
              title="Tạo slug từ tiêu đề"
              onClick={() => set("slug", generateSlug(meta.title))}
            >
              <Wand2 />
            </Button>
          ) : null}
        </div>
        {isHome ? (
          <p className="text-xs text-muted-foreground">Trang chủ luôn hiển thị tại “/”.</p>
        ) : errors.slug ? (
          <p className="text-xs font-medium text-destructive">{errors.slug}</p>
        ) : null}
      </div>

      <div className="space-y-4 border-t pt-4">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">SEO</p>
        {isHome ? (
          <p className="text-xs text-muted-foreground">
            SEO của trang chủ lấy từ Cài đặt website (SEO mặc định). Các trường dưới đây được lưu để dùng sau.
          </p>
        ) : null}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="pb-seo-title">SEO title</Label>
            <Counter value={meta.seoTitle} max={70} />
          </div>
          <Input
            id="pb-seo-title"
            value={meta.seoTitle}
            placeholder={meta.title}
            onChange={(e) => set("seoTitle", e.target.value)}
          />
          {errors.seoTitle ? <p className="text-xs font-medium text-destructive">{errors.seoTitle}</p> : null}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="pb-seo-desc">SEO description</Label>
            <Counter value={meta.seoDescription} max={160} />
          </div>
          <Textarea
            id="pb-seo-desc"
            rows={4}
            value={meta.seoDescription}
            onChange={(e) => set("seoDescription", e.target.value)}
          />
          {errors.seoDescription ? <p className="text-xs font-medium text-destructive">{errors.seoDescription}</p> : null}
        </div>
      </div>
    </div>
  )
}
