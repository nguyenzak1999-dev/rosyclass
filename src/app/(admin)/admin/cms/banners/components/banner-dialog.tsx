"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Banner } from "@prisma/client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil } from "lucide-react"
import { ImageUploader } from "@/components/ui/image-uploader"

import { createBanner, updateBanner } from "../actions"

const bannerSchema = z.object({
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  image: z.string().min(1, "Vui lòng nhập URL hình ảnh"),
  buttonText: z.string().optional().nullable(),
  buttonUrl: z.string().optional().nullable(),
  position: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
})

interface BannerDialogProps {
  banner?: Banner
}

export function BannerDialog({ banner }: BannerDialogProps) {
  const [open, setOpen] = useState(false)
  const isEditing = !!banner

  const form = useForm<z.infer<typeof bannerSchema>>({
    resolver: zodResolver(bannerSchema) as any,
    defaultValues: {
      title: banner?.title || "",
      subtitle: banner?.subtitle || "",
      image: banner?.image || "",
      buttonText: banner?.buttonText || "",
      buttonUrl: banner?.buttonUrl || "",
      position: banner?.position || 0,
      isActive: banner?.isActive ?? true,
    },
  })

  async function onSubmit(values: z.infer<typeof bannerSchema>) {
    try {
      if (isEditing) {
        const res = await updateBanner(banner.id, values)
        if (!res.success) throw new Error(res.error)
        toast.success("Cập nhật banner thành công")
      } else {
        const res = await createBanner(values)
        if (!res.success) throw new Error(res.error)
        toast.success("Thêm banner thành công")
      }
      setOpen(false)
      form.reset()
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra")
    }
  }

  const imageUrl = form.watch("image")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEditing ? (
            <Button variant="ghost" size="icon" title="Sửa" />
          ) : (
            <Button />
          )
        }
      >
        {isEditing ? (
          <Pencil className="h-4 w-4" />
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" /> Thêm Banner
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Chỉnh sửa Banner" : "Thêm Banner mới"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormMessage />
                  <ImageUploader
                    label="Hình ảnh Banner *"
                    required
                    value={field.value || ""}
                    onChange={field.onChange}
                    folder="banners"
                    aspectRatio="16/9"
                  />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Khóa học mới..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả phụ</FormLabel>
                    <FormControl>
                      <Input placeholder="Dòng mô tả nhỏ..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buttonText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Nút bấm</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Đăng ký ngay" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buttonUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Nút bấm</FormLabel>
                    <FormControl>
                      <Input placeholder="/khoa-hoc" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vị trí (Thứ tự)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-8">
                    <div className="space-y-0.5">
                      <FormLabel>Trạng thái</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Đang lưu..." : (isEditing ? "Lưu thay đổi" : "Tạo Banner")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
