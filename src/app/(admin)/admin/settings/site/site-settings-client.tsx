"use client"

import { useForm, useWatch } from "react-hook-form"
import { useState } from "react"
import { type SiteSettings } from "@/lib/site-settings"
import { saveSiteSettings } from "./actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Phone, MapPin, Search, Share2, Building2, Save, LayoutTemplate, CreditCard, QrCode } from "lucide-react"
import { ImageUploader } from "@/components/ui/image-uploader"

export default function SiteSettingsClient({ settings }: { settings: SiteSettings }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, control, setValue } = useForm<SiteSettings>({
    defaultValues: settings
  })

  const logoUrl = useWatch({ control, name: "logoUrl" })
  const faviconUrl = useWatch({ control, name: "faviconUrl" })
  const ogImage = useWatch({ control, name: "ogImage" })

  const onSubmit = async (data: SiteSettings) => {
    setIsSubmitting(true)
    const result = await saveSiteSettings(data)
    setIsSubmitting(false)

    if (result.success) {
      toast.success("Đã lưu cài đặt website!")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-4xl flex-col gap-4 pb-20 sm:gap-6 sm:pb-0">
      <input type="hidden" {...register("logoUrl")} />
      <input type="hidden" {...register("faviconUrl")} />
      <input type="hidden" {...register("ogImage")} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Cài đặt Website</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">Quản lý thông tin thương hiệu, liên hệ, SEO và mạng xã hội</p>
        </div>
        <Button type="submit" disabled={isSubmitting} className="hidden gap-2 sm:inline-flex">
          <Save className="w-4 h-4" />
          {isSubmitting ? "Đang lưu..." : "Lưu tất cả"}
        </Button>
      </div>

      {/* Thương hiệu */}
      <Card className="gap-3">
        <CardHeader className="gap-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" /> Thông tin thương hiệu
          </CardTitle>
          <CardDescription>Tên trường, khẩu hiệu, logo và favicon hiển thị trên website</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tên trường / Thương hiệu *</Label>
            <Input {...register("siteName")} placeholder="RosyClass" />
          </div>
          <div className="space-y-2">
            <Label>Khẩu hiệu (Tagline)</Label>
            <Input {...register("tagline")} placeholder="Tiếng Anh chuẩn quốc tế" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2">
            <ImageUploader
              label="Logo (PNG/SVG – nền trong suốt, khuyến nghị 200×60px)"
              value={logoUrl || ""}
              onChange={(url) => setValue("logoUrl", url)}
              folder="site"
              aspectRatio="200/60"
            />
            <ImageUploader
              label="Favicon (ICO/PNG – 32×32px hoặc 64×64px)"
              value={faviconUrl || ""}
              onChange={(url) => setValue("faviconUrl", url)}
              folder="site"
              aspectRatio="1/1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liên hệ */}
      <Card className="gap-3">
        <CardHeader className="gap-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4" /> Thông tin liên hệ
          </CardTitle>
          <CardDescription>Hiển thị ở Footer, trang Về chúng tôi và kết quả tìm kiếm Google</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Phone className="w-3 h-3" /> Số điện thoại</Label>
            <Input {...register("phone")} placeholder="1900 1234" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Globe className="w-3 h-3" /> Email liên hệ</Label>
            <Input {...register("email")} placeholder="contact@rosyclass.edu.vn" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Địa chỉ</Label>
            <Input {...register("address")} placeholder="123 Nguyễn Văn Linh, Đà Nẵng" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Giờ hoạt động</Label>
            <Input {...register("workingHours")} placeholder="Thứ 2 – Chủ Nhật: 7:00 – 21:00" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Google Maps Embed URL</Label>
            <Input {...register("googleMapEmbedUrl")} placeholder="https://www.google.com/maps/embed?pb=..." />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Bản quyền (Copyright)</Label>
            <Input {...register("copyright")} placeholder="© 2026 RosyClass English Center. All rights reserved." />
          </div>
        </CardContent>
      </Card>


      {/* Mạng xã hội */}
      <Card className="gap-3">
        <CardHeader className="gap-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4" /> Mạng xã hội
          </CardTitle>
          <CardDescription>Liên kết mạng xã hội hiển thị ở Footer và trang Về chúng tôi</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Facebook (URL)</Label>
            <Input {...register("facebook")} placeholder="https://facebook.com/rosyclass" />
          </div>
          <div className="space-y-2">
            <Label>YouTube (URL)</Label>
            <Input {...register("youtube")} placeholder="https://youtube.com/@rosyclass" />
          </div>
          <div className="space-y-2">
            <Label>Zalo (URL hoặc số điện thoại)</Label>
            <Input {...register("zalo")} placeholder="https://zalo.me/rosyclass" />
          </div>
          <div className="space-y-2">
            <Label>TikTok (URL)</Label>
            <Input {...register("tiktok")} placeholder="https://tiktok.com/@rosyclass" />
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card className="gap-3">
        <CardHeader className="gap-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" /> SEO & Mạng xã hội (Default)
          </CardTitle>
          <CardDescription>
            Thông tin mặc định xuất hiện khi chia sẻ link trên Facebook, Zalo, Google... Khuyến nghị hình ảnh 1200×630px
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tiêu đề trang mặc định (SEO Title)</Label>
            <Input {...register("seoTitle")} placeholder="RosyClass - Trung tâm tiếng Anh chuẩn quốc tế" />
          </div>
          <div className="space-y-2">
            <Label>Mô tả trang mặc định (SEO Description)</Label>
            <Textarea
              {...register("seoDescription")}
              placeholder="Học tiếng Anh tại RosyClass với đội ngũ giáo viên bản ngữ..."
              className="min-h-[80px]"
            />
          </div>
          <ImageUploader
            label="Ảnh thumbnail chia sẻ (OG Image – 1200×630px)"
            value={ogImage || ""}
            onChange={(url) => setValue("ogImage", url)}
            folder="site"
            aspectRatio="1200/630"
          />
        </CardContent>
      </Card>



      <div className="sticky bottom-0 -mx-4 flex border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:mx-0 sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:pb-10 sm:backdrop-blur-none">
        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full gap-2 sm:w-auto sm:px-8">
          <Save className="w-4 h-4" />
          {isSubmitting ? "Đang lưu..." : "Lưu tất cả cài đặt"}
        </Button>
      </div>
    </form>
  )
}
