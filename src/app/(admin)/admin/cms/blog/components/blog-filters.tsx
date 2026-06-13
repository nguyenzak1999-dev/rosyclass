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

interface BlogFiltersProps {
  currentStatus: string
}

export function BlogFilters({ currentStatus }: BlogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/admin/cms/blog?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Trạng thái</label>
        <Select
          value={currentStatus || "all"}
          onValueChange={(v) => updateParam("status", v)}
          items={[
            { value: "all", label: "Tất cả" },
            { value: "DRAFT", label: "Bản nháp" },
            { value: "PUBLISHED", label: "Đã xuất bản" },
            { value: "ACTIVE", label: "Đang hoạt động" },
            { value: "INACTIVE", label: "Không hoạt động" },
          ]}
        >
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="DRAFT">Bản nháp</SelectItem>
            <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
            <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {currentStatus && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/cms/blog")}
          className="text-muted-foreground"
        >
          <X className="w-4 h-4 mr-1" /> Xoá bộ lọc
        </Button>
      )}
    </div>
  )
}
