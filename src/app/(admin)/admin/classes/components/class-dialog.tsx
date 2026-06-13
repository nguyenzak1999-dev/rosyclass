"use client"

import * as React from "react"
import { type Resolver, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { classSchema, type ClassFormValues } from "@/lib/schemas/class"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { upsertClass } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ClassDialogProps {
  initialData?: ClassFormValues
  trigger?: React.ReactNode
  courses: { id: string; name: string }[]
  teachers: { id: string; fullName: string }[]
  teachingAssistants: { id: string; fullName: string }[]
  branches: { id: string; name: string }[]
  rooms: { id: string; name: string; capacity: number; branchId: string; branch: { name: string } }[]
  students: { id: string; fullName: string; phone: string | null; email: string | null }[]
  defaultOpen?: boolean
}

const DEFAULT_CLASS_FORM_VALUES: ClassFormValues = {
  name: "",
  courseId: "",
  maxStudents: 15,
  startDate: null,
  expectedEndDate: null,
  status: "UPCOMING",
  teacherId: null,
  teachingAssistantId: null,
  branchId: null,
  roomId: null,
  studentIds: [],
  notes: "",
}

const CLASS_STATUS_LABELS: Record<ClassFormValues["status"], string> = {
  UPCOMING: "Sắp mở",
  ACTIVE: "Đang học",
  PAUSED: "Tạm dừng",
  COMPLETED: "Đã kết thúc",
  CANCELLED: "Đã hủy",
}

export function ClassDialog({
  initialData,
  trigger,
  courses,
  teachers,
  teachingAssistants,
  branches,
  rooms,
  students,
  defaultOpen = false,
}: ClassDialogProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [studentSearch, setStudentSearch] = React.useState("")
  const router = useRouter()
  
  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting }, reset } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema) as Resolver<ClassFormValues>,
    defaultValues: normalizeClassFormValues(initialData)
  })

  const status = useWatch({ control, name: "status" })
  const courseId = useWatch({ control, name: "courseId" })
  const teacherId = useWatch({ control, name: "teacherId" })
  const teachingAssistantId = useWatch({ control, name: "teachingAssistantId" })
  const branchId = useWatch({ control, name: "branchId" })
  const roomId = useWatch({ control, name: "roomId" })
  const studentIds = useWatch({ control, name: "studentIds" }) || []
  const availableRooms = React.useMemo(
    () => rooms.filter((room) => !branchId || room.branchId === branchId),
    [branchId, rooms]
  )
  const filteredStudents = React.useMemo(() => {
    const query = studentSearch.trim().toLowerCase()
    if (!query) return students

    return students.filter((student) =>
      [student.fullName, student.phone, student.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    )
  }, [studentSearch, students])
  const selectedCourse = courses.find((course) => course.id === courseId)
  const selectedTeacher = teachers.find((teacher) => teacher.id === teacherId)
  const selectedAssistant = teachingAssistants.find((assistant) => assistant.id === teachingAssistantId)
  const selectedBranch = branches.find((branch) => branch.id === branchId)
  const selectedRoom = rooms.find((room) => room.id === roomId)

  const toggleStudent = (studentId: string, checked: boolean) => {
    const nextStudentIds = checked
      ? Array.from(new Set([...studentIds, studentId]))
      : studentIds.filter((id) => id !== studentId)

    setValue("studentIds", nextStudentIds, { shouldDirty: true })
  }

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset(normalizeClassFormValues(initialData))
      } else {
        reset(DEFAULT_CLASS_FORM_VALUES)
      }
    }
  }, [open, initialData, reset])

  React.useEffect(() => {
    if (roomId && branchId) {
      const selectedRoom = rooms.find((room) => room.id === roomId)
      if (selectedRoom && selectedRoom.branchId !== branchId) {
        setValue("roomId", null)
      }
    }
  }, [branchId, roomId, rooms, setValue])

  const onSubmit = async (data: ClassFormValues) => {
    const result = await upsertClass(data)
    if (result.success) {
      toast.success(initialData ? "Cập nhật thành công!" : "Thêm mới thành công!")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(trigger as React.ReactElement) || <Button>+ Thêm Lớp học</Button>} />
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa Lớp học" : "Thêm Lớp học"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-3">
            <p className="text-sm font-medium">Thông tin lớp</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Tên lớp học *</Label>
                <Input id="name" {...register("name")} placeholder="IELTS-F-01" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseId">Thuộc Khóa học *</Label>
                <Select
                  value={courseId}
                  onValueChange={(value) => {
                    if (value) {
                      setValue("courseId", value)
                    }
                  }}
                >
                  <SelectTrigger>
                    <span className="truncate text-left">
                      {selectedCourse?.name || "Chọn khóa học"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.courseId && <p className="text-sm text-destructive">{errors.courseId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    if (value) {
                      setValue("status", value as ClassFormValues["status"])
                    }
                  }}
                >
                  <SelectTrigger>
                    <span className="truncate text-left">
                      {CLASS_STATUS_LABELS[status] || "Chọn trạng thái"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPCOMING">Sắp mở</SelectItem>
                    <SelectItem value="ACTIVE">Đang học</SelectItem>
                    <SelectItem value="PAUSED">Tạm dừng</SelectItem>
                    <SelectItem value="COMPLETED">Đã kết thúc</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Thời gian</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Sĩ số tối đa</Label>
                <Input id="maxStudents" type="number" min={1} {...register("maxStudents")} />
                {errors.maxStudents && <p className="text-sm text-destructive">{errors.maxStudents.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày khai giảng</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
                {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedEndDate">Ngày kết thúc dự kiến</Label>
                <Input id="expectedEndDate" type="date" {...register("expectedEndDate")} />
                {errors.expectedEndDate && <p className="text-sm text-destructive">{errors.expectedEndDate.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Nhân sự</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Giáo viên chính</Label>
                <Select
                  value={teacherId || "none"}
                  onValueChange={(value) => setValue("teacherId", value === "none" ? null : value)}
                >
                  <SelectTrigger>
                    <span className="truncate text-left">
                      {selectedTeacher?.fullName || "Chưa phân công"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Chưa phân công</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Trợ giảng / phụ trách lớp</Label>
                <Select
                  value={teachingAssistantId || "none"}
                  onValueChange={(value) => setValue("teachingAssistantId", value === "none" ? null : value)}
                >
                  <SelectTrigger>
                    <span className="truncate text-left">
                      {selectedAssistant?.fullName || "Chưa phân công"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Chưa phân công</SelectItem>
                    {teachingAssistants.map((assistant) => (
                      <SelectItem key={assistant.id} value={assistant.id}>
                        {assistant.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Địa điểm</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Chi nhánh</Label>
                <Select
                  value={branchId || "none"}
                  onValueChange={(value) => setValue("branchId", value === "none" ? null : value)}
                >
                  <SelectTrigger>
                    <span className="truncate text-left">
                      {selectedBranch?.name || "Chưa chọn chi nhánh"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Chưa chọn chi nhánh</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Phòng học mặc định</Label>
                <Select
                  value={roomId || "none"}
                  onValueChange={(value) => setValue("roomId", value === "none" ? null : value)}
                >
                  <SelectTrigger>
                    <span className="truncate text-left">
                      {selectedRoom
                        ? `${selectedRoom.name} · ${selectedRoom.branch.name}`
                        : "Chưa chọn phòng"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Chưa chọn phòng</SelectItem>
                    {availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} · {room.branch.name} · {room.capacity} chỗ
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {branchId && availableRooms.length === 0 && (
                  <p className="text-xs text-muted-foreground">Chi nhánh này chưa có phòng đang hoạt động.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Học viên trong lớp</p>
              <Badge variant="secondary">{studentIds.length} đã chọn</Badge>
            </div>
            <Input
              value={studentSearch}
              onChange={(event) => setStudentSearch(event.target.value)}
              placeholder="Tìm học viên theo tên, SĐT, email..."
            />
            <ScrollArea className="h-52 rounded-md border">
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Không tìm thấy học viên phù hợp
                </div>
              ) : (
                <div className="divide-y">
                  {filteredStudents.map((student) => {
                    const checked = studentIds.includes(student.id)

                    return (
                      <label
                        key={student.id}
                        className="flex cursor-pointer items-center gap-3 p-3 hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => toggleStudent(student.id, value === true)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{student.fullName}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {[student.phone, student.email].filter(Boolean).join(" · ") || "Chưa có liên hệ"}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Ghi chú..." />
          </div>

          <div className="grid gap-2 pt-4 sm:flex sm:justify-end sm:space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu lại"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function normalizeClassFormValues(initialData?: ClassFormValues): ClassFormValues {
  if (!initialData) return DEFAULT_CLASS_FORM_VALUES

  return {
    ...DEFAULT_CLASS_FORM_VALUES,
    ...initialData,
    startDate: toDateInputValue(initialData.startDate) as unknown as Date | null,
    expectedEndDate: toDateInputValue(initialData.expectedEndDate) as unknown as Date | null,
    studentIds: initialData.studentIds ?? [],
    notes: initialData.notes ?? "",
  }
}

function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) return null
  return new Date(value).toISOString().slice(0, 10)
}
