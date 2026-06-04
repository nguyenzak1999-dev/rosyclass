"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MessageSquare, Save, Settings2 } from "lucide-react"
import { type SiteSettings } from "@/lib/site-settings"
import { saveSiteSettings } from "../../../settings/site/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type HeroSettingsFields = Pick<
  SiteSettings,
  | "heroTitle"
  | "heroHighlight"
  | "heroDescription"
  | "heroButton1Text"
  | "heroButton1Link"
  | "heroButton2Text"
  | "heroButton2Link"
  | "heroFootnote"
  | "heroChatGroupTitle"
  | "heroChatGroupMeta"
  | "heroChatJoinText"
  | "heroChatIncomingMessage"
  | "heroChatIncomingTime"
  | "heroChatOutgoingAuthor"
  | "heroChatOutgoingMessage"
  | "heroChatOutgoingTime"
  | "heroChatReactions"
>

export function HeroSettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit } = useForm<HeroSettingsFields>({
    defaultValues: settings,
  })

  const onSubmit = async (data: HeroSettingsFields) => {
    setIsSubmitting(true)
    const result = await saveSiteSettings({ ...settings, ...data })
    setIsSubmitting(false)

    if (result.success) {
      toast.success("Đã lưu cấu hình Hero")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card className="gap-3">
        <CardHeader className="gap-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="h-4 w-4" /> Nội dung dự phòng
          </CardTitle>
          <CardDescription>Hiển thị khi chưa có slide Hero nào đang bật trong CMS</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tiêu đề dòng 1</Label>
            <Input {...register("heroTitle")} placeholder="Giao tiếp" />
          </div>
          <div className="space-y-2">
            <Label>Tiêu đề dòng 2</Label>
            <Input {...register("heroHighlight")} placeholder="tự tin" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Mô tả</Label>
            <Textarea
              {...register("heroDescription")}
              placeholder="Phương pháp học đơn giản, đáng tin cậy..."
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Text nút chính</Label>
            <Input {...register("heroButton1Text")} placeholder="Đăng ký học thử" />
          </div>
          <div className="space-y-2">
            <Label>Link nút chính</Label>
            <Input {...register("heroButton1Link")} placeholder="/dang-ky" />
          </div>
          <div className="space-y-2">
            <Label>Text nút phụ</Label>
            <Input {...register("heroButton2Text")} placeholder="Xem lịch khai giảng" />
          </div>
          <div className="space-y-2">
            <Label>Link nút phụ</Label>
            <Input {...register("heroButton2Link")} placeholder="/khoa-hoc" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Ghi chú nhỏ dưới nút</Label>
            <Input {...register("heroFootnote")} placeholder="* Yêu cầu làm bài kiểm tra xếp lớp." />
          </div>
        </CardContent>
      </Card>

      <Card className="gap-3">
        <CardHeader className="gap-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" /> Bong bóng chat
          </CardTitle>
          <CardDescription>Nội dung overlay ở bên phải Hero trên desktop</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tiêu đề nhóm</Label>
            <Input {...register("heroChatGroupTitle")} placeholder="Lớp học giao tiếp" />
          </div>
          <div className="space-y-2">
            <Label>Thông tin thành viên</Label>
            <Input {...register("heroChatGroupMeta")} placeholder="& 4 others" />
          </div>
          <div className="space-y-2">
            <Label>Text nút tham gia</Label>
            <Input {...register("heroChatJoinText")} placeholder="Tham gia" />
          </div>
          <div className="space-y-2">
            <Label>Reactions</Label>
            <Input {...register("heroChatReactions")} placeholder="👍 ❤️ 🤓" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Tin nhắn màu xanh</Label>
            <Textarea {...register("heroChatIncomingMessage")} className="min-h-[72px]" />
          </div>
          <div className="space-y-2">
            <Label>Giờ tin nhắn màu xanh</Label>
            <Input {...register("heroChatIncomingTime")} placeholder="11:53" />
          </div>
          <div className="space-y-2">
            <Label>Tên người gửi tin nhắn trắng</Label>
            <Input {...register("heroChatOutgoingAuthor")} placeholder="Cô Ngọc" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Tin nhắn màu trắng</Label>
            <Textarea {...register("heroChatOutgoingMessage")} className="min-h-[72px]" />
          </div>
          <div className="space-y-2">
            <Label>Giờ tin nhắn màu trắng</Label>
            <Input {...register("heroChatOutgoingTime")} placeholder="11:59" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          <Save className="h-4 w-4" />
          {isSubmitting ? "Đang lưu..." : "Lưu cấu hình Hero"}
        </Button>
      </div>
    </form>
  )
}
