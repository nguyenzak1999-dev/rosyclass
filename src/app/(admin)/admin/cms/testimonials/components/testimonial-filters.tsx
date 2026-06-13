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

interface TestimonialFiltersProps {
  currentIsPublished: string
}

export function TestimonialFilters({ currentIsPublished }: TestimonialFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/admin/cms/testimonials?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Trạng thái</label>
        <Select
          value={currentIsPublished || "all"}
          onValueChange={(v) => updateParam("isPublished", v)}
          items={[
            { value: "all", label: "Tất cả" },
            { value: "true", label: "Đang hiện" },
            { value: "false", label: "Đã ẩn" },
          ]}
        >
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Đang hiện</SelectItem>
            <SelectItem value="false">Đã ẩn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {currentIsPublished && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/cms/testimonials")}
          className="text-muted-foreground"
        >
          <X className="w-4 h-4 mr-1" /> Xoá bộ lọc
        </Button>
      )}
    </div>
  )
}
