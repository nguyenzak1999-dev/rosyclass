"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X, Clock, HelpCircle, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT_WITH_PERMISSION"
  | "ABSENT_WITHOUT_PERMISSION"
  | "LATE"
  | "MAKE_UP"

interface AttendanceRowProps {
  studentId: string
  studentName: string
  studentPhone: string | null
  /** Trạng thái đang chọn (do form cha giữ để "Tất cả có mặt" / "Đặt lại" hiển thị đúng) */
  value: { status: AttendanceStatus; note: string | null } | null
  /** null = bỏ chọn học viên này */
  onChange: (data: { status: AttendanceStatus; note: string | null } | null) => void
  disabled?: boolean
}

const statusButtons: {
  value: AttendanceStatus
  label: string
  shortLabel: string
  color: string
  activeColor: string
  Icon: typeof Check
}[] = [
  {
    value: "PRESENT",
    label: "Có mặt",
    shortLabel: "P",
    color: "border-green-200 hover:bg-green-50 text-green-700",
    activeColor: "bg-green-500 border-green-500 text-white hover:bg-green-600",
    Icon: Check,
  },
  {
    value: "LATE",
    label: "Đi muộn",
    shortLabel: "L",
    color: "border-yellow-200 hover:bg-yellow-50 text-yellow-700",
    activeColor: "bg-yellow-500 border-yellow-500 text-white hover:bg-yellow-600",
    Icon: Clock,
  },
  {
    value: "ABSENT_WITH_PERMISSION",
    label: "Vắng phép",
    shortLabel: "A*",
    color: "border-blue-200 hover:bg-blue-50 text-blue-700",
    activeColor: "bg-blue-500 border-blue-500 text-white hover:bg-blue-600",
    Icon: HelpCircle,
  },
  {
    value: "ABSENT_WITHOUT_PERMISSION",
    label: "Vắng KP",
    shortLabel: "A",
    color: "border-red-200 hover:bg-red-50 text-red-700",
    activeColor: "bg-red-500 border-red-500 text-white hover:bg-red-600",
    Icon: X,
  },
]

export function AttendanceRow({
  studentId,
  studentName,
  studentPhone,
  value,
  onChange,
  disabled = false,
}: AttendanceRowProps) {
  const status = value?.status ?? null
  const note = value?.note ?? ""

  const handleStatus = (newStatus: AttendanceStatus) => {
    // Click lại nút đang active → bỏ chọn (không lưu học viên này)
    if (status === newStatus) {
      onChange(null)
      return
    }
    onChange({ status: newStatus, note: note || null })
  }

  const handleNote = (newNote: string) => {
    if (status) {
      onChange({ status, note: newNote || null })
    }
  }

  return (
    <div className="border rounded-lg p-3 sm:p-4 bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Thông tin HV */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{studentName}</p>
          {studentPhone && (
            <p className="text-xs text-muted-foreground">{studentPhone}</p>
          )}
        </div>

        {/* Nút trạng thái - mobile: full width, desktop: compact */}
        <div className="grid grid-cols-4 sm:flex sm:items-center gap-2">
          {statusButtons.map((btn) => {
            const isActive = status === btn.value
            return (
              <button
                key={btn.value}
                type="button"
                onClick={() => handleStatus(btn.value)}
                disabled={disabled}
                className={cn(
                  "h-10 sm:h-9 px-2 sm:px-3 rounded-md border text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1",
                  isActive ? btn.activeColor : btn.color,
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                title={btn.label}
              >
                <btn.Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{btn.label}</span>
                <span className="sm:hidden">{btn.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Ghi chú - ẩn nếu chưa có status */}
      {status && (
        <div className="mt-3 space-y-1">
          <Label htmlFor={`note-${studentId}`} className="text-xs text-muted-foreground">
            Ghi chú (tuỳ chọn)
          </Label>
          <Input
            id={`note-${studentId}`}
            value={note}
            onChange={(e) => handleNote(e.target.value)}
            placeholder="VD: Đi muộn 15 phút, làm bài tập bù..."
            className="h-9 text-sm"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}
