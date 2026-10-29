"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, X, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MAKE_UP_STATUS_LABELS, type MakeUpStatusCode } from "@/lib/monthly-billing-shared"
import { cn } from "@/lib/utils"
import { updateMakeUpLesson, type UpdateMakeUpInput } from "./actions"

export type MakeUpRow = {
  id: string
  studentId: string
  studentName: string
  classId: string
  className: string
  absentDate: string
  absenceLabel: string
  scheduledKey: string
  scheduledLabel: string
  startTime: string | null
  durationMinutes: number
  teacherName: string | null
  status: MakeUpStatusCode
  note: string | null
  overdue: boolean
  creditedReceipt: { id: string; code: string | null } | null
}

const STATUS_VARIANTS: Record<MakeUpStatusCode, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  DONE: "secondary",
  MISSED: "destructive",
}

export function MakeUpClient({ rows, canEdit }: { rows: MakeUpRow[]; canEdit: boolean }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">Không có buổi kèm bù nào.</CardContent>
      </Card>
    )
  }
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <MakeUpCard key={row.id} row={row} canEdit={canEdit} />
      ))}
    </div>
  )
}

function MakeUpCard({ row, canEdit }: { row: MakeUpRow; canEdit: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)
  const [rescheduling, setRescheduling] = React.useState(false)
  const [date, setDate] = React.useState(row.scheduledKey)
  const [time, setTime] = React.useState(row.startTime ?? "")

  const run = async (input: Omit<UpdateMakeUpInput, "id">, success: string) => {
    if (busy) return
    setBusy(true)
    try {
      const result = await updateMakeUpLesson({ id: row.id, ...input })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(success)
      setRescheduling(false)
      router.refresh()
    } catch {
      toast.error("Không cập nhật được lịch kèm bù")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className={cn(row.overdue && "border-destructive/50")}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/admin/students/${row.studentId}`} className="block truncate font-semibold hover:underline">
              {row.studentName}
            </Link>
            <Link href={`/admin/classes/${row.classId}`} className="block truncate text-xs text-muted-foreground hover:underline">
              {row.className}
            </Link>
          </div>
          <Badge variant={STATUS_VARIANTS[row.status]}>{MAKE_UP_STATUS_LABELS[row.status]}</Badge>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Buổi nghỉ</dt>
          <dd className="first-letter:uppercase">
            {row.absentDate} · {row.absenceLabel.toLowerCase()}
          </dd>
          <dt className="text-muted-foreground">Kèm bù</dt>
          <dd className={cn(row.overdue && "font-medium text-destructive")}>
            {row.scheduledLabel}
            {row.startTime ? ` · ${row.startTime}` : ""} · {row.durationMinutes} phút
            {row.overdue ? " (quá hạn)" : ""}
          </dd>
          {row.teacherName ? (
            <>
              <dt className="text-muted-foreground">Giáo viên</dt>
              <dd>{row.teacherName}</dd>
            </>
          ) : null}
          {row.creditedReceipt ? (
            <>
              <dt className="text-muted-foreground">Học phí</dt>
              <dd>
                Đã trừ vào{" "}
                <Link href={`/admin/payments/${row.creditedReceipt.id}`} className="underline">
                  {row.creditedReceipt.code ?? "phiếu thu"}
                </Link>
              </dd>
            </>
          ) : null}
        </dl>

        {canEdit && rescheduling ? (
          <div className="flex flex-wrap items-center gap-2">
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-auto" />
            <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="w-auto" />
            <Button size="sm" disabled={busy} onClick={() => run({ scheduledDate: date, startTime: time || null, status: "PENDING" }, "Đã đổi lịch kèm bù")}>
              Lưu
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRescheduling(false)}>
              Huỷ
            </Button>
          </div>
        ) : canEdit && !row.creditedReceipt ? (
          <div className="flex flex-wrap gap-2">
            {row.status !== "DONE" && (
              <Button size="sm" disabled={busy} onClick={() => run({ status: "DONE" }, "Đã đánh dấu kèm bù xong")}>
                <Check className="mr-1 h-4 w-4" /> Đã kèm bù
              </Button>
            )}
            {row.status !== "MISSED" && (
              <Button size="sm" variant="outline" disabled={busy} onClick={() => run({ status: "MISSED" }, "Buổi này sẽ được trừ vào phiếu thu tháng sau")}>
                <X className="mr-1 h-4 w-4" /> Không bù được
              </Button>
            )}
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setRescheduling(true)}>
              <CalendarDays className="mr-1 h-4 w-4" /> Đổi lịch
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
