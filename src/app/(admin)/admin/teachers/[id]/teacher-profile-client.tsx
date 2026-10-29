"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  BookOpen,
  Award,
} from "lucide-react"
import { formatVietnam, vietnamDateKey, vietnamDayRange, vietnamWeekStart } from "@/lib/curriculum"
import { vi } from "date-fns/locale"
import Link from "next/link"
import { DAY_OF_WEEK_LABELS } from "@/lib/schemas/schedule"

interface Teacher {
  id: string
  fullName: string
  phone: string
  email: string | null
  avatar: string | null
  bio: string | null
  hourlyRate: number
  status: string
  showOnHomepage: boolean
  specialties: string | null
  certificates: string | null
  classes: Array<{
    id: string
    name: string
    status: string
    maxStudents: number
    course: { name: string }
    _count: { students: number }
  }>
}

interface SessionLite {
  id: string
  sessionDate: string | Date
  startTime: string
  endTime: string
  status: string
  class: { id: string; name: string }
  room: { name: string } | null
}

interface TeacherProfileClientProps {
  teacher: Teacher
  stats: {
    totalClasses: number
    activeClasses: number
    totalStudents: number
    weeklySessionsCount: number
    monthlyCompleted: number
    baseSalaryThisMonth: number
  }
  weeklySessions: SessionLite[]
  upcomingSessions: SessionLite[]
}

const teacherStatusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Đang dạy", variant: "default" },
  INACTIVE: { label: "Ngừng dạy", variant: "outline" },
}

export default function TeacherProfileClient({
  teacher,
  stats,
  weeklySessions,
  upcomingSessions,
}: TeacherProfileClientProps) {
  const statusConfig = teacherStatusMap[teacher.status] || { label: teacher.status, variant: "outline" as const }

  // Group weekly sessions by day (theo giờ VN để server và trình duyệt chia ngày giống nhau)
  const weekStart = vietnamWeekStart()
  const weekDays = Array.from({ length: 7 }, (_, i) => vietnamDayRange(weekStart, i).start)

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> Tổng lớp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalClasses}</p>
            <p className="text-xs text-muted-foreground">
              {stats.activeClasses} đang hoạt động
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Tổng học viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
            <p className="text-xs text-muted-foreground">đang theo học</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Buổi tuần này
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.weeklySessionsCount}</p>
            <p className="text-xs text-muted-foreground">
              {stats.monthlyCompleted} hoàn thành trong tháng
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Lương tháng này
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(stats.baseSalaryThisMonth)}
            </p>
            <p className="text-xs text-muted-foreground">
              {teacher.hourlyRate.toLocaleString("vi-VN")}đ/giờ
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="w-4 h-4" /> Lịch dạy tuần này
          </TabsTrigger>
          <TabsTrigger value="classes" className="gap-2">
            <BookOpen className="w-4 h-4" /> Lớp đang dạy
          </TabsTrigger>
          <TabsTrigger value="info" className="gap-2">
            <Users className="w-4 h-4" /> Thông tin
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Lịch dạy tuần này</CardTitle>
              <CardDescription>
                Từ {formatVietnam(weekStart, "dd/MM")} đến {formatVietnam(weekDays[6], "dd/MM/yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weeklySessions.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground gap-2">
                  <p>Không có buổi dạy nào trong tuần này.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {weekDays.map((day, idx) => {
                    const dayKey = vietnamDateKey(day)
                    const daySessions = weeklySessions.filter((s) => vietnamDateKey(s.sessionDate) === dayKey)
                    if (daySessions.length === 0) return null
                    return (
                      <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                        <p className="text-sm font-semibold mb-2">
                          {formatVietnam(day, "EEEE, dd/MM/yyyy", { locale: vi })}
                        </p>
                        <div className="space-y-2">
                          {daySessions.map((session) => (
                            <Link
                              key={session.id}
                              href={`/admin/schedules/${session.id}`}
                              className="block p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    {session.startTime} - {session.endTime} · {session.class.name}
                                  </p>
                                  {session.room && (
                                    <p className="text-xs text-muted-foreground">
                                      Phòng: {session.room.name}
                                    </p>
                                  )}
                                </div>
                                <BadgeStatus status={session.status} />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {upcomingSessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>10 buổi sắp tới</CardTitle>
                <CardDescription>Buổi học trong tương lai gần nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {upcomingSessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/admin/schedules/${session.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <p className="font-medium">
                          {formatVietnam(new Date(session.sessionDate), "dd/MM/yyyy")} ·{" "}
                          {session.startTime} - {session.endTime}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.class.name} · {session.room?.name || "—"}
                        </p>
                      </div>
                      <BadgeStatus status={session.status} />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Lớp đang dạy ({stats.totalClasses})</CardTitle>
              <CardDescription>
                Tất cả lớp học mà giáo viên này phụ trách
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teacher.classes.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
                  <p>Giáo viên chưa được phân công lớp nào.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {teacher.classes.map((cls) => (
                    <Link
                      key={cls.id}
                      href={`/admin/classes/${cls.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{cls.name}</p>
                        <p className="text-xs text-muted-foreground">{cls.course.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {cls._count.students}/{cls.maxStudents} HV
                        </span>
                        <BadgeStatus status={cls.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Trạng thái</p>
                  <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hiển thị trên web</p>
                  <Badge variant={teacher.showOnHomepage ? "default" : "outline"}>
                    {teacher.showOnHomepage ? "Có" : "Không"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lương theo giờ</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      maximumFractionDigits: 0,
                    }).format(teacher.hourlyRate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">SĐT</p>
                  <p className="font-medium">{teacher.phone}</p>
                </div>
              </div>

              {teacher.bio && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tiểu sử</p>
                    <p className="text-sm whitespace-pre-wrap">{teacher.bio}</p>
                  </div>
                </>
              )}

              {teacher.specialties && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Chuyên môn
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.specialties.split(/[,;]/).map((s, i) => (
                        <Badge key={i} variant="secondary">
                          {s.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {teacher.certificates && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Chứng chỉ
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.certificates.split(/[,;]/).map((c, i) => (
                        <Badge key={i} variant="outline">
                          {c.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
