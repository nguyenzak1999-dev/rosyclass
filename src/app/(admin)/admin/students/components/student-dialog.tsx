"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { studentSchema, type StudentFormValues } from "@/lib/schemas/student"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  SelectValue,
} from "@/components/ui/select"
import { upsertStudent } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface StudentDialogProps {
  student?: StudentFormValues
  parents?: any[]
  trigger?: React.ReactNode
}

export function StudentDialog({ student, parents = [], trigger }: StudentDialogProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema) as any,
    defaultValues: student || {
      fullName: "",
      email: "",
      phone: "",
      status: "ACTIVE",
      gender: "",
      address: "",
      source: "",
    }
  })

  const status = watch("status")
  const gender = watch("gender")
  const source = watch("source")
  const parentId = watch("parentId")

  React.useEffect(() => {
    if (open) {
      if (student) {
        // If dateOfBirth is a Date object, convert to YYYY-MM-DD for native date input
        const formattedData = { ...student }
        if (formattedData.dateOfBirth && typeof formattedData.dateOfBirth === 'object') {
          // Keep it as Date object, the input type="date" expects string YYYY-MM-DD
          // We can let react-hook-form handle it if we coerce it to string manually for the input
          // Wait, zod says dateOfBirth is Date, but input type date expects "YYYY-MM-DD"
        }
        reset(formattedData)
      } else {
        reset({
          fullName: "",
          email: "",
          phone: "",
          status: "ACTIVE",
          gender: "",
          address: "",
          source: "",
        })
      }
    }
  }, [open, student, reset])

  const onSubmit = async (data: StudentFormValues) => {
    // If dateOfBirth comes back as string from input, it will be coerced to Date by zod
    const result = await upsertStudent(data as any)
    if (result.success) {
      toast.success(student ? "Cập nhật thành công!" : "Thêm mới thành công!")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(trigger as React.ReactElement) || <Button>+ Thêm học viên</Button>} />
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{student ? "Sửa học viên" : "Thêm học viên mới"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto pr-4 pb-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input id="fullName" {...register("fullName")} placeholder="Nguyễn Văn A" />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" {...register("phone")} placeholder="0901234567" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="nguyenvana@example.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input 
                id="dateOfBirth" 
                type="date" 
                {...register("dateOfBirth")} 
                // Simple trick to format date object to YYYY-MM-DD
                defaultValue={student?.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select value={gender || ""} onValueChange={(value: any) => setValue("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nam">Nam</SelectItem>
                  <SelectItem value="Nữ">Nữ</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={status} onValueChange={(value: any) => setValue("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Đang học</SelectItem>
                  <SelectItem value="WAITING_CLASS">Chờ xếp lớp</SelectItem>
                  <SelectItem value="RESERVED">Bảo lưu</SelectItem>
                  <SelectItem value="PAUSED">Tạm dừng</SelectItem>
                  <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                  <SelectItem value="DROPPED">Đã nghỉ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" {...register("address")} placeholder="Số nhà, đường, phường, quận..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentId">Phụ huynh liên kết</Label>
              <Select value={parentId || "none"} onValueChange={(value: any) => setValue("parentId", value === "none" ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phụ huynh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Không liên kết --</SelectItem>
                  {parents.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.fullName} ({p.phone})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Nguồn học viên</Label>
              <Select value={source || "none"} onValueChange={(value: any) => setValue("source", value === "none" ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Nguồn đến từ đâu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Trống --</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Người quen giới thiệu">Người quen giới thiệu</SelectItem>
                  <SelectItem value="Biển hiệu/Tờ rơi">Biển hiệu/Tờ rơi</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentLevel">Trình độ hiện tại</Label>
              <Input id="currentLevel" {...register("currentLevel")} placeholder="Ví dụ: Starters, Movers, A1..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="learningGoal">Mục tiêu học tập</Label>
              <Input id="learningGoal" {...register("learningGoal")} placeholder="Ví dụ: Đạt IELTS 6.5" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Input id="notes" {...register("notes")} />
          </div>
          
          <div className="pt-4 flex justify-end space-x-2 shrink-0 border-t mt-4 pb-2">
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
