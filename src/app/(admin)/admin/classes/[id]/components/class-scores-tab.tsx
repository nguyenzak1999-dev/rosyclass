"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Award, Save, Trash2, TrendingUp, BarChart3, Plus } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { upsertScore, deleteScore } from "@/app/(admin)/admin/attendance/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type ScoreType =
  | "QUIZ"
  | "MIDTERM"
  | "FINAL"
  | "SPEAKING"
  | "WRITING"
  | "LISTENING"
  | "READING"
  | "OTHER"

const SCORE_TYPE_LABELS: Record<ScoreType, string> = {
  QUIZ: "Quiz",
  MIDTERM: "Giữa kỳ",
  FINAL: "Cuối kỳ",
  SPEAKING: "Speaking",
  WRITING: "Writing",
  LISTENING: "Listening",
  READING: "Reading",
  OTHER: "Khác",
}

const SCORE_TYPE_COLORS: Record<ScoreType, string> = {
  QUIZ: "bg-blue-100 text-blue-700",
  MIDTERM: "bg-yellow-100 text-yellow-700",
  FINAL: "bg-red-100 text-red-700",
  SPEAKING: "bg-green-100 text-green-700",
  WRITING: "bg-purple-100 text-purple-700",
  LISTENING: "bg-cyan-100 text-cyan-700",
  READING: "bg-pink-100 text-pink-700",
  OTHER: "bg-gray-100 text-gray-700",
}

interface StudentLite {
  id: string
  fullName: string
}

interface SessionLite {
  id: string
  sessionDate: string | Date
  topic: string | null
}

interface ScoreRecord {
  id: string
  studentId: string
  type: string
  value: number
  maxValue: number
  note: string | null
  date: string | Date
  sessionId: string | null
  student: { id: string; fullName: string }
  session: { id: string; sessionDate: string | Date; topic: string | null } | null
}

interface ClassScoresTabProps {
  classId: string
  students: StudentLite[]
  sessions: SessionLite[]
  scores: ScoreRecord[]
}

