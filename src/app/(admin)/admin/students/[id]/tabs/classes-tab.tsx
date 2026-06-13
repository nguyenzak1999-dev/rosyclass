"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { Plus, GraduationCap, Users, Clock, BookOpen } from "lucide-react"
import { addStudentToClass, removeStudentFromClass } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

const classStatusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  UPCOMING: { label: "Sắp khai giảng", variant: "outline" },
  ACTIVE: { label: "Đang học", variant: "default" },
  COMPLETED: { label: "Đã kết thúc", variant: "secondary" },
  PAUSED: { label: "Tạm dừng", variant: "secondary" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
}

interface ClassesTabProps {
  student: any
  availableClasses?: any[]
}

export function ClassesTab({ student, availableClasses = [] }: ClassesTabProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [selectedClass, setSelectedClass] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const activeClasses = student.classStudents?.filter((cs: any) => cs.status === 'ACTIVE') || []
  const historyClasses = student.classStudents?.filter((cs: any) => cs.status !== 'ACTIVE') || []

  const handleAddToClass = async () => {
    if (!selectedClass) return
    setLoading(true)
    const result = await addStudentToClass(student.id, selectedClass)
    setLoading(false)
    if (result.success) {
      toast.success("Đã xếp lớp thành công!")
      setOpen(false)
      setSelectedClass("")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const handleDropClass = async (classId: string) => {
    if (!confirm("Bạn có chắc muốn xóa học viên khỏi lớp này?")) return
    const result = await removeStudentFromClass(student.id, classId)
    if (result.success) {
      toast.success("Đã xóa học viên khỏi lớp")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Lớp học của học viên</h3>
          <p className="text-sm text-muted-foreground">Quản lý việc tham gia và lịch sử lớp học</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Xếp lớp</Button>} />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Xếp lớp cho học viên</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Chọn lớp phù hợp</Label>
                <Select value={selectedClass} onValueChange={(value) => value && setSelectedClass(value)}>
                  <SelectTrigger>
                    <span className="truncate text-left">
                      {selectedClass
                        ? (() => {
                            const cls = availableClasses.find((c: any) => c.id === selectedClass)
                            if (!cls) return "Chọn lớp học..."
                            const seatsLeft = cls.maxStudents - (cls._count?.students || 0)
                            return `${cls.name} — ${cls.course?.name} (${seatsLeft} chỗ trống)`
                          })()
                        : "Chọn lớp học..."}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">Không có lớp phù hợp</div>
                    ) : (
                      availableClasses.map((cls: any) => {
                        const seatsLeft = cls.maxStudents - (cls._count?.students || 0)
                        return (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} — {cls.course?.name} ({seatsLeft} chỗ trống)
                          </SelectItem>
                        )
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                <Button onClick={handleAddToClass} disabled={!selectedClass || loading}>
                  {loading ? "Đang xếp..." : "Xác nhận xếp lớp"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active classes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-4 w-4" /> Lớp đang học ({activeClasses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-4">Học viên chưa tham gia lớp nào</p>
          ) : (
            <div className="space-y-3">
              {activeClasses.map((cs: any) => (
                <div key={cs.classId} className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{cs.class.name}</span>
                      <Badge variant={classStatusMap[cs.class.status]?.variant || "outline"}>
                        {classStatusMap[cs.class.status]?.label || cs.class.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> {cs.class.course?.name}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {cs.class.schedules?.map((s: any, i: number) => (
                        <span key={i} className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {dayNames[s.dayOfWeek]} {s.startTime}–{s.endTime}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {cs.class._count?.students || "?"}/{cs.class.maxStudents} học viên
                      </span>
                      <span>Tham gia: {format(new Date(cs.joinedAt), "dd/MM/yyyy")}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => handleDropClass(cs.classId)}>
                    Nghỉ lớp
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Class history */}
      {historyClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lịch sử lớp học ({historyClasses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {historyClasses.map((cs: any) => (
                <div key={`${cs.classId}-hist`} className="flex items-start justify-between p-3 rounded-lg border opacity-60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cs.class.name}</span>
                      <Badge variant="secondary">{cs.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{cs.class.course?.name}</p>
                    <p className="text-xs text-muted-foreground">Tham gia: {format(new Date(cs.joinedAt), "dd/MM/yyyy")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
