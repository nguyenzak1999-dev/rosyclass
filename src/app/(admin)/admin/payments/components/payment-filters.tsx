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
import { PAYMENT_STATUSES, PAYMENT_METHODS } from "@/lib/schemas/payment"

const methodLabels: Record<string, string> = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản",
  CARD: "Thẻ",
  OTHER: "Khác",
}

interface PaymentFiltersProps {
  currentStatus: string
  currentMethod: string
  currentStudentId: string
  students: { id: string; fullName: string }[]
}

export function PaymentFilters({
  currentStatus,
  currentMethod,
  currentStudentId,
  students,
}: PaymentFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/admin/payments?${params.toString()}`)
  }

  const hasFilters = currentStatus || currentMethod || currentStudentId

  return (
    <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 sm:flex sm:flex-wrap sm:items-end sm:p-4">
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Trạng thái</label>
        <Select
          value={currentStatus || "all"}
          onValueChange={(v) => updateParam("status", v)}
        >
          <SelectTrigger className="w-full bg-background sm:w-[160px]">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {PAYMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Phương thức</label>
        <Select
          value={currentMethod || "all"}
          onValueChange={(v) => updateParam("method", v)}
        >
          <SelectTrigger className="w-full bg-background sm:w-[180px]">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {methodLabels[m] || m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Học viên</label>
        <Select
          value={currentStudentId || "all"}
          onValueChange={(v) => updateParam("studentId", v)}
        >
          <SelectTrigger className="w-full bg-background sm:w-[220px]">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả HV</SelectItem>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/payments")}
          className="w-full text-muted-foreground sm:w-auto"
        >
          <X className="w-4 h-4 mr-1" /> Xoá bộ lọc
        </Button>
      )}
    </div>
  )
}
