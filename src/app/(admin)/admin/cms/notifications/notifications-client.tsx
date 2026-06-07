"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { Bell, Mail, Save, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  DEFAULT_LEAD_NOTIFICATION_SETTINGS,
  type LeadFormKey,
  type LeadNotificationSettings,
  type SiteSettings,
} from "@/lib/site-settings"
import { saveLeadNotificationSettings } from "./actions"

const formKeys: LeadFormKey[] = ["contact", "registration", "placementTest", "classSchedule"]

const placeholderHelp = "{{formLabel}}, {{fullName}}, {{phone}}, {{email}}, {{courseInterest}}, {{notes}}, {{leadId}}"

export default function NotificationsCmsClient({ settings }: { settings: SiteSettings }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: LeadNotificationSettings = {
    ...DEFAULT_LEAD_NOTIFICATION_SETTINGS,
    ...settings.leadNotificationSettings,
    forms: {
      contact: {
        ...DEFAULT_LEAD_NOTIFICATION_SETTINGS.forms.contact,
        ...settings.leadNotificationSettings?.forms.contact,
      },
      registration: {
        ...DEFAULT_LEAD_NOTIFICATION_SETTINGS.forms.registration,
        ...settings.leadNotificationSettings?.forms.registration,
      },
      placementTest: {
        ...DEFAULT_LEAD_NOTIFICATION_SETTINGS.forms.placementTest,
        ...settings.leadNotificationSettings?.forms.placementTest,
      },
      classSchedule: {
        ...DEFAULT_LEAD_NOTIFICATION_SETTINGS.forms.classSchedule,
        ...settings.leadNotificationSettings?.forms.classSchedule,
      },
    },
  }

  const { register, handleSubmit, control, setValue } = useForm<LeadNotificationSettings>({
    defaultValues,
  })

  const values = useWatch({ control })

  const onSubmit = async (data: LeadNotificationSettings) => {
    setIsSubmitting(true)
    const result = await saveLeadNotificationSettings(data)
    setIsSubmitting(false)

    if (result.success) {
      toast.success("Đã lưu cấu hình thông báo form")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-5xl flex-col gap-6 pb-20 sm:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Thông báo form</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Quản lý Telegram và email tự động gửi cho khách sau khi khách điền form trên website.
          </p>
        </div>
        <Button type="submit" disabled={isSubmitting} className="hidden gap-2 sm:inline-flex">
          <Save className="h-4 w-4" />
          {isSubmitting ? "Đang lưu..." : "Lưu cấu hình"}
        </Button>
      </div>

      <Card className="gap-3">
        <CardHeader className="gap-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" /> Kênh gửi
          </CardTitle>
          <CardDescription>
            Cần cấu hình biến môi trường `TELEGRAM_BOT_TOKEN` cho Telegram và `RESEND_API_KEY` cho email.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <Label>Gửi Telegram</Label>
              <p className="text-xs text-muted-foreground">Thông báo nội bộ khi có lead mới.</p>
            </div>
            <Switch
              checked={Boolean(values.telegramEnabled)}
              onCheckedChange={(checked) => setValue("telegramEnabled", checked)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <Label>Gửi email cho khách</Label>
              <p className="text-xs text-muted-foreground">Tự động phản hồi về email khách nhập trong form.</p>
            </div>
            <Switch
              checked={Boolean(values.emailEnabled)}
              onCheckedChange={(checked) => setValue("emailEnabled", checked)}
            />
          </div>
          <div className="space-y-2">
            <Label>Telegram Chat ID</Label>
            <Input {...register("telegramChatId")} placeholder="-1001234567890" />
          </div>
          <div className="space-y-2">
            <Label>Email gửi đi</Label>
            <Input {...register("emailFrom")} placeholder="RosyClass <contact@rosyclass.edu.vn>" />
          </div>
          <div className="space-y-2">
            <Label>Email nhận phản hồi</Label>
            <Input {...register("replyToEmail")} placeholder="contact@rosyclass.edu.vn" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Nội dung Telegram</Label>
            <Textarea {...register("telegramMessageTemplate")} className="min-h-[160px] font-mono text-sm" />
            <p className="text-xs text-muted-foreground">Placeholder: {placeholderHelp}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="mb-4 h-auto w-fit flex-wrap justify-start">
          {formKeys.map((formKey) => (
            <TabsTrigger key={formKey} value={formKey}>
              {values.forms?.[formKey]?.label || defaultValues.forms[formKey].label}
            </TabsTrigger>
          ))}
        </TabsList>

        {formKeys.map((formKey) => (
          <TabsContent key={formKey} value={formKey}>
            <Card className="gap-3">
              <CardHeader className="gap-1.5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-4 w-4" /> {values.forms?.[formKey]?.label || defaultValues.forms[formKey].label}
                </CardTitle>
                <CardDescription>Bật/tắt thông báo và chỉnh nội dung email gửi về cho khách từ form này.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tên form</Label>
                  <Input {...register(`forms.${formKey}.label`)} />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label>Hoạt động</Label>
                    <Switch
                      checked={Boolean(values.forms?.[formKey]?.enabled)}
                      onCheckedChange={(checked) => setValue(`forms.${formKey}.enabled`, checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label>Email</Label>
                    <Switch
                      checked={Boolean(values.forms?.[formKey]?.emailEnabled)}
                      onCheckedChange={(checked) => setValue(`forms.${formKey}.emailEnabled`, checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label>Telegram</Label>
                    <Switch
                      checked={Boolean(values.forms?.[formKey]?.telegramEnabled)}
                      onCheckedChange={(checked) => setValue(`forms.${formKey}.telegramEnabled`, checked)}
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Tiêu đề email</Label>
                  <Input {...register(`forms.${formKey}.customerEmailSubject`)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Nội dung email HTML</Label>
                  <Textarea {...register(`forms.${formKey}.customerEmailHtml`)} className="min-h-[220px] font-mono text-sm" />
                  <p className="text-xs text-muted-foreground">Placeholder: {placeholderHelp}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="sticky bottom-0 -mx-4 flex border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:mx-0 sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:pb-10 sm:backdrop-blur-none">
        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full gap-2 sm:w-auto sm:px-8">
          <Send className="h-4 w-4" />
          {isSubmitting ? "Đang lưu..." : "Lưu cấu hình thông báo"}
        </Button>
      </div>
    </form>
  )
}
