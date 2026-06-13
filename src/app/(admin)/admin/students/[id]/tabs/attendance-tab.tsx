"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  CalendarRange,
  Search,
  PlusCircle,
  RotateCcw
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { bookMakeUpSession, cancelBookedMakeUp, getAvailableSessionsForMakeUp } from "@/app/(admin)/admin/attendance/actions"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any; color: string }> = {
  PRESENT: { label: "Có mặt", variant: "default", icon: CheckCircle2, color: "text-green-600" },
  ABSENT_WITH_PERMISSION: { label: "Nghỉ có phép", variant: "outline", icon: XCircle, color: "text-yellow-600" },
  ABSENT_WITHOUT_PERMISSION: { label: "Nghỉ không phép", variant: "destructive", icon: XCircle, color: "text-red-600" },
  LATE: { label: "Đi muộn", variant: "secondary", icon: Clock, color: "text-orange-600" },
  MAKE_UP: { label: "Học bù", variant: "outline", icon: CheckCircle2, color: "text-blue-600" },
}

export function AttendanceTab({ student }: { student: any }) {
  const router = useRouter()
  
  // Modal booking state
  const [isBookingOpen, setIsBookingOpen] = React.useState(false)
  const [sessionsList, setSessionsList] = React.useState<any[]>([])
  const [loadingSessions, setLoadingSessions] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [submittingBooking, setSubmittingBooking] = React.useState<string | null>(null)

  const attendances = student.attendances || []

  const totalSessions = attendances.length
  const present = attendances.filter((a: any) => a.status === 'PRESENT').length
  const absentWithPermission = attendances.filter((a: any) => a.status === 'ABSENT_WITH_PERMISSION').length
  const absentWithout = attendances.filter((a: any) => a.status === 'ABSENT_WITHOUT_PERMISSION').length
  const late = attendances.filter((a: any) => a.status === 'LATE').length
  const makeUp = attendances.filter((a: any) => a.status === 'MAKE_UP').length
  const attendanceRate = totalSessions > 0 ? Math.round(((present + makeUp) / totalSessions) * 100) : 0

  // Check consecutive absences
  const sortedAttendances = [...attendances].sort((a: any, b: any) => 
    new Date(b.session?.sessionDate || 0).getTime() - new Date(a.session?.sessionDate || 0).getTime()
  )
  let consecutiveAbsences = 0
  for (const a of sortedAttendances) {
    if (a.status === 'ABSENT_WITHOUT_PERMISSION' || a.status === 'ABSENT_WITH_PERMISSION') {
      consecutiveAbsences++
    } else {
      break
    }
  }

  // Load future sessions for makeup booking
  const handleOpenBooking = async () => {
    setIsBookingOpen(true)
    setLoadingSessions(true)
    const res = await getAvailableSessionsForMakeUp(student.id)
    if (res.success && res.data) {
      setSessionsList(res.data)
    } else {
      toast.error(res.error || "Không thể tải danh sách buổi học")
    }
    setLoadingSessions(false)
  }

  // Book makeup session
  const handleConfirmBooking = async (sessionId: string) => {
    setSubmittingBooking(sessionId)
    const res = await bookMakeUpSession(student.id, sessionId)
    if (res.success) {
      toast.success("Đặt lịch học bù thành công")
      setIsBookingOpen(false)
      router.refresh()
    } else {
      toast.error(res.error)
    }
    setSubmittingBooking(null)
  }

  // Cancel booking
  const handleCancelBooking = async (sessionId: string) => {
    if (!confirm("Bạn có chắc chắn muốn huỷ lịch học bù đã đặt cho học viên này?")) return
    const res = await cancelBookedMakeUp(student.id, sessionId)
    if (res.success) {
      toast.success("Đã huỷ lịch học bù")
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  // Filtered available sessions
  const filteredSessions = React.useMemo(() => {
    if (!searchTerm.trim()) return sessionsList
    const term = searchTerm.toLowerCase()
    return sessionsList.filter(s => 
      s.className.toLowerCase().includes(term) ||
      s.courseName.toLowerCase().includes(term) ||
      s.level.toLowerCase().includes(term) ||
      (s.topic && s.topic.toLowerCase().includes(term))
    )
  }, [sessionsList, searchTerm])

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {consecutiveAbsences >= 2 && (
        <Alert variant="destructive" className="rounded-lg shadow-sm border border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Học viên <strong>đã vắng mặt {consecutiveAbsences} buổi liên tiếp</strong>. Cần liên hệ phụ huynh ngay.
          </AlertDescription>
        </Alert>
      )}
      {attendanceRate < 80 && totalSessions > 0 && (
        <Alert className="border-yellow-300 bg-yellow-50/50 text-yellow-800 rounded-lg shadow-sm">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tỷ lệ chuyên cần <strong>{attendanceRate}%</strong> — dưới mức yêu cầu tối thiểu 80%.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Tổng buổi", value: totalSessions, color: "text-foreground" },
          { label: "Có mặt", value: present, color: "text-green-600" },
          { label: "Nghỉ có phép", value: absentWithPermission, color: "text-yellow-600" },
          { label: "Nghỉ không phép", value: absentWithout, color: "text-red-600" },
          { label: "Đi muộn", value: late, color: "text-orange-600" },
          { label: "Tỷ lệ chuyên cần", value: `${attendanceRate}%`, color: attendanceRate >= 80 ? "text-green-600" : "text-red-600" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="border border-muted-foreground/10 shadow-sm hover:shadow transition-shadow">
            <CardContent className="pt-4 pb-3 text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleOpenBooking} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
          <PlusCircle className="h-4 w-4 mr-1.5" /> Xếp lịch học bù
        </Button>
      </div>

      <Card className="border border-muted-foreground/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><CalendarRange className="h-5 w-5"/>Lịch sử điểm danh ({totalSessions} buổi)</CardTitle>
        </CardHeader>
        <CardContent>
          {attendances.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-8">Chưa có dữ liệu điểm danh</p>
          ) : (
            <div className="space-y-3">
              {sortedAttendances.map((a: any) => {
                const config = statusConfig[a.status] || { label: a.status, variant: "outline", icon: CheckCircle2, color: "" }
                const Icon = config.icon
                return (
                  <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border hover:bg-accent/10 transition-colors gap-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {a.session?.topic || a.session?.class?.name || "Buổi học"}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {a.session?.sessionDate ? format(new Date(a.session.sessionDate), "dd/MM/yyyy") : "—"}
                          {" • "}{a.session?.startTime} – {a.session?.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {a.note && <span className="text-xs text-muted-foreground italic max-w-xs truncate">{a.note}</span>}
                      <Badge variant={config.variant as any}>{config.label}</Badge>
                      {a.status === 'MAKE_UP' && (
                        <Button size="sm" variant="destructive" onClick={() => handleCancelBooking(a.sessionId)}>
                          Huỷ bù
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-emerald-600" />
              Đặt lịch học bù cho học viên
            </DialogTitle>
            <DialogDescription>
              Chọn một buổi học tương đương trong tương lai để xếp học viên vào học bù.
            </DialogDescription>
          </DialogHeader>

          {/* Search filter */}
          <div className="relative my-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên lớp, khóa học, trình độ..."
              className="pl-9 bg-background h-10"
            />
          </div>

          {loadingSessions ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
              <RotateCcw className="h-6 w-6 animate-spin text-primary" />
              Đang tải danh sách lớp học khả dụng...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
              Không tìm thấy buổi học nào khả dụng.
            </div>
          ) : (
            <div className="space-y-3 pr-1">
              {filteredSessions.map((s) => (
                <div key={s.id} className="p-3.5 rounded-lg border hover:border-emerald-500 hover:bg-emerald-50/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">
                        {s.className}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold py-0">
                        {s.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Khóa học: <span className="font-semibold">{s.courseName}</span>
                    </p>
                    {s.topic && (
                      <p className="text-xs text-muted-foreground italic">
                        Chủ đề: {s.topic}
                      </p>
                    )}
                    <p className="text-xs text-slate-700 font-medium flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      {format(new Date(s.sessionDate), "dd/MM/yyyy")} • {s.startTime} - {s.endTime}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Giáo viên: {s.teacherName}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shrink-0 self-end sm:self-center"
                    disabled={submittingBooking !== null}
                    onClick={() => handleConfirmBooking(s.id)}
                  >
                    {submittingBooking === s.id ? "Đang đặt..." : "Chọn buổi này"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
