"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { KID_COURSE_LEVELS } from "@/lib/course-levels"

const COURSE_LEVELS = KID_COURSE_LEVELS

interface CourseFiltersProps {
  currentLevel: string
  currentStatus: string
  currentIsPublished: string
}

export function CourseFilters({
  currentLevel,
  currentStatus,
  currentIsPublished,
}: CourseFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/admin/courses?${params.toString()}`)
  }

  const hasFilters = currentLevel || currentStatus || currentIsPublished

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Cấp độ</label>
        <Select
          value={currentLevel || "all"}
          onValueChange={(v) => updateParam("level", v)}
          items={[
            { value: "all", label: "Tất cả cấp độ" },
            ...COURSE_LEVELS,
          ]}
        >
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả cấp độ</SelectItem>
            {COURSE_LEVELS.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Trạng thái</label>
        <Select
          value={currentStatus || "all"}
          onValueChange={(v) => updateParam("status", v)}
          items={[
            { value: "all", label: "Tất cả" },
            { value: "ACTIVE", label: "Đang mở" },
            { value: "INACTIVE", label: "Khóa" },
            { value: "DRAFT", label: "Bản nháp" },
            { value: "PUBLISHED", label: "Đã xuất bản" },
          ]}
        >
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="ACTIVE">Đang mở</SelectItem>
            <SelectItem value="INACTIVE">Khóa</SelectItem>
            <SelectItem value="DRAFT">Bản nháp</SelectItem>
            <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Hiển thị trên web</label>
        <Select
          value={currentIsPublished || "all"}
          onValueChange={(v) => updateParam("isPublished", v)}
          items={[
            { value: "all", label: "Tất cả" },
            { value: "true", label: "Đang hiển thị" },
            { value: "false", label: "Đang ẩn" },
          ]}
        >
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Đang hiển thị</SelectItem>
            <SelectItem value="false">Đang ẩn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/courses")}
          className="text-muted-foreground"
        >
          <X className="w-4 h-4 mr-1" /> Xoá bộ lọc
        </Button>
      )}
    </div>
  )
}
