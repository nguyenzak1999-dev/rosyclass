"use client"

import { type SiteSettings } from "@/lib/site-settings"
import { useForm, useFieldArray } from "react-hook-form"
import { useState } from "react"
import { saveSiteSettings } from "../../settings/site/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, LayoutTemplate, BookOpen, Route, Plus, Trash2 } from "lucide-react"
import { ImageUploader } from "@/components/ui/image-uploader"

export default function HomeCmsClient({ settings }: { settings: SiteSettings }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, control, watch, setValue } = useForm<SiteSettings>({
    defaultValues: settings
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "learningPathSteps",
  })

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: "features",
  })

  const { fields: statFields, append: appendStat, remove: removeStat } = useFieldArray({
    control,
    name: "statistics",
  })

  const onSubmit = async (data: SiteSettings) => {
    setIsSubmitting(true)
    const result = await saveSiteSettings({ ...settings, ...data })
    setIsSubmitting(false)

    if (result.success) {
      toast.success("Đã lưu cài đặt!")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-20 sm:pb-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Giao diện Trang chủ</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý tất cả các thành phần giao diện hiển thị trên trang chủ của website.
          </p>
        </div>
      </div>

      <Tabs defaultValue="featured-courses" className="w-full">
        <TabsList className="mb-4 flex-wrap w-fit h-auto sm:h-10 justify-start">
          <TabsTrigger value="featured-courses" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Khóa học nổi bật
          </TabsTrigger>
          <TabsTrigger value="learning-path" className="gap-2">
            <Route className="w-4 h-4" />
            Lộ trình học
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            Ưu điểm
          </TabsTrigger>
          <TabsTrigger value="statistics" className="gap-2">
            Thống kê
          </TabsTrigger>
          <TabsTrigger value="cta" className="gap-2">
            CTA
          </TabsTrigger>
        </TabsList>


        <TabsContent value="featured-courses">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="gap-3">
              <CardHeader className="gap-1.5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <LayoutTemplate className="h-4 w-4" /> Khóa học nổi bật
                </CardTitle>
                <CardDescription>Cấu hình nội dung hiển thị cho phần Khóa học nổi bật trên trang chủ</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Tiêu đề</Label>
                  <Input {...register("featuredCoursesTitle")} placeholder="Khóa học nổi bật" />
                </div>
                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea
                    {...register("featuredCoursesSubtitle")}
                    placeholder="Khám phá các lộ trình học được thiết kế riêng biệt..."
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="gap-2 w-full sm:w-auto">
                <Save className="w-4 h-4" />
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="learning-path">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="gap-3">
              <CardHeader className="gap-1.5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <LayoutTemplate className="h-4 w-4" /> Lộ trình học
                </CardTitle>
                <CardDescription>Cấu hình nội dung hiển thị cho phần Lộ trình học trên trang chủ</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Huy hiệu (Badge)</Label>
                  <Input {...register("learningPathBadge")} placeholder="Lộ trình học" />
                </div>
                <div className="space-y-2">
                  <Label>Tiêu đề chính</Label>
                  <Input {...register("learningPathTitle")} placeholder="Không học theo cảm tính..." />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Mô tả</Label>
                  <Textarea
                    {...register("learningPathDescription")}
                    placeholder="RosyClass bắt đầu bằng đánh giá năng lực..."
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Text nút hành động</Label>
                  <Input {...register("learningPathButtonText")} placeholder="Kiểm tra trình độ miễn phí" />
                </div>
                <div className="space-y-2">
                  <Label>Link nút hành động</Label>
                  <Input {...register("learningPathButtonLink")} placeholder="/kiem-tra-trinh-do" />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Các bước trong lộ trình</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ title: "", text: "" })}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Thêm bước
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {fields.map((field, index) => (
                <Card key={field.id} className="gap-3 relative">
                  <CardHeader className="gap-1.5 py-4">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Bước {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-destructive h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tiêu đề</Label>
                      <Input {...register(`learningPathSteps.${index}.title` as const)} placeholder="VD: Kiểm tra đầu vào" />
                    </div>
                    <div className="space-y-2">
                      <Label>Mô tả</Label>
                      <Textarea {...register(`learningPathSteps.${index}.text` as const)} placeholder="Nội dung mô tả bước này..." className="min-h-[80px]" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="gap-2 w-full sm:w-auto">
                <Save className="w-4 h-4" />
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="features">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Danh sách Ưu điểm / Tính năng</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendFeature({ image: "", title: "", description: "", buttonText: "", buttonLink: "" })} className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm ưu điểm
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {featureFields.map((field, index) => (
                <Card key={field.id} className="gap-3 relative">
                  <CardHeader className="gap-1.5 py-4">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Ưu điểm {index + 1}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)} className="text-destructive h-8 w-8 hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ImageUploader
                      label="Hình ảnh"
                      value={(watch(`features.${index}.image` as const) as string) || ""}
                      onChange={(url) => setValue(`features.${index}.image` as const, url)}
                      folder="home"
                      aspectRatio="4/3"
                    />
                    <div className="space-y-2">
                      <Label>Tiêu đề</Label>
                      <Input {...register(`features.${index}.title` as const)} placeholder="Tiêu đề" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Mô tả</Label>
                      <Textarea {...register(`features.${index}.description` as const)} placeholder="Mô tả" className="min-h-[80px]" />
                    </div>
                    <div className="space-y-2">
                      <Label>Text Nút</Label>
                      <Input {...register(`features.${index}.buttonText` as const)} placeholder="Text nút" />
                    </div>
                    <div className="space-y-2">
                      <Label>Link Nút</Label>
                      <Input {...register(`features.${index}.buttonLink` as const)} placeholder="/link" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="gap-2 w-full sm:w-auto">
                <Save className="w-4 h-4" />
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="statistics">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Các chỉ số thống kê</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendStat({ number: "", label: "" })} className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm chỉ số
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {statFields.map((field, index) => (
                <Card key={field.id} className="gap-3 relative">
                  <CardHeader className="gap-1.5 py-4">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Chỉ số {index + 1}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeStat(index)} className="text-destructive h-8 w-8 hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Con số</Label>
                      <Input {...register(`statistics.${index}.number` as const)} placeholder="VD: 5000+" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nhãn</Label>
                      <Input {...register(`statistics.${index}.label` as const)} placeholder="VD: Học viên tin tưởng" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="gap-2 w-full sm:w-auto">
                <Save className="w-4 h-4" />
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="cta">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="gap-3">
              <CardHeader className="gap-1.5">
                <CardTitle className="text-base">Kêu gọi hành động (Cuối trang)</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Tiêu đề</Label>
                  <Input {...register("ctaTitle")} placeholder="Phát triển tương lai" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Mô tả</Label>
                  <Textarea {...register("ctaDescription")} placeholder="RosyClass giúp bạn..." className="min-h-[80px]" />
                </div>
                <div className="space-y-2">
                  <Label>Text Nút</Label>
                  <Input {...register("ctaButtonText")} placeholder="Đăng ký ngay" />
                </div>
                <div className="space-y-2">
                  <Label>Link Nút</Label>
                  <Input {...register("ctaButtonLink")} placeholder="/dang-ky" />
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="gap-2 w-full sm:w-auto">
                <Save className="w-4 h-4" />
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </TabsContent>

      </Tabs>
    </div>
  )
}
