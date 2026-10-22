"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FileBarChart, Printer, RefreshCw, Send, Trash2, Undo2, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { cn } from "@/lib/utils"
import {
  deleteProgressReport,
  generateProgressReports,
  refreshProgressReport,
  saveReportComment,
  setReportsPublished,
} from "@/app/(admin)/admin/progress-reports/actions"
import { nativeSelectClass } from "@/app/(admin)/admin/homework/components/homework-dialog"

export type ClassReport = {
  id: string
  studentName: string
  title: string
  fromKey: string
  toKey: string
  periodLabel: string
  status: string
  teacherComment: string
  summary: {
    attendanceRate: number | null
    sessions: number
    stars: number
    homeworkSubmitted: number
    homeworkAssigned: number
    skills: number
  }
}

/** Tháng hiện tại theo giờ VN: "YYYY-MM" */
function currentVietnamMonth() {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 7)
}

function monthToRange(month: string) {
  const [year, monthNumber] = month.split("-").map(Number)
  if (!year || !monthNumber) return null
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, "0")}` }
}

const periodKey = (report: Pick<ClassReport, "fromKey" | "toKey">) => `${report.fromKey}_${report.toKey}`

export function ClassReportsTab({ classId, reports, canWrite }: { classId: string; reports: ClassReport[]; canWrite: boolean }) {
  const router = useRouter()
  const [mode, setMode] = React.useState<"month" | "custom">("month")
  const [month, setMonth] = React.useState(currentVietnamMonth)
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [generating, setGenerating] = React.useState(false)
  const [publishAllOpen, setPublishAllOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const periods = React.useMemo(() => {
    const map = new Map<string, { key: string; label: string; title: string }>()
    for (const report of reports) {
      if (!map.has(periodKey(report))) map.set(periodKey(report), { key: periodKey(report), label: report.periodLabel, title: report.title })
    }
    return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key))
  }, [reports])
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>(periods[0]?.key ?? "")
  const activePeriod = periods.some((period) => period.key === selectedPeriod) ? selectedPeriod : periods[0]?.key ?? ""
  const periodReports = reports.filter((report) => periodKey(report) === activePeriod)
  const drafts = periodReports.filter((report) => report.status !== "PUBLISHED")

  const generate = async () => {
    const range = mode === "month" ? monthToRange(month) : from && to ? { from, to } : null
    if (!range) {
      toast.error("Chọn tháng hoặc khoảng ngày của báo cáo")
      return
    }
    setGenerating(true)
    const result = await generateProgressReports({ classId, ...range, title })
    setGenerating(false)
    if (!result.success || !result.data) {
      toast.error(result.error)
      return
    }
    const { created, updated, keptPublished } = result.data
    toast.success(`Đã tạo ${created} và cập nhật ${updated} bản nháp`)
    if (keptPublished > 0) toast.info(`${keptPublished} báo cáo đã gửi phụ huynh được giữ nguyên`)
    setSelectedPeriod(`${range.from}_${range.to}`)
    router.refresh()
  }

  const publish = async (ids: string[], published: boolean) => {
    setBusy(true)
    const result = await setReportsPublished(ids, published)
    setBusy(false)
    if (!result.success) {
      toast.error(result.error)
      return false
    }
    toast.success(published ? "Đã gửi báo cáo cho phụ huynh" : "Đã thu hồi về bản nháp")
    router.refresh()
    return true
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setBusy(true)
    const result = await deleteProgressReport(deletingId)
    setBusy(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success("Đã xoá báo cáo")
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Tạo báo cáo tiến bộ</CardTitle>
            <CardDescription>
              Tự tổng hợp chuyên cần, sao, lời khen, bài tập và kỹ năng của từng bé đang học. Tạo lại cùng kỳ sẽ cập nhật số liệu
              và giữ nguyên nhận xét đã viết.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Kỳ báo cáo">
              {(
                [
                  ["month", "Theo tháng"],
                  ["custom", "Tự chọn ngày"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={mode === value}
                  onClick={() => setMode(value)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium",
                    mode === value ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto] sm:items-end">
              {mode === "month" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="report-month">Tháng</Label>
                  <Input id="report-month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="report-from">Từ ngày</Label>
                    <Input id="report-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="report-to">Đến ngày</Label>
                    <Input id="report-to" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
                  </div>
                </>
              )}
              <div className={cn("space-y-1.5", mode === "month" && "sm:col-span-2")}>
                <Label htmlFor="report-title">Tiêu đề (tuỳ chọn)</Label>
                <Input
                  id="report-title"
                  value={title}
                  maxLength={200}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Báo cáo tiến bộ tháng 10"
                />
              </div>
              <Button onClick={generate} disabled={generating}>
                <Wand2 className="mr-2 h-4 w-4" /> {generating ? "Đang tổng hợp..." : "Tạo bản nháp"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Báo cáo tiến bộ</CardTitle>
            <CardDescription>Viết nhận xét cho từng bé rồi gửi. Phụ huynh xem và in báo cáo đã gửi trong cổng phụ huynh.</CardDescription>
          </div>
          {periods.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Kỳ báo cáo"
                className={cn(nativeSelectClass, "w-auto min-w-[200px]")}
                value={activePeriod}
                onChange={(event) => setSelectedPeriod(event.target.value)}
              >
                {periods.map((period) => (
                  <option key={period.key} value={period.key}>
                    {period.label}
                  </option>
                ))}
              </select>
              {canWrite && drafts.length > 0 ? (
                <Button onClick={() => setPublishAllOpen(true)} disabled={busy}>
                  <Send className="mr-2 h-4 w-4" /> Gửi tất cả ({drafts.length})
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          {periodReports.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-muted-foreground">
              <FileBarChart className="h-8 w-8 opacity-50" />
              <p>Chưa có báo cáo nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {periodReports.map((report) => (
                <ReportRow
                  key={report.id}
                  report={report}
                  canWrite={canWrite}
                  busy={busy}
                  onPublish={(published) => publish([report.id], published)}
                  onDelete={() => setDeletingId(report.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={publishAllOpen}
        onOpenChange={setPublishAllOpen}
        title={`Gửi ${drafts.length} báo cáo cho phụ huynh?`}
        description={
          drafts.some((report) => !report.teacherComment.trim())
            ? `${drafts.filter((report) => !report.teacherComment.trim()).length} báo cáo chưa có nhận xét của giáo viên.`
            : "Phụ huynh sẽ xem được báo cáo trong cổng phụ huynh."
        }
        confirmText="Gửi"
        onConfirm={async () => {
          if (await publish(drafts.map((report) => report.id), true)) setPublishAllOpen(false)
        }}
        isSubmitting={busy}
      />

      <ConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Xoá báo cáo này?"
        description="Nhận xét đã viết cho bé trong báo cáo này cũng bị xoá."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
        isSubmitting={busy}
      />
    </div>
  )
}

function ReportRow({
  report,
  canWrite,
  busy,
  onPublish,
  onDelete,
}: {
  report: ClassReport
  canWrite: boolean
  busy: boolean
  onPublish: (published: boolean) => void
  onDelete: () => void
}) {
  const router = useRouter()
  const [comment, setComment] = React.useState(report.teacherComment)
  const [savedComment, setSavedComment] = React.useState(report.teacherComment)
  const [savingComment, setSavingComment] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const published = report.status === "PUBLISHED"

  const saveComment = async () => {
    if (comment.trim() === savedComment.trim()) return
    setSavingComment(true)
    const result = await saveReportComment(report.id, comment)
    setSavingComment(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setSavedComment(comment)
    toast.success(`Đã lưu nhận xét cho ${report.studentName}`)
  }

  const refresh = async () => {
    setRefreshing(true)
    const result = await refreshProgressReport(report.id)
    setRefreshing(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success("Đã tính lại số liệu")
    router.refresh()
  }

  const { summary } = report
  return (
    <div className="space-y-2 rounded-xl border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 font-semibold">{report.studentName}</p>
        {published ? <Badge variant="success">Đã gửi phụ huynh</Badge> : <Badge variant="secondary">Bản nháp</Badge>}
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs">
        <Badge variant="outline">
          Chuyên cần {summary.attendanceRate === null ? "—" : `${summary.attendanceRate}%`} · {summary.sessions} buổi
        </Badge>
        <Badge variant="outline">⭐ {summary.stars} sao</Badge>
        <Badge variant="outline">
          Bài tập {summary.homeworkSubmitted}/{summary.homeworkAssigned}
        </Badge>
        <Badge variant="outline">{summary.skills} kỹ năng đã đánh giá</Badge>
      </div>
      <Textarea
        value={comment}
        disabled={!canWrite || savingComment}
        maxLength={2000}
        onChange={(event) => setComment(event.target.value)}
        onBlur={saveComment}
        placeholder="Nhận xét của giáo viên gửi ba mẹ (tự lưu khi bấm ra ngoài)"
        className="min-h-[70px]"
        aria-label={`Nhận xét cho ${report.studentName}`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" render={<Link href={`/admin/progress-reports/${report.id}`} />}>
          <Printer className="mr-1 h-3.5 w-3.5" /> Xem / In
        </Button>
        {canWrite ? (
          <>
            {published ? (
              <Button size="sm" variant="outline" disabled={busy} onClick={() => onPublish(false)}>
                <Undo2 className="mr-1 h-3.5 w-3.5" /> Thu hồi
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  disabled={busy || savingComment}
                  onClick={async () => {
                    await saveComment()
                    onPublish(true)
                  }}
                >
                  <Send className="mr-1 h-3.5 w-3.5" /> Gửi
                </Button>
                <Button size="sm" variant="ghost" disabled={refreshing} onClick={refresh}>
                  <RefreshCw className={cn("mr-1 h-3.5 w-3.5", refreshing && "animate-spin motion-reduce:animate-none")} /> Tính lại
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={onDelete}
                  aria-label={`Xoá báo cáo của ${report.studentName}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </>
        ) : null}
        {comment.trim() !== savedComment.trim() ? <span className="text-xs text-amber-600">Chưa lưu nhận xét</span> : null}
      </div>
    </div>
  )
}
