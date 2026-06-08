"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

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
import { ImageUploader } from "@/components/ui/image-uploader"

import { createBanner, updateBanner } from "../actions"

const bannerSchema = z.object({
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  image: z.string().min(1, "Vui lòng nhập URL hình ảnh"),
  buttonText: z.string().optional().nullable(),
  buttonUrl: z.string().optional().nullable(),
  position: z.number().default(0),
  isActive: z.boolean().default(true),
})

type BannerFormInput = z.input<typeof bannerSchema>
type BannerFormValues = z.output<typeof bannerSchema>

export type BannerFormData = BannerFormValues & {
  id: string
}

interface BannerFormProps {
  banner?: BannerFormData
  totalBanners?: number
}

export function BannerForm({ banner, totalBanners }: BannerFormProps) {
  const router = useRouter()
  const isEditing = !!banner

  const form = useForm<BannerFormInput, unknown, BannerFormValues>({
    resolver: zodResolver(bannerSchema),
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

  async function onSubmit(values: BannerFormValues) {
    try {
      const result = isEditing
        ? await updateBanner(banner.id, values)
        : await createBanner(values)

      if (!result.success) throw new Error(result.error)

      toast.success(isEditing ? "Cập nhật banner thành công" : "Thêm banner thành công")
      router.push("/admin/cms/banners")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    }
  }

  return (
    <div className="rounded-lg border bg-card p-5">
      {totalBanners !== undefined && (
        <p className="mb-5 text-sm text-muted-foreground">
          Số lượng hero đang có: <span className="font-medium text-foreground">{totalBanners}</span>
        </p>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormMessage />
                <ImageUploader
                  label="Ảnh nền Hero *"
                  required
                  value={field.value || ""}
                  onChange={field.onChange}
                  folder="hero"
                  aspectRatio="16/9"
                />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Giao tiếp tự tin" {...field} value={field.value || ""} />
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
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Input placeholder="Dòng mô tả ngắn trên Hero..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vị trí (Thứ tự)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex min-h-10 flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel>Trạng thái</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/cms/banners")}>
              Hủy
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo Hero"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
