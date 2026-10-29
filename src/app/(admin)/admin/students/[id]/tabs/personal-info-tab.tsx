"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  GENDER_ITEMS,
  STUDENT_STATUS_ITEMS,
  studentFormSchema,
  toStudentFormInput,
  toStudentPayload,
  type StudentFormInput,
} from "../../components/student-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { upsertStudent } from "../../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function PersonalInfoTab({ student }: { student: any }) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<StudentFormInput>({
    resolver: zodResolver(studentFormSchema) as any,
    defaultValues: toStudentFormInput(student),
  })

  const status = watch("status")
  const gender = watch("gender")

  const onSubmit = async (data: StudentFormInput) => {
    const result = await upsertStudent(toStudentPayload(data))
    if (result.success) {
      toast.success("Cập nhật thông tin thành công!")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>Cập nhật thông tin liên hệ và hồ sơ của học viên.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="code">Mã học viên</Label>
              <Input id="code" {...register("code")} disabled className="font-mono bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input id="fullName" {...register("fullName")} placeholder="Nguyễn Văn A" />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={status} onValueChange={(val: any) => setValue("status", val)} items={STUDENT_STATUS_ITEMS}>
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

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" {...register("phone")} placeholder="0901234567" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="nguyenvana@example.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select value={gender || ""} onValueChange={(val: any) => setValue("gender", val)} items={GENDER_ITEMS}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input id="address" {...register("address")} placeholder="Số 1, Đường 2, Quận 3..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentLevel">Trình độ hiện tại</Label>
              <Input id="currentLevel" {...register("currentLevel")} placeholder="Ví dụ: Starters, IELTS 5.0" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learningGoal">Mục tiêu học tập</Label>
              <Input id="learningGoal" {...register("learningGoal")} placeholder="Ví dụ: Đạt IELTS 6.5" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="source">Nguồn đăng ký</Label>
              <Input id="source" {...register("source")} placeholder="Ví dụ: Facebook, Người quen giới thiệu..." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Ghi chú thêm</Label>
              <Input id="notes" {...register("notes")} />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
