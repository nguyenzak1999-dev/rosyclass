"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { pageSchema, type PageFormValues } from "@/lib/schemas/page"
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
import { upsertPage } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PageDialogProps {
  initialData?: any
  trigger?: React.ReactNode
}

export function PageDialog({ initialData, trigger }: PageDialogProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema) as any,
    defaultValues: initialData || {
      title: "",
      slug: "",
      content: "",
      seoTitle: "",
      seoDescription: "",
      status: "ACTIVE"
    }
  })

  const status = watch("status")

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset(initialData)
      } else {
        reset({
          title: "",
          slug: "",
          content: "",
          seoTitle: "",
          seoDescription: "",
          status: "ACTIVE"
        })
      }
    }
  }, [open, initialData, reset])

  const onSubmit = async (data: PageFormValues) => {
    const result = await upsertPage(data)
    if (result.success) {
      toast.success(initialData ? "Cập nhật thành công!" : "Tạo trang thành công!")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(trigger as React.ReactElement) || <Button>+ Tạo trang mới</Button>} />
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa trang nội dung" : "Tạo trang nội dung mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" {...register("slug")} />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Nội dung HTML/Markdown</Label>
            <Textarea id="content" className="min-h-[150px]" {...register("content")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input id="seoTitle" {...register("seoTitle")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={status} onValueChange={(value: any) => setValue("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Hoạt động (Published)</SelectItem>
                  <SelectItem value="INACTIVE">Khóa</SelectItem>
                  <SelectItem value="DRAFT">Nháp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Textarea id="seoDescription" {...register("seoDescription")} />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu trang"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
