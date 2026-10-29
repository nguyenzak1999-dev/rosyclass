"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Users, Calendar, Settings, UserMinus, Award, ClipboardList, Box, NotebookPen, Sparkles, FileBarChart } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { AddStudentDialog } from "./components/add-student-dialog"
import { ClassScheduleTab } from "./components/class-schedule-tab"
import { ClassScoresTab } from "./components/class-scores-tab"
import { Classroom3DTab } from "./components/classroom-3d/classroom-3d-tab"
import type { ClassroomData } from "./components/classroom-3d/seats"
import { ClassHomeworkTab, type ClassHomework } from "./components/class-homework-tab"
import { ClassSkillsTab, type SkillAssessmentRow } from "./components/class-skills-tab"
import { ClassReportsTab, type ClassReport } from "./components/class-reports-tab"
import { removeStudentFromClass } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { formatVietnam } from "@/lib/curriculum"

export default function ClassDetailClient({
  classData,
  allStudents,
  teachers,
  rooms,
  scores = [],
  classroom,
  learning
}: {
  classData: any
  allStudents: any[]
  teachers: { id: string; fullName: string }[]
  rooms: { id: string; name: string; capacity: number }[]
  scores?: any[]
  classroom: ClassroomData
  learning: {
    canWrite: boolean
    homework: ClassHomework[]
    homeworkSessions: { id: string; label: string }[]
    skillAssessments: SkillAssessmentRow[]
    units: { id: string; order: number; title: string }[]
    defaultUnitId: string | null
    reports: ClassReport[]
  }
}) {
  const router = useRouter()

  // Format students array for DataTable
  const classStudents = classData.students.map((cs: any) => ({
    ...cs.student,
    classStudentStatus: cs.status,
    joinedAt: cs.joinedAt
  }))
  const activeStudents = (classStudents as Array<{ id: string; fullName: string; classStudentStatus: string }>)
    .filter((s) => s.classStudentStatus === "ACTIVE")
    .map((s) => ({ id: s.id, fullName: s.fullName }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "vi"))

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("Bạn có chắc muốn xóa học viên này khỏi lớp?")) return

    const res = await removeStudentFromClass(classData.id, studentId)
    if (res.success) {
      toast.success("Đã xóa học viên khỏi lớp")
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  // Cấu hình columns cho danh sách học viên trong lớp
  const studentColumns = [
    {
      accessorKey: "fullName",
      header: "Tên học viên"
    },
    {
      accessorKey: "phone",
      header: "Số điện thoại"
    },
    {
      accessorKey: "classStudentStatus",
      header: "Trạng thái tại lớp",
      cell: ({ row }: any) => {
        const status = row.getValue("classStudentStatus")
        return <BadgeStatus status={status} />
      }
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const student = row.original
        return (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => handleRemoveStudent(student.id)}
          >
            <UserMinus className="mr-2 h-4 w-4" /> Xóa khỏi lớp
          </Button>
        )
      }
    }
  ]

  return (
    <Tabs defaultValue="students" className="space-y-4">
      <TabsList className="max-w-full flex-wrap justify-start group-data-horizontal/tabs:h-auto">
        <TabsTrigger value="students" className="gap-2">
          <Users className="h-4 w-4" /> Học viên
        </TabsTrigger>
        <TabsTrigger value="classroom-3d" className="gap-2">
          <Box className="h-4 w-4" /> Lớp học 3D
        </TabsTrigger>
        <TabsTrigger value="overview" className="gap-2">
          <Settings className="h-4 w-4" /> Tổng quan
        </TabsTrigger>
        <TabsTrigger value="schedule" className="gap-2">
          <Calendar className="h-4 w-4" /> Lịch học
        </TabsTrigger>
        <TabsTrigger value="homework" className="gap-2">
          <NotebookPen className="h-4 w-4" /> Bài tập
        </TabsTrigger>
        <TabsTrigger value="skills" className="gap-2">
          <Sparkles className="h-4 w-4" /> Đánh giá kỹ năng
        </TabsTrigger>
        <TabsTrigger value="reports" className="gap-2">
          <FileBarChart className="h-4 w-4" /> Báo cáo tiến bộ
        </TabsTrigger>
        <TabsTrigger value="scores" className="gap-2">
          <Award className="h-4 w-4" /> Điểm số
        </TabsTrigger>
        <TabsTrigger value="notes" className="gap-2">
          <ClipboardList className="h-4 w-4" /> Ghi chú
        </TabsTrigger>
      </TabsList>

      <TabsContent value="students" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Danh sách học viên ({classStudents.length}/{classData.maxStudents})
              </CardTitle>
              <CardDescription>Quản lý các học viên đang học trong lớp này</CardDescription>
            </div>
            <AddStudentDialog
              classId={classData.id}
              allStudents={allStudents}
              currentStudentIds={activeStudents.map((s) => s.id)}
            />
          </CardHeader>
          <CardContent>
            <DataTable
              columns={studentColumns}
              data={classStudents}
              searchKey="fullName"
              searchPlaceholder="Tìm học viên trong lớp..."
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="classroom-3d">
        <Classroom3DTab classroom={classroom} />
      </TabsContent>

      <TabsContent value="overview">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Giáo viên:</span>
                <span className="font-medium">{classData.teacher?.fullName || "Chưa phân công"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Chương trình:</span>
                {classData.curriculum ? (
                  <Link href={`/admin/curriculums/${classData.curriculum.id}`} className="truncate font-medium text-primary hover:underline">
                    {classData.curriculum.name}
                  </Link>
                ) : (
                  <span className="font-medium">Chưa gắn</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chi nhánh:</span>
                <span className="font-medium">{classData.branch?.name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sĩ số tối đa:</span>
                <span className="font-medium">{classData.maxStudents} học viên</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sĩ số hiện tại:</span>
                <span className="font-medium">{classStudents.length} học viên</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="schedule" className="space-y-4">
        <ClassScheduleTab
          classId={classData.id}
          schedules={classData.schedules || []}
          sessions={classData.sessions || []}
          teachers={teachers}
          rooms={rooms}
          curriculum={
            classData.curriculum
              ? {
                  id: classData.curriculum.id,
                  name: classData.curriculum.name,
                  gradeLabel: classData.curriculum.gradeLabel,
                  lessonCount: classData.curriculum.units.reduce(
                    (sum: number, unit: { _count: { lessons: number } }) => sum + unit._count.lessons,
                    0
                  ),
                }
              : null
          }
        />
      </TabsContent>

      <TabsContent value="homework" className="space-y-4">
        <ClassHomeworkTab
          classId={classData.id}
          homework={learning.homework}
          students={activeStudents}
          sessions={learning.homeworkSessions}
          canWrite={learning.canWrite}
        />
      </TabsContent>

      <TabsContent value="skills" className="space-y-4">
        <ClassSkillsTab
          classId={classData.id}
          curriculum={classData.curriculum ? { id: classData.curriculum.id, name: classData.curriculum.name } : null}
          units={learning.units}
          defaultUnitId={learning.defaultUnitId}
          students={activeStudents}
          assessments={learning.skillAssessments}
          canWrite={learning.canWrite}
        />
      </TabsContent>

      <TabsContent value="reports" className="space-y-4">
        <ClassReportsTab classId={classData.id} reports={learning.reports} canWrite={learning.canWrite} />
      </TabsContent>

      <TabsContent value="scores" className="space-y-4">
        <ClassScoresTab
          classId={classData.id}
          students={classStudents.map((s: any) => ({
            id: s.id,
            fullName: s.fullName
          }))}
          sessions={(classData.sessions || []).map((s: any) => ({
            id: s.id,
            sessionDate: s.sessionDate,
            topic: s.topic
          }))}
          scores={scores}
        />
      </TabsContent>

      <TabsContent value="notes" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Ghi chú lớp học</CardTitle>
            <CardDescription>Ghi chú nội bộ của giáo viên cho lớp này</CardDescription>
          </CardHeader>
          <CardContent>
            {classData.classNotes && classData.classNotes.length > 0 ? (
              <div className="space-y-3">
                {classData.classNotes.map((note: any) => (
                  <div key={note.id} className="rounded-lg border p-3">
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <p className="text-muted-foreground mt-2 text-xs">
                      {formatVietnam(note.createdAt, "HH:mm:ss dd/MM/yyyy")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground flex h-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed">
                <ClipboardList className="h-8 w-8 opacity-50" />
                <p>Chưa có ghi chú nào.</p>
                <p className="text-xs">Tính năng nhập ghi chú sẽ bổ sung sau.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
