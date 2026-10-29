"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { courseSchema, type CourseFormValues } from "@/lib/schemas/course"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
  SelectValue,
} from "@/components/ui/select"
import { upsertCourse } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ImageUploader } from "@/components/ui/image-uploader"

import { formatMoneyInput } from "@/lib/utils"
import { courseLevelOptions } from "@/lib/course-levels"

interface CourseDialogProps {
  course?: any
  trigger?: React.ReactNode
}

const EMPTY_COURSE: CourseFormValues = {
  name: "",
  slug: "",
  level: "STARTER",
  description: "",
  thumbnail: "",
  tuitionFee: 0,
  salePrice: null,
  sessionFee: null,
  targetAudience: "",
  learningOutcomes: "",
  totalSessions: 10,
  sessionDurationMinutes: 90,
  isPublished: true,
  status: "ACTIVE",
}

/** Bản ghi DB có null ở các trường chữ (mô tả, ảnh...) mà schema chỉ nhận string: không chuẩn hoá thì nút Lưu im lặng */
function toFormValues(course: any): CourseFormValues {
  if (!course) return EMPTY_COURSE
  return {
    id: course.id,
    name: course.name ?? "",
    slug: course.slug ?? "",
    level: course.level ?? "STARTER",
    description: course.description ?? "",
    thumbnail: course.thumbnail ?? "",
    tuitionFee: course.tuitionFee ?? 0,
    salePrice: course.salePrice ?? null,
    sessionFee: course.sessionFee ?? null,
    targetAudience: course.targetAudience ?? "",
    learningOutcomes: course.learningOutcomes ?? "",
    totalSessions: course.totalSessions ?? 10,
    sessionDurationMinutes: course.sessionDurationMinutes ?? 90,
    isPublished: course.isPublished ?? false,
    status: course.status ?? "ACTIVE",
  }
}

export function CourseDialog({ course, trigger }: CourseDialogProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: toFormValues(course)
  })

  const isPublished = watch("isPublished")
  const level = watch("level")
  const status = watch("status")
  const tuitionFeeVal = watch("tuitionFee")
  const salePriceVal = watch("salePrice")
  const sessionFeeVal = watch("sessionFee")

  // Reset form when dialog opens with new course data
  React.useEffect(() => {
    if (open) {
      reset(toFormValues(course))
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

  const { ref: tuitionFeeRef, ...tuitionFeeRegister } = register("tuitionFee")
  const { ref: salePriceRef, ...salePriceRegister } = register("salePrice")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(trigger as React.ReactElement) || <Button>+ Thêm khóa học</Button>} />
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{course ? "Sửa khóa học" : "Thêm khóa học mới"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit, (formErrors) => {
            const first = Object.values(formErrors)[0]
            toast.error(first?.message ? String(first.message) : "Dữ liệu chưa hợp lệ")
          })}
          className="space-y-4"
        >
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
                  {courseLevelOptions(level).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tuitionFee">Học phí (VNĐ)</Label>
              <Input
                id="tuitionFee"
                type="text"
                inputMode="numeric"
                value={tuitionFeeVal !== undefined && tuitionFeeVal !== null ? formatMoneyInput(tuitionFeeVal) : ""}
                onChange={(e) => {
                  const rawVal = e.target.value
                  const cleanVal = rawVal.replace(/\D/g, "")
                  setValue("tuitionFee", cleanVal ? parseInt(cleanVal, 10) : 0, { shouldValidate: true, shouldDirty: true })
                }}
                ref={tuitionFeeRef}
                name={tuitionFeeRegister.name}
                onBlur={tuitionFeeRegister.onBlur}
                placeholder="0"
              />
              {errors.tuitionFee && <p className="text-sm text-destructive">{errors.tuitionFee.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salePrice">Giá ưu đãi (nếu có)</Label>
              <Input
                id="salePrice"
                type="text"
                inputMode="numeric"
                value={salePriceVal !== undefined && salePriceVal !== null ? formatMoneyInput(salePriceVal) : ""}
                onChange={(e) => {
                  const rawVal = e.target.value
                  const cleanVal = rawVal.replace(/\D/g, "")
                  setValue("salePrice", cleanVal ? parseInt(cleanVal, 10) : null, { shouldValidate: true, shouldDirty: true })
                }}
                ref={salePriceRef}
                name={salePriceRegister.name}
                onBlur={salePriceRegister.onBlur}
                placeholder="Nhập giá ưu đãi..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionFee">Đơn giá/buổi – thu theo tháng</Label>
              <Input
                id="sessionFee"
                type="text"
                inputMode="numeric"
                value={sessionFeeVal !== undefined && sessionFeeVal !== null ? formatMoneyInput(sessionFeeVal) : ""}
                onChange={(e) => {
                  const cleanVal = e.target.value.replace(/\D/g, "")
                  setValue("sessionFee", cleanVal ? parseInt(cleanVal, 10) : null, { shouldValidate: true, shouldDirty: true })
                }}
                placeholder="VD: 150.000"
              />
              {errors.sessionFee && <p className="text-sm text-destructive">{errors.sessionFee.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Đối tượng học viên</Label>
            <Input id="targetAudience" {...register("targetAudience")} placeholder="Học sinh cấp 2, người đi làm..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả khóa học</Label>
            <Textarea id="description" {...register("description")} className="min-h-[90px]" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learningOutcomes">Kết quả đầu ra</Label>
            <Textarea id="learningOutcomes" {...register("learningOutcomes")} className="min-h-[90px]" />
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
                <SelectItem value="DRAFT">Bản nháp</SelectItem>
                <SelectItem value="PUBLISHED">Xuất bản</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ImageUploader
            label="Ảnh thumbnail khóa học"
            value={(watch("thumbnail") as string) || ""}
            onChange={(url) => setValue("thumbnail", url)}
            folder="courses"
            aspectRatio="16/9"
          />

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
