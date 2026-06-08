"use client"

import * as React from "react"
import { type Resolver, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { classSchema, type ClassFormValues } from "@/lib/schemas/class"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { upsertClass } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ClassDialogProps {
  initialData?: ClassFormValues
  trigger?: React.ReactNode
  courses: { id: string; name: string }[]
  defaultOpen?: boolean
}

export function ClassDialog({ initialData, trigger, courses, defaultOpen = false }: ClassDialogProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const router = useRouter()
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema) as Resolver<ClassFormValues>,
    defaultValues: initialData || {
      name: "",
      courseId: "",
      maxStudents: 15,
      status: "UPCOMING",
    }
  })

  const status = watch("status")
  const courseId = watch("courseId")

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset(initialData)
      } else {
        reset({
          name: "",
          courseId: "",
          maxStudents: 15,
          status: "UPCOMING",
        })
      }
    }
  }, [open, initialData, reset])

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
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa Lớp học" : "Thêm Lớp học"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
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
                <SelectValue placeholder="Chọn khóa học" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.courseId && <p className="text-sm text-destructive">{errors.courseId.message}</p>}
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxStudents">Sĩ số tối đa</Label>
              <Input id="maxStudents" type="number" {...register("maxStudents")} />
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
                  <SelectValue placeholder="Chọn trạng thái" />
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