export function ClassScoresTab({
  classId,
  students,
  sessions,
  scores,
}: ClassScoresTabProps) {
  const router = useRouter()
  const [studentId, setStudentId] = useState<string>("")
  const [type, setType] = useState<ScoreType>("QUIZ")
  const [value, setValue] = useState<string>("")
  const [maxValue, setMaxValue] = useState<string>("10")
  const [note, setNote] = useState<string>("")
  const [sessionId, setSessionId] = useState<string>("none")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingScoreId, setDeletingScoreId] = useState<string | null>(null)

  // Stats per student
  const studentStats = useMemo(() => {
    const map = new Map<string, { total: number; count: number; average: number }>()
    for (const s of scores) {
      const percent = (s.value / s.maxValue) * 100
      const existing = map.get(s.studentId) || { total: 0, count: 0, average: 0 }
      existing.total += percent
      existing.count += 1
      existing.average = existing.total / existing.count
      map.set(s.studentId, existing)
    }
    return map
  }, [scores])

  // Stats per type
  const typeStats = useMemo(() => {
    const map = new Map<string, { count: number; avgPercent: number; sum: number }>()
    for (const s of scores) {
      const percent = (s.value / s.maxValue) * 100
      const existing = map.get(s.type) || { count: 0, avgPercent: 0, sum: 0 }
      existing.count += 1
      existing.sum += percent
      existing.avgPercent = existing.sum / existing.count
      map.set(s.type, existing)
    }
    return map
  }, [scores])

  const handleSave = async () => {
    if (!studentId) {
      toast.error("Vui lòng chọn học viên")
      return
    }
    const numValue = parseFloat(value)
    const numMax = parseFloat(maxValue)
    if (isNaN(numValue) || isNaN(numMax) || numMax <= 0) {
      toast.error("Điểm không hợp lệ")
      return
    }
    if (numValue > numMax) {
      toast.error("Điểm không được vượt quá điểm tối đa")
      return
    }

    setIsSubmitting(true)
    const res = await upsertScore({
      studentId,
      classId,
      sessionId: sessionId === "none" ? null : sessionId,
      type,
      value: numValue,
      maxValue: numMax,
      note: note || null,
    })
    setIsSubmitting(false)

    if (res.success) {
      toast.success("Đã lưu điểm")
      setValue("")
      setNote("")
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleDelete = async () => {
    if (!deletingScoreId) return
    const res = await deleteScore(deletingScoreId, classId)
    if (res.success) {
      toast.success("Đã xoá điểm")
      setDeletingScoreId(null)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const columns = [
    {
      accessorKey: "date",
      header: "Ngày",
      cell: ({ row }: any) => {
        const d = new Date(row.original.date)
        return (
          <div className="px-4">
            <p className="font-medium">{format(d, "dd/MM/yyyy")}</p>
            <p className="text-xs text-muted-foreground">
              {format(d, "EEEE", { locale: vi })}
            </p>
          </div>
        )
      },
    },
    {
      id: "student.fullName",
      accessorFn: (row: ScoreRecord) => row.student.fullName,
      header: "Học viên",
      cell: ({ row }: any) => (
        <span className="font-medium">{row.original.student.fullName}</span>
      ),
    },
    {
      id: "type",
      header: "Loại",
      cell: ({ row }: any) => {
        const t = row.original.type as ScoreType
        return (
          <Badge className={SCORE_TYPE_COLORS[t]} variant="secondary">
            {SCORE_TYPE_LABELS[t]}
          </Badge>
        )
      },
    },
    {
      id: "value",
      header: "Điểm",
      cell: ({ row }: any) => {
        const s = row.original
        const percent = (s.value / s.maxValue) * 100
        const color =
          percent >= 80
            ? "text-green-700"
            : percent >= 60
            ? "text-yellow-700"
            : "text-red-700"
        return (
          <span className={`font-bold ${color}`}>
            {s.value} / {s.maxValue}
          </span>
        )
      },
    },
    {
      id: "session",
      header: "Buổi học",
      cell: ({ row }: any) => {
        const session = row.original.session
        if (!session) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <div>
            <p className="text-sm">
              {format(new Date(session.sessionDate), "dd/MM/yyyy")}
            </p>
            {session.topic && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {session.topic}
              </p>
            )}
          </div>
        )
      },
    },
    {
      id: "note",
      header: "Ghi chú",
      cell: ({ row }: any) => (
        <span className="text-xs text-muted-foreground">
          {row.original.note || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeletingScoreId(row.original.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Thống kê tổng quan */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Tổng điểm đã nhập
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{scores.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" /> Loại điểm đã dùng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{typeStats.size}</p>
            <p className="text-xs text-muted-foreground">
              {Array.from(typeStats.keys())
                .slice(0, 3)
                .map((t) => SCORE_TYPE_LABELS[t as ScoreType])
                .join(", ")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> TB lớp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {scores.length > 0
                ? (
                    scores.reduce(
                      (sum, s) => sum + (s.value / s.maxValue) * 100,
                      0
                    ) / scores.length
                  ).toFixed(1) + "%"
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form nhập điểm */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nhập điểm nhanh
          </CardTitle>
          <CardDescription>
            Chọn học viên, loại điểm, nhập điểm. Có thể gắn với buổi học cụ thể.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Học viên *</Label>
              <Select value={studentId} onValueChange={(v) => setStudentId(v as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn học viên" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Loại điểm *</Label>
              <Select value={type} onValueChange={(v) => setType(v as ScoreType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SCORE_TYPE_LABELS) as ScoreType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {SCORE_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Điểm *</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="8.5"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Điểm tối đa *</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Buổi học (tuỳ chọn)</Label>
              <Select value={sessionId} onValueChange={(v) => setSessionId(v as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="Không gắn với buổi cụ thể" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Không gắn buổi —</SelectItem>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {format(new Date(s.sessionDate), "dd/MM/yyyy")}
                      {s.topic ? ` · ${s.topic}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Ghi chú (tuỳ chọn)</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Bài kiểm tra 15 phút, đọc hiểu..."
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Đang lưu..." : "Lưu điểm"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Thống kê theo học viên */}
      {students.length > 0 && scores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo học viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map((student) => {
                const stat = studentStats.get(student.id)
                if (!stat) return null
                const color =
                  stat.average >= 80
                    ? "bg-green-500"
                    : stat.average >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                return (
                  <div key={student.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{student.fullName}</span>
                      <span className="text-muted-foreground">
                        {stat.average.toFixed(1)}% · {stat.count} điểm
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} transition-all`}
                        style={{ width: `${Math.min(stat.average, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bảng lịch sử điểm */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử điểm ({scores.length})</CardTitle>
          <CardDescription>
            Tất cả điểm đã nhập cho lớp này, sắp xếp theo ngày
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scores.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground gap-2">
              <Award className="w-8 h-8 opacity-50" />
              <p>Chưa có điểm nào.</p>
              <p className="text-xs">Dùng form ở trên để nhập điểm.</p>
            </div>
          ) : (
            <DataTable
              columns={columns as any}
              data={JSON.parse(JSON.stringify(scores))}
              searchKey="student.fullName"
              searchPlaceholder="Tìm theo tên học viên..."
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deletingScoreId !== null}
        onOpenChange={(open) => !open && setDeletingScoreId(null)}
        title="Xoá điểm này?"
        description="Hành động này không thể hoàn tác."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
