"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { teacherSchema, type TeacherFormValues } from "@/lib/schemas/teacher"
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
import { upsertTeacher } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ImageUploader } from "@/components/ui/image-uploader"
import { Switch } from "@/components/ui/switch"

interface TeacherDialogProps {
  teacher?: TeacherFormValues
  trigger?: React.ReactNode
}

export function TeacherDialog({ teacher, trigger }: TeacherDialogProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema) as any,
    defaultValues: teacher || {
      fullName: "",
      email: "",
      phone: "",
      roleCode: "TEACHER",
      status: "ACTIVE",
      showOnHomepage: false,
    }
  })

  const status = watch("status")
  const roleCode = watch("roleCode")

  React.useEffect(() => {
    if (open) {
      if (teacher) {
        reset(teacher)
      } else {
        reset({
          fullName: "",
          email: "",
          phone: "",
          roleCode: "TEACHER",
          status: "ACTIVE",
          showOnHomepage: false,
        })
      }
    }
  }, [open, teacher, reset])

  const onSubmit = async (data: TeacherFormValues) => {
    const result = await upsertTeacher(data as any)
    if (result.success) {
      toast.success(teacher ? "Cập nhật thành công!" : "Thêm mới thành công!")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(trigger as React.ReactElement) || <Button>+ Thêm nhân sự</Button>} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{teacher ? "Sửa thông tin nhân sự" : "Thêm nhân sự mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input id="fullName" {...register("fullName")} placeholder="Nguyễn Văn A" />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="nguyenvana@example.com" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input id="phone" {...register("phone")} placeholder="0901234567" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roleCode">Vai trò</Label>
              <Select value={roleCode} onValueChange={(value: any) => setValue("roleCode", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEACHER">Giáo viên</SelectItem>
                  <SelectItem value="CONSULTANT">Tư vấn viên</SelectItem>
                  <SelectItem value="ACCOUNTANT">Kế toán</SelectItem>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
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
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Tạm ngưng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {roleCode === 'TEACHER' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="specialties">Chuyên môn (Ví dụ: IELTS, Giao tiếp)</Label>
                <Input id="specialties" {...register("specialties")} placeholder="IELTS Expert" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificates">Chứng chỉ (Cách nhau bởi dấu phẩy)</Label>
                <Input id="certificates" {...register("certificates")} placeholder="CELTA, TESOL" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Giới thiệu ngắn (Kinh nghiệm)</Label>
                <Input id="bio" {...register("bio")} placeholder="5 năm kinh nghiệm giảng dạy" />
              </div>
              <ImageUploader
                label="Ảnh đại diện (Avatar)"
                value={watch("avatar") || ""}
                onChange={(url) => setValue("avatar", url)}
                folder="teachers"
                aspectRatio="1/1"
              />
              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                <div>
                  <Label htmlFor="showOnHomepage" className="text-sm font-medium cursor-pointer">
                    Hiển thị trên trang chủ
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Giáo viên sẽ xuất hiện trong phần &ldquo;Giáo viên nổi bật&rdquo;
                  </p>
                </div>
                <Switch
                  id="showOnHomepage"
                  checked={watch("showOnHomepage") ?? false}
                  onCheckedChange={(checked) => setValue("showOnHomepage", checked)}
                />
              </div>
            </>
          )}

          <div className="pt-4 flex justify-end space-x-2">
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
