"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Settings, UserMinus, Award, ClipboardList } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { AddStudentDialog } from "./components/add-student-dialog"
import { ClassScheduleTab } from "./components/class-schedule-tab"
import { ClassScoresTab } from "./components/class-scores-tab"
import { removeStudentFromClass } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ClassDetailClient({
  classData,
  allStudents,
  teachers,
  rooms,
  scores = [],
}: {
  classData: any
  allStudents: any[]
  teachers: { id: string; fullName: string }[]
  rooms: { id: string; name: string; capacity: number }[]
  scores?: any[]
}) {
  const router = useRouter()

  // Format students array for DataTable
  const classStudents = classData.students.map((cs: any) => ({
    ...cs.student,
    classStudentStatus: cs.status,
    joinedAt: cs.joinedAt,
  }))

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
      header: "Tên học viên",
    },
    {
      accessorKey: "phone",
      header: "Số điện thoại",
    },
    {
      accessorKey: "classStudentStatus",
      header: "Trạng thái tại lớp",
      cell: ({ row }: any) => {
        const status = row.getValue("classStudentStatus")
        return (
          <Badge variant={status === "ACTIVE" ? "default" : "destructive"}>
            {status}
          </Badge>
        )
      },
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
            <UserMinus className="w-4 h-4 mr-2" /> Xóa khỏi lớp
          </Button>
        )
      },
    },
  ]

  return (
    <Tabs defaultValue="students" className="space-y-4">
      <TabsList>
        <TabsTrigger value="students" className="gap-2">
          <Users className="w-4 h-4" /> Học viên
        </TabsTrigger>
        <TabsTrigger value="overview" className="gap-2">
          <Settings className="w-4 h-4" /> Tổng quan
        </TabsTrigger>
        <TabsTrigger value="schedule" className="gap-2">
          <Calendar className="w-4 h-4" /> Lịch học
        </TabsTrigger>
        <TabsTrigger value="scores" className="gap-2">
          <Award className="w-4 h-4" /> Điểm số
        </TabsTrigger>
        <TabsTrigger value="notes" className="gap-2">
          <ClipboardList className="w-4 h-4" /> Ghi chú
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
              currentStudentIds={classStudents.map((s: any) => s.id)}
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

      <TabsContent value="overview">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Giáo viên:</span>
                <span className="font-medium">
                  {classData.teacher?.fullName || "Chưa phân công"}
                </span>
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
                <span className="font-medium">
                  {classStudents.length} học viên
                </span>
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
        />
      </TabsContent>

      <TabsContent value="scores" className="space-y-4">
        <ClassScoresTab
          classId={classData.id}
          students={classStudents.map((s: any) => ({
            id: s.id,
            fullName: s.fullName,
          }))}
          sessions={(classData.sessions || []).map((s: any) => ({
            id: s.id,
            sessionDate: s.sessionDate,
            topic: s.topic,
          }))}
          scores={scores}
        />
      </TabsContent>

      <TabsContent value="notes" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Ghi chú lớp học</CardTitle>
            <CardDescription>
              Ghi chú nội bộ của giáo viên cho lớp này
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classData.classNotes && classData.classNotes.length > 0 ? (
              <div className="space-y-3">
                {classData.classNotes.map((note: any) => (
                  <div key={note.id} className="p-3 border rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(note.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground gap-2">
                <ClipboardList className="w-8 h-8 opacity-50" />
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
