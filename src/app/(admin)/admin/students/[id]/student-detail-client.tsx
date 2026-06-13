"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Activity, Calendar, CreditCard, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"

import { PersonalInfoTab } from "./tabs/personal-info-tab"
import { ClassesTab } from "./tabs/classes-tab"
import { ScheduleTab } from "./tabs/schedule-tab"
import { AttendanceTab } from "./tabs/attendance-tab"
import { ScoresTab } from "./tabs/scores-tab"
import { PaymentsTab } from "./tabs/payments-tab"
import { NotesTab } from "./tabs/notes-tab"
import { DocumentsTab } from "./tabs/documents-tab"
import { ActivityTab } from "./tabs/activity-tab"

interface StudentDetailClientProps {
  student: any
  availableClasses?: any[]
}

const statusLabelMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Đang học", variant: "default" },
  WAITING_CLASS: { label: "Chờ xếp lớp", variant: "outline" },
  RESERVED: { label: "Bảo lưu", variant: "secondary" },
  PAUSED: { label: "Tạm dừng", variant: "secondary" },
  COMPLETED: { label: "Hoàn thành", variant: "default" },
  DROPPED: { label: "Đã nghỉ", variant: "destructive" },
}

export function StudentDetailClient({ student, availableClasses = [] }: StudentDetailClientProps) {
  const activeClass = student.classStudents?.find((cs: any) => cs.status === 'ACTIVE')
  const statusCfg = statusLabelMap[student.status] || { label: student.status, variant: "outline" }

  const presentCount = student.attendances?.filter((a: any) => a.status === 'PRESENT' || a.status === 'MAKE_UP').length || 0
  const totalSessions = student.attendances?.length || 0
  const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0
  const totalDebt = student.payments?.reduce((acc: number, p: any) => acc + (p.remainingAmount || 0), 0) || 0

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/admin/students" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {student.fullName} {student.code && <span className="text-muted-foreground font-mono text-base font-normal">({student.code})</span>}
            </h1>
            <Badge variant={statusCfg.variant as any}>{statusCfg.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {student.email || "Chưa có email"} • {student.phone || "Chưa có SĐT"}{student.currentLevel ? ` • Trình độ: ${student.currentLevel}` : ""}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1 rounded-lg">
          {[
            ["overview", "Tổng quan"],
            ["personal", "Thông tin"],
            ["classes", "Lớp học"],
            ["schedule", "Lịch học"],
            ["attendance", "Điểm danh"],
            ["scores", "Điểm số"],
            ["payments", "Học phí"],
            ["notes", "Ghi chú"],
            ["documents", "Tài liệu"],
            ["activity", "Hoạt động"],
          ].map(([value, label]) => (
            <TabsTrigger key={value} value={value} className="text-xs sm:text-sm">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          {/* TAB 1: Overview */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lớp hiện tại</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{activeClass ? activeClass.class.name : "Chưa xếp lớp"}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeClass ? activeClass.class.course?.name : "Trình độ: " + (student.currentLevel || "Chưa rõ")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chuyên cần</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-xl font-bold ${attendanceRate < 80 && totalSessions > 0 ? "text-destructive" : ""}`}>
                    {attendanceRate}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{presentCount}/{totalSessions} buổi có mặt</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Học phí còn nợ</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-xl font-bold ${totalDebt > 0 ? "text-destructive" : "text-green-600"}`}>
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalDebt)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Trên {student.payments?.length || 0} hóa đơn</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ngày nhập học</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {student.joinedAt ? format(new Date(student.joinedAt), "dd/MM/yyyy") : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {student.parent ? `Phụ huynh: ${student.parent.fullName}` : "Chưa liên kết phụ huynh"}
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-sm">Ghi chú hồ sơ</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm">{student.notes || <span className="text-muted-foreground italic">Chưa có ghi chú</span>}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Thông tin phụ huynh</CardTitle></CardHeader>
                <CardContent>
                  {student.parent ? (
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{student.parent.fullName}</p>
                      <p className="text-muted-foreground">{student.parent.phone} • {student.parent.relationship || "Phụ huynh"}</p>
                      {student.parent.email && <p className="text-muted-foreground">{student.parent.email}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Chưa liên kết thông tin phụ huynh</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: Personal Info */}
          <TabsContent value="personal">
            <PersonalInfoTab student={student} />
          </TabsContent>

          {/* TAB 3: Classes */}
          <TabsContent value="classes">
            <ClassesTab student={student} availableClasses={availableClasses} />
          </TabsContent>

          {/* TAB 4: Schedule */}
          <TabsContent value="schedule">
            <ScheduleTab student={student} />
          </TabsContent>

          {/* TAB 5: Attendance */}
          <TabsContent value="attendance">
            <AttendanceTab student={student} />
          </TabsContent>

          {/* TAB 6: Scores */}
          <TabsContent value="scores">
            <ScoresTab student={student} />
          </TabsContent>

          {/* TAB 7: Payments */}
          <TabsContent value="payments">
            <PaymentsTab student={student} />
          </TabsContent>

          {/* TAB 8: Notes */}
          <TabsContent value="notes">
            <NotesTab student={student} />
          </TabsContent>

          {/* TAB 9: Documents */}
          <TabsContent value="documents">
            <DocumentsTab student={student} />
          </TabsContent>

          {/* TAB 10: Activity */}
          <TabsContent value="activity">
            <ActivityTab student={student} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
