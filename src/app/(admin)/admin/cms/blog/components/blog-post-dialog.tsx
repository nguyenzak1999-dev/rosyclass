"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { blogPostSchema, type BlogPostFormValues } from "@/lib/schemas/blog-post"
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
import { upsertBlogPost } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ImageUploader } from "@/components/ui/image-uploader"

interface BlogPostDialogProps {
  initialData?: any
  trigger?: React.ReactNode
}

export function BlogPostDialog({ initialData, trigger }: BlogPostDialogProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema) as any,
    defaultValues: initialData || {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      thumbnail: "",
      status: "DRAFT",
      seoTitle: "",
      seoDescription: "",
    }
  })

  const status = watch("status")

  React.useEffect(() => {
    if (open) {
      reset(initialData || {
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        thumbnail: "",
        status: "DRAFT",
        seoTitle: "",
        seoDescription: "",
      })
    }
  }, [open, initialData, reset])

  const onSubmit = async (data: BlogPostFormValues) => {
    const result = await upsertBlogPost(data)
    if (result.success) {
      toast.success(initialData ? "Cập nhật thành công!" : "Tạo bài viết thành công!")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(trigger as React.ReactElement) || <Button>+ Viết bài mới</Button>} />
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa bài viết" : "Viết bài viết mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input id="title" {...register("title")} placeholder="Tiêu đề bài viết" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug * (URL)</Label>
              <Input id="slug" {...register("slug")} placeholder="tieu-de-bai-viet" />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>
          </div>

          <ImageUploader
            label="Ảnh thumbnail"
            value={watch("thumbnail") || ""}
            onChange={(url) => setValue("thumbnail", url)}
            folder="blog"
            aspectRatio="16/9"
          />

          <div className="space-y-2">
            <Label htmlFor="excerpt">Mô tả ngắn (Excerpt)</Label>
            <Textarea id="excerpt" className="min-h-[80px]" {...register("excerpt")} placeholder="Tóm tắt nội dung bài viết..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Nội dung *</Label>
            <Textarea id="content" className="min-h-[200px]" {...register("content")} placeholder="Nhập nội dung bài viết..." />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input id="seoTitle" {...register("seoTitle")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái xuất bản</Label>
              <Select value={status} onValueChange={(value: any) => setValue("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Nháp</SelectItem>
                  <SelectItem value="PUBLISHED">Xuất bản</SelectItem>
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
              {isSubmitting ? "Đang lưu..." : "Lưu bài viết"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
