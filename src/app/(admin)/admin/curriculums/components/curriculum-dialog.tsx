"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { curriculumSchema, type CurriculumFormValues } from "@/lib/schemas/curriculum"
import { upsertCurriculum } from "../actions"

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang dùng",
  DRAFT: "Bản nháp",
  INACTIVE: "Ngừng dùng",
  PUBLISHED: "Đã công bố",
}

const EMPTY: CurriculumFormValues = {
  name: "",
  gradeLabel: "Lớp 1",
  description: "",
  sourceBook: "",
  status: "ACTIVE",
}

export function CurriculumDialog({
  initialData,
  trigger,
}: {
  initialData?: CurriculumFormValues & { id: string }
  trigger?: React.ReactElement
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CurriculumFormValues>({
    resolver: zodResolver(curriculumSchema) as Resolver<CurriculumFormValues>,
    defaultValues: initialData ?? EMPTY,
  })
  const status = useWatch({ control, name: "status" }) ?? "ACTIVE"

  React.useEffect(() => {
    if (open) reset(initialData ? { ...EMPTY, ...initialData } : EMPTY)
  }, [open, initialData, reset])

  const onSubmit = async (values: CurriculumFormValues) => {
    const result = await upsertCurriculum({ ...values, id: initialData?.id })
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(initialData ? "Đã cập nhật chương trình" : "Đã tạo chương trình học")
    setOpen(false)
    if (!initialData && result.data?.id) {
      router.push(`/admin/curriculums/${result.data.id}`)
    } else {
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? <Button>+ Tạo chương trình</Button>} />
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa thông tin chương trình" : "Tạo chương trình học"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="curriculum-name">Tên chương trình *</Label>
            <Input id="curriculum-name" {...register("name")} placeholder="Tiếng Anh lớp 1 – Học kỳ 1" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="curriculum-grade">Khối lớp *</Label>
              <Input id="curriculum-grade" {...register("gradeLabel")} placeholder="Lớp 1" />
              {errors.gradeLabel && <p className="text-sm text-destructive">{errors.gradeLabel.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={status} onValueChange={(value) => value && setValue("status", value as CurriculumFormValues["status"])}>
                <SelectTrigger className="w-full">
                  <span className="truncate text-left">{STATUS_LABELS[status] ?? status}</span>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="curriculum-book">Giáo trình gốc</Label>
            <Input id="curriculum-book" {...register("sourceBook")} placeholder="Tên sách / bộ giáo trình đang dùng (nếu có)" />
            {errors.sourceBook && <p className="text-sm text-destructive">{errors.sourceBook.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="curriculum-description">Mô tả</Label>
            <Textarea
              id="curriculum-description"
              {...register("description")}
              placeholder="Mục tiêu chung, đối tượng, số buổi dự kiến…"
              className="min-h-[90px]"
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu lại"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
