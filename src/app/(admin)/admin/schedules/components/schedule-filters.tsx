"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"

interface ScheduleFiltersProps {
  currentMonth: string
  currentStatus: string
  currentBranchId: string
  currentClassId: string
  currentTeacherId: string
  classes: { id: string; name: string }[]
  teachers: { id: string; fullName: string }[]
  branches: { id: string; name: string }[]
}

export function ScheduleFilters({
  currentMonth,
  currentStatus,
  currentBranchId,
  currentClassId,
  currentTeacherId,
  classes,
  teachers,
  branches,
}: ScheduleFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/admin/schedules?${params.toString()}`)
  }

  const resetAll = () => {
    router.push("/admin/schedules")
  }

  const hasFilters =
    currentMonth !== getCurrentMonth() ||
    currentStatus ||
    currentBranchId ||
    currentClassId ||
    currentTeacherId

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Tháng</label>
        <Input
          type="month"
          value={currentMonth}
          onChange={(e) => updateParam("month", e.target.value)}
          className="w-[160px] bg-background"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Trạng thái</label>
        <Select
          value={currentStatus || "all"}
          onValueChange={(v) => updateParam("status", v)}
          items={[
            { value: "all", label: "Tất cả" },
            { value: "SCHEDULED", label: "Sắp tới" },
            { value: "COMPLETED", label: "Hoàn thành" },
            { value: "CANCELLED", label: "Đã huỷ" },
            { value: "MAKE_UP", label: "Phụ đạo" },
          ]}
        >
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="SCHEDULED">Sắp tới</SelectItem>
            <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
            <SelectItem value="CANCELLED">Đã huỷ</SelectItem>
            <SelectItem value="MAKE_UP">Phụ đạo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Chi nhánh</label>
        <Select
          value={currentBranchId || "all"}
          onValueChange={(v) => updateParam("branchId", v)}
          items={[
            { value: "all", label: "Tất cả chi nhánh" },
            ...branches.map((b) => ({ value: b.id, label: b.name })),
          ]}
        >
          <SelectTrigger className="w-[180px] bg-background">
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
        <label className="text-xs text-muted-foreground font-medium">Lớp học</label>
        <Select
          value={currentClassId || "all"}
          onValueChange={(v) => updateParam("classId", v)}
          items={[
            { value: "all", label: "Tất cả lớp" },
            ...classes.map((c) => ({ value: c.id, label: c.name })),
          ]}
        >
          <SelectTrigger className="w-[200px] bg-background">
            <SelectValue placeholder="Tất cả lớp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả lớp</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
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
            { value: "all", label: "Tất cả giáo viên" },
            ...teachers.map((t) => ({ value: t.id, label: t.fullName })),
          ]}
        >
          <SelectTrigger className="w-[200px] bg-background">
            <SelectValue placeholder="Tất cả GV" />
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
          onClick={resetAll}
          className="text-muted-foreground"
        >
          <X className="w-4 h-4 mr-1" /> Xoá bộ lọc
        </Button>
      )}
    </div>
  )
}

function getCurrentMonth(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}
