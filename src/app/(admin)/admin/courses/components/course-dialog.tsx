"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { courseSchema, type CourseFormValues } from "@/lib/schemas/course"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
import { upsertCourse } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CourseDialogProps {
  course?: any
  trigger?: React.ReactNode
}

export function CourseDialog({ course, trigger }: CourseDialogProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: course || {
      name: "",
      slug: "",
      level: "BEGINNER",
      description: "",
      tuitionFee: 0,
      totalSessions: 10,
      sessionDurationMinutes: 90,
      isPublished: true,
      status: "ACTIVE",
    }
  })

  const isPublished = watch("isPublished")
  const level = watch("level")
  const status = watch("status")

  // Reset form when dialog opens with new course data
  React.useEffect(() => {
    if (open) {
      if (course) {
        reset(course)
      } else {
        reset({
          name: "",
          slug: "",
          level: "BEGINNER",
          description: "",
          tuitionFee: 0,
          totalSessions: 10,
          sessionDurationMinutes: 90,
          isPublished: true,
          status: "ACTIVE",
        })
      }
    }
  }, [open, course, reset])

  const onSubmit = async (data: CourseFormValues) => {
    const result = await upsertCourse(data)
    if (result.success) {
      toast.success(course ? "Cập nhật thành công!" : "Thêm mới thành công!")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(trigger as React.ReactElement) || <Button>+ Thêm khóa học</Button>} />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{course ? "Sửa khóa học" : "Thêm khóa học mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên khóa học</Label>
              <Input id="name" {...register("name")} placeholder="IELTS Foundation" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (Đường dẫn)</Label>
              <Input id="slug" {...register("slug")} placeholder="ielts-foundation" />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Cấp độ</Label>
              <Select value={level} onValueChange={(value: any) => setValue("level", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cấp độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="ELEMENTARY">Elementary</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="UPPER_INTERMEDIATE">Upper Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="MASTERY">Mastery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tuitionFee">Học phí (VNĐ)</Label>
              <Input id="tuitionFee" type="number" {...register("tuitionFee")} />
              {errors.tuitionFee && <p className="text-sm text-destructive">{errors.tuitionFee.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalSessions">Số buổi</Label>
              <Input id="totalSessions" type="number" {...register("totalSessions")} />
              {errors.totalSessions && <p className="text-sm text-destructive">{errors.totalSessions.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionDurationMinutes">Thời lượng 1 buổi (phút)</Label>
              <Input id="sessionDurationMinutes" type="number" {...register("sessionDurationMinutes")} />
              {errors.sessionDurationMinutes && <p className="text-sm text-destructive">{errors.sessionDurationMinutes.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái hệ thống</Label>
            <Select value={status} onValueChange={(value: any) => setValue("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Hoạt động (Đang mở)</SelectItem>
                <SelectItem value="INACTIVE">Khóa</SelectItem>
                <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="isPublished" 
              checked={isPublished} 
              onCheckedChange={(checked) => setValue("isPublished", checked === true)} 
            />
            <Label htmlFor="isPublished" className="font-normal cursor-pointer">Hiển thị khóa học lên Website cho học viên đăng ký</Label>
          </div>
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
