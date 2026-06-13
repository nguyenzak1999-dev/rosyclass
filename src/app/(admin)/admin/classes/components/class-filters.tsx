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

interface ClassFiltersProps {
  currentStatus: string
  currentCourseId: string
  currentBranchId: string
  currentTeacherId: string
  courses: { id: string; name: string }[]
  teachers: { id: string; fullName: string }[]
  branches: { id: string; name: string }[]
}

export function ClassFilters({
  currentStatus,
  currentCourseId,
  currentBranchId,
  currentTeacherId,
  courses,
  teachers,
  branches,
}: ClassFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/admin/classes?${params.toString()}`)
  }

  const hasFilters = currentStatus || currentCourseId || currentBranchId || currentTeacherId

  return (
    <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 sm:flex sm:flex-wrap sm:items-end sm:p-4">
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Trạng thái</label>
        <Select
          value={currentStatus || "all"}
          onValueChange={(v) => updateParam("status", v)}
          items={[
            { value: "all", label: "Tất cả" },
            { value: "UPCOMING", label: "Sắp mở" },
            { value: "ACTIVE", label: "Đang học" },
            { value: "COMPLETED", label: "Đã kết thúc" },
            { value: "PAUSED", label: "Tạm dừng" },
            { value: "CANCELLED", label: "Đã huỷ" },
          ]}
        >
          <SelectTrigger className="w-full bg-background sm:w-[160px]">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="UPCOMING">Sắp mở</SelectItem>
            <SelectItem value="ACTIVE">Đang học</SelectItem>
            <SelectItem value="COMPLETED">Đã kết thúc</SelectItem>
            <SelectItem value="PAUSED">Tạm dừng</SelectItem>
            <SelectItem value="CANCELLED">Đã huỷ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Khóa học</label>
        <Select
          value={currentCourseId || "all"}
          onValueChange={(v) => updateParam("courseId", v)}
          items={[
            { value: "all", label: "Tất cả" },
            ...courses.map((c) => ({ value: c.id, label: c.name })),
          ]}
        >
          <SelectTrigger className="w-full bg-background sm:w-[200px]">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả khóa học</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Chi nhánh</label>
        <Select
          value={currentBranchId || "all"}
          onValueChange={(v) => updateParam("branchId", v)}
          items={[
            { value: "all", label: "Tất cả" },
            ...branches.map((b) => ({ value: b.id, label: b.name })),
          ]}
        >
          <SelectTrigger className="w-full bg-background sm:w-[180px]">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả chi nhánh</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Giáo viên</label>
        <Select
          value={currentTeacherId || "all"}
          onValueChange={(v) => updateParam("teacherId", v)}
          items={[
            { value: "all", label: "Tất cả" },
            ...teachers.map((t) => ({ value: t.id, label: t.fullName })),
          ]}
        >
          <SelectTrigger className="w-full bg-background sm:w-[200px]">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả giáo viên</SelectItem>
            {teachers.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/classes")}
          className="w-full text-muted-foreground sm:w-auto"
        >
          <X className="w-4 h-4 mr-1" /> Xoá bộ lọc
        </Button>
      )}
    </div>
  )
}
