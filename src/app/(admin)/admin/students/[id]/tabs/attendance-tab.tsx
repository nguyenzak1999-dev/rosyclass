"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any; color: string }> = {
  PRESENT: { label: "Có mặt", variant: "default", icon: CheckCircle2, color: "text-green-600" },
  ABSENT_WITH_PERMISSION: { label: "Nghỉ có phép", variant: "outline", icon: XCircle, color: "text-yellow-600" },
  ABSENT_WITHOUT_PERMISSION: { label: "Nghỉ không phép", variant: "destructive", icon: XCircle, color: "text-red-600" },
  LATE: { label: "Đi muộn", variant: "secondary", icon: Clock, color: "text-orange-600" },
  MAKE_UP: { label: "Học bù", variant: "outline", icon: CheckCircle2, color: "text-blue-600" },
}

export function AttendanceTab({ student }: { student: any }) {
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

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {consecutiveAbsences >= 2 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Học viên <strong>đã vắng mặt {consecutiveAbsences} buổi liên tiếp</strong>. Cần liên hệ phụ huynh ngay.
          </AlertDescription>
        </Alert>
      )}
      {attendanceRate < 80 && totalSessions > 0 && (
        <Alert className="border-yellow-300 bg-yellow-50 text-yellow-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tỷ lệ chuyên cần <strong>{attendanceRate}%</strong> — dưới mức yêu cầu tối thiểu 80%.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Tổng buổi", value: totalSessions, color: "text-foreground" },
          { label: "Có mặt", value: present, color: "text-green-600" },
          { label: "Nghỉ có phép", value: absentWithPermission, color: "text-yellow-600" },
          { label: "Nghỉ không phép", value: absentWithout, color: "text-red-600" },
          { label: "Đi muộn", value: late, color: "text-orange-600" },
          { label: "Tỷ lệ chuyên cần", value: `${attendanceRate}%`, color: attendanceRate >= 80 ? "text-green-600" : "text-red-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3 text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance history table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lịch sử điểm danh ({totalSessions} buổi)</CardTitle>
        </CardHeader>
        <CardContent>
          {attendances.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-6">Chưa có dữ liệu điểm danh</p>
          ) : (
            <div className="space-y-2">
              {sortedAttendances.map((a: any) => {
                const config = statusConfig[a.status] || { label: a.status, variant: "outline", icon: CheckCircle2, color: "" }
                const Icon = config.icon
                return (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      <div>
                        <p className="text-sm font-medium">
                          {a.session?.topic || a.session?.class?.name || "Buổi học"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {a.session?.sessionDate ? format(new Date(a.session.sessionDate), "dd/MM/yyyy") : "—"}
                          {" "}{a.session?.startTime} – {a.session?.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.note && <span className="text-xs text-muted-foreground">{a.note}</span>}
                      <Badge variant={config.variant as any}>{config.label}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
