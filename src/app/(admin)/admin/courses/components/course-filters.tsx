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

const COURSE_LEVELS = [
  { value: "KIDS", label: "Kids" },
  { value: "STARTER", label: "Starter" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "IELTS_FOUNDATION", label: "IELTS Foundation" },
  { value: "IELTS_5_5", label: "IELTS 5.5+" },
  { value: "IELTS_6_5", label: "IELTS 6.5+" },
  { value: "TOEIC", label: "TOEIC" },
  { value: "COMMUNICATION", label: "Giao tiếp" },
  { value: "ONE_ON_ONE", label: "1 kèm 1" },
]

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
