"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"

const dayNames = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]
const dayShort = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

export function ScheduleTab({ student }: { student: any }) {
  const activeClassStudents = student.classStudents?.filter((cs: any) => cs.status === 'ACTIVE') || []

  // Collect all schedules from active classes
  const allSchedules: any[] = []
  activeClassStudents.forEach((cs: any) => {
    cs.class?.schedules?.forEach((s: any) => {
      allSchedules.push({ ...s, className: cs.class.name, courseName: cs.class.course?.name })
    })
  })

  // Sort by dayOfWeek then startTime
  allSchedules.sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek
    return a.startTime.localeCompare(b.startTime)
  })

  // Group by day of week
  const byDay: Record<number, any[]> = {}
  allSchedules.forEach((s) => {
    if (!byDay[s.dayOfWeek]) byDay[s.dayOfWeek] = []
    byDay[s.dayOfWeek].push(s)
  })

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Thời khóa biểu</h3>
        <p className="text-sm text-muted-foreground">Lịch học hàng tuần của học viên từ các lớp đang tham gia</p>
      </div>

      {allSchedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Học viên chưa có lịch học nào.</p>
            <p className="text-sm text-muted-foreground mt-1">Xếp học viên vào lớp để hiển thị thời khóa biểu.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {/* Weekly view */}
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 0].map((day) => (
              <Card key={day} className={byDay[day] ? "border-primary/50 bg-primary/5" : ""}>
                <CardContent className="p-3">
                  <div className={`text-xs font-semibold mb-2 text-center ${byDay[day] ? "text-primary" : "text-muted-foreground"}`}>
                    {dayShort[day]}
                  </div>
                  {byDay[day] ? (
                    byDay[day].map((s: any, i: number) => (
                      <div key={i} className="text-xs bg-primary text-primary-foreground rounded p-1 mb-1 text-center">
                        <div className="font-medium">{s.startTime}</div>
                        <div className="truncate">{s.className}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground text-center py-2">—</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detail list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chi tiết lịch học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allSchedules.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{dayNames[s.dayOfWeek]}</Badge>
                    <div>
                      <p className="font-medium text-sm">{s.className}</p>
                      <p className="text-xs text-muted-foreground">{s.courseName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-mono">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {s.startTime} – {s.endTime}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
