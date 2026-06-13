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

const QUESTION_TYPES = [
  "Ngữ pháp",
  "Từ vựng",
  "Đọc hiểu",
  "Nghe hiểu",
  "Viết",
  "Nói",
] as const

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
] as const

interface PlacementQuestionFiltersProps {
  currentType: string
  currentLevel: string
  currentIsPublished: string
}

export function PlacementQuestionFilters({
  currentType,
  currentLevel,
  currentIsPublished,
}: PlacementQuestionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/admin/cms/placement-questions?${params.toString()}`)
  }

  const hasFilters = currentType || currentLevel || currentIsPublished

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Loại</label>
        <Select
          value={currentType || "all"}
          onValueChange={(v) => updateParam("type", v)}
          items={[
            { value: "all", label: "Tất cả loại" },
            ...QUESTION_TYPES.map((t) => ({ value: t, label: t })),
          ]}
        >
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {QUESTION_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
          <SelectTrigger className="w-[200px] bg-background">
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
          value={currentIsPublished || "all"}
          onValueChange={(v) => updateParam("isPublished", v)}
          items={[
            { value: "all", label: "Tất cả" },
            { value: "true", label: "Đang hiện" },
            { value: "false", label: "Đang ẩn" },
          ]}
        >
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Đang hiện</SelectItem>
            <SelectItem value="false">Đang ẩn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/cms/placement-questions")}
          className="text-muted-foreground"
        >
          <X className="w-4 h-4 mr-1" /> Xoá bộ lọc
        </Button>
      )}
    </div>
  )
}
