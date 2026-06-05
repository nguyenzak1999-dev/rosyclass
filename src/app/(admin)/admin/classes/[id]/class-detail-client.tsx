"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Settings, UserMinus, Plus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { AddStudentDialog } from "./components/add-student-dialog"
import { removeStudentFromClass } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ClassDetailClient({ classData, allStudents }: { classData: any, allStudents: any[] }) {
  const router = useRouter()
  
  // Format students array for DataTable
  const classStudents = classData.students.map((cs: any) => ({
    ...cs.student,
    classStudentStatus: cs.status,
    joinedAt: cs.joinedAt
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
          <Badge variant={status === 'ACTIVE' ? "default" : "destructive"}>
            {status}
          </Badge>
        )
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
            <UserMinus className="w-4 h-4 mr-2" /> Xóa khỏi lớp
          </Button>
        )
      }
    }
  ]

  return (
    <Tabs defaultValue="students" className="space-y-4">
      <TabsList>
        <TabsTrigger value="students" className="gap-2">
          <Users className="w-4 h-4" /> Danh sách học viên
        </TabsTrigger>
        <TabsTrigger value="overview" className="gap-2">
          <Settings className="w-4 h-4" /> Tổng quan
        </TabsTrigger>
        <TabsTrigger value="schedule" className="gap-2">
          <Calendar className="w-4 h-4" /> Lịch học & Điểm danh
        </TabsTrigger>
      </TabsList>

      <TabsContent value="students" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Danh sách học viên ({classStudents.length}/{classData.maxStudents})</CardTitle>
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
                <span className="font-medium">{classData.teacher?.fullName || "Chưa phân công"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chi nhánh:</span>
                <span className="font-medium">{classData.branch?.name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sĩ số tối đa:</span>
                <span className="font-medium">{classData.maxStudents} học viên</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="schedule">
        <Card>
          <CardHeader>
            <CardTitle>Lịch học & Điểm danh</CardTitle>
            <CardDescription>Tính năng sắp ra mắt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Các buổi học sẽ hiển thị ở đây</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
