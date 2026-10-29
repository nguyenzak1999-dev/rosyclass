"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import type { Testimonial } from "@/generated/prisma/client"
import { Pencil, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ImageUploader } from "@/components/ui/image-uploader"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { upsertTestimonial, type TestimonialFormValues } from "../actions"

function toFormValues(testimonial?: Testimonial): TestimonialFormValues {
  return testimonial
    ? {
        id: testimonial.id,
        authorName: testimonial.authorName,
        authorTitle: testimonial.authorTitle ?? "",
        content: testimonial.content,
        avatar: testimonial.avatar ?? "",
        rating: testimonial.rating,
        isPublished: testimonial.isPublished,
      }
    : { authorName: "", authorTitle: "", content: "", avatar: "", rating: 5, isPublished: true }
}

export function TestimonialDialog({ testimonial }: { testimonial?: Testimonial }) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, setValue, watch, reset, formState } = useForm<TestimonialFormValues>({
    defaultValues: toFormValues(testimonial),
  })

  // Mỗi lần mở lấy lại dữ liệu mới nhất (sau khi lưu, form không được giữ giá trị cũ)
  const handleOpenChange = (next: boolean) => {
    if (next) reset(toFormValues(testimonial))
    setOpen(next)
  }

  const onSubmit = async (values: TestimonialFormValues) => {
    const result = await upsertTestimonial(values)
    if (result.success) {
      toast.success(testimonial ? "Đã cập nhật cảm nhận" : "Đã tạo cảm nhận")
      setOpen(false)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          testimonial ? (
            <Button variant="ghost" size="icon" title="Sửa cảm nhận" />
          ) : (
            <Button />
          )
        }
      >
        {testimonial ? <Pencil className="h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> Thêm cảm nhận</>}
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{testimonial ? "Sửa cảm nhận" : "Thêm cảm nhận học viên"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("id")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tên học viên/phụ huynh</Label>
              <Input {...register("authorName")} />
            </div>
            <div className="space-y-2">
              <Label>Vai trò / thành tích</Label>
              <Input {...register("authorTitle")} placeholder="Phụ huynh lớp Kids, IELTS 7.0..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nội dung cảm nhận</Label>
            <Textarea {...register("content")} className="min-h-[130px]" />
          </div>
          <ImageUploader
            label="Ảnh đại diện"
            value={watch("avatar") || ""}
            onChange={(url) => setValue("avatar", url)}
            folder="testimonials"
            aspectRatio="1/1"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Đánh giá sao</Label>
              <Input type="number" min={1} max={5} {...register("rating")} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Xuất bản</Label>
                <p className="text-xs text-muted-foreground">Chỉ cảm nhận đã xuất bản mới hiện ngoài website.</p>
              </div>
              <Switch checked={watch("isPublished")} onCheckedChange={(checked) => setValue("isPublished", checked)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
