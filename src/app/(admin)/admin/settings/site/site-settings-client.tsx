"use client"

import { useForm } from "react-hook-form"
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
import { Globe, Phone, MapPin, Image, Search, Share2, Building2, Save, LayoutTemplate } from "lucide-react"

export default function SiteSettingsClient({ settings }: { settings: SiteSettings }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch } = useForm<SiteSettings>({
    defaultValues: settings
  })

  const logoUrl = watch("logoUrl")
  const faviconUrl = watch("faviconUrl")
  const ogImage = watch("ogImage")

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cài đặt Website</h1>
          <p className="text-muted-foreground text-sm mt-1">Quản lý thông tin thương hiệu, liên hệ, SEO và mạng xã hội</p>
        </div>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          <Save className="w-4 h-4" />
          {isSubmitting ? "Đang lưu..." : "Lưu tất cả"}
        </Button>
      </div>

      {/* Thương hiệu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Thông tin thương hiệu
          </CardTitle>
          <CardDescription>Tên trường, khẩu hiệu, logo và favicon hiển thị trên website</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tên trường / Thương hiệu *</Label>
            <Input {...register("siteName")} placeholder="RosyClass" />
          </div>
          <div className="space-y-2">
            <Label>Khẩu hiệu (Tagline)</Label>
            <Input {...register("tagline")} placeholder="Tiếng Anh chuẩn quốc tế" />
          </div>

          <div className="space-y-2 col-span-2">
            <Label>URL Logo (PNG/SVG - nền trong suốt, khuyến nghị 200×60px)</Label>
            <Input {...register("logoUrl")} placeholder="https://cdn.rosyclass.edu.vn/logo.png" />
            {logoUrl && (
              <div className="mt-2 p-3 bg-muted rounded-lg inline-flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo preview" className="h-10 object-contain" />
                <span className="text-xs text-muted-foreground">Preview</span>
              </div>
            )}
          </div>

          <div className="space-y-2 col-span-2">
            <Label>URL Favicon (ICO/PNG - 32×32px hoặc 64×64px)</Label>
            <Input {...register("faviconUrl")} placeholder="https://cdn.rosyclass.edu.vn/favicon.ico" />
            {faviconUrl && (
              <div className="mt-2 p-3 bg-muted rounded-lg inline-flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={faviconUrl} alt="Favicon preview" className="w-8 h-8 object-contain" />
                <span className="text-xs text-muted-foreground">Favicon preview (32×32)</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liên hệ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" /> Thông tin liên hệ
          </CardTitle>
          <CardDescription>Hiển thị ở Footer, trang Về chúng tôi và kết quả tìm kiếm Google</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Phone className="w-3 h-3" /> Số điện thoại</Label>
            <Input {...register("phone")} placeholder="1900 1234" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Globe className="w-3 h-3" /> Email liên hệ</Label>
            <Input {...register("email")} placeholder="contact@rosyclass.edu.vn" />
          </div>
          <div className="space-y-2 col-span-2">
            <Label className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Địa chỉ</Label>
            <Input {...register("address")} placeholder="123 Nguyễn Văn Linh, Đà Nẵng" />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Giờ hoạt động</Label>
            <Input {...register("workingHours")} placeholder="Thứ 2 – Chủ Nhật: 7:00 – 21:00" />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Bản quyền (Copyright)</Label>
            <Input {...register("copyright")} placeholder="© 2026 RosyClass English Center. All rights reserved." />
          </div>
        </CardContent>
      </Card>

      {/* Mạng xã hội */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" /> Mạng xã hội
          </CardTitle>
          <CardDescription>Liên kết mạng xã hội hiển thị ở Footer và trang Về chúng tôi</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
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

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5" /> Nội dung Hero (Trang chủ)
          </CardTitle>
          <CardDescription>Tùy chỉnh nội dung hiển thị ở phần đầu trang chủ</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label>Huy hiệu (Badge)</Label>
            <Input {...register("heroBadge")} placeholder="Trung tâm tiếng Anh số 1" />
          </div>
          <div className="space-y-2">
            <Label>Tiêu đề chính</Label>
            <Input {...register("heroTitle")} placeholder="Mở khóa tiềm năng." />
          </div>
          <div className="space-y-2">
            <Label>Từ khóa nổi bật (Highlight)</Label>
            <Input {...register("heroHighlight")} placeholder="Kiến tạo tương lai." />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Mô tả ngắn</Label>
            <Textarea
              {...register("heroDescription")}
              placeholder="Đánh thức phản xạ ngôn ngữ với 100% giáo viên bản ngữ..."
              className="min-h-[80px]"
            />
          </div>
          
          <div className="space-y-4 col-span-2 md:col-span-1 border rounded-lg p-4 bg-muted/30">
            <h4 className="font-medium text-sm">Nút bấm 1 (Chính)</h4>
            <div className="space-y-2">
              <Label>Text nút bấm</Label>
              <Input {...register("heroButton1Text")} placeholder="Đăng ký Test miễn phí" />
            </div>
            <div className="space-y-2">
              <Label>Link (URL)</Label>
              <Input {...register("heroButton1Link")} placeholder="/kiem-tra-trinh-do" />
            </div>
          </div>
          
          <div className="space-y-4 col-span-2 md:col-span-1 border rounded-lg p-4 bg-muted/30">
            <h4 className="font-medium text-sm">Nút bấm 2 (Phụ)</h4>
            <div className="space-y-2">
              <Label>Text nút bấm</Label>
              <Input {...register("heroButton2Text")} placeholder="Xem lịch khai giảng" />
            </div>
            <div className="space-y-2">
              <Label>Link (URL)</Label>
              <Input {...register("heroButton2Link")} placeholder="/khoa-hoc" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" /> SEO & Mạng xã hội (Default)
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
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Image className="w-3 h-3" /> Ảnh thumbnail chia sẻ (OG Image - 1200×630px)</Label>
            <Input {...register("ogImage")} placeholder="https://cdn.rosyclass.edu.vn/og-image.jpg" />
            {ogImage && (
              <div className="mt-3 rounded-xl overflow-hidden border border-border max-w-[400px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ogImage} alt="OG Image preview" className="w-full aspect-[1200/630] object-cover" />
                <div className="p-2 bg-muted text-xs text-muted-foreground">Preview thumbnail khi chia sẻ lên MXH (1200×630)</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pb-10">
        <Button type="submit" disabled={isSubmitting} size="lg" className="gap-2 px-8">
          <Save className="w-4 h-4" />
          {isSubmitting ? "Đang lưu..." : "Lưu tất cả cài đặt"}
        </Button>
      </div>
    </form>
  )
}
