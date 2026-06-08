"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, Save } from "lucide-react"

interface QuickActionsProps {
  totalStudents: number
  markedCount: number
  onMarkAllPresent: () => void
  onReset: () => void
  onSave: () => void
  isSubmitting: boolean
  isDisabled: boolean
}

export function QuickActions({
  totalStudents,
  markedCount,
  onMarkAllPresent,
  onReset,
  onSave,
  isSubmitting,
  isDisabled,
}: QuickActionsProps) {
  return (
    <div className="sticky bottom-0 bg-background border-t p-3 -mx-4 sm:-mx-6 md:mx-0 md:rounded-lg md:border md:mb-4 z-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          Đã đánh dấu{" "}
          <span className="font-bold text-foreground">{markedCount}</span>
          /{totalStudents} học viên
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllPresent}
            disabled={isDisabled || isSubmitting}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Tất cả CÓ MẶT
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={isDisabled || isSubmitting}
          >
            Đặt lại
          </Button>
          <Button
            onClick={onSave}
            disabled={isDisabled || isSubmitting || markedCount === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Đang lưu..." : "Lưu điểm danh"}
          </Button>
        </div>
      </div>
    </div>
  )
}
