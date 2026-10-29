"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Pencil, Plus } from "lucide-react"
import type { Faq } from "@/generated/prisma/client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { upsertFaq, type FaqFormValues } from "../actions"

const statusItems = [
  { value: "ACTIVE", label: "Đang hiện" },
  { value: "INACTIVE", label: "Ẩn" },
  { value: "DRAFT", label: "Nháp" },
  { value: "PUBLISHED", label: "Xuất bản" },
]

function toFormValues(faq?: Faq): FaqFormValues {
  return faq
    ? {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category ?? "",
        position: faq.position,
        status: faq.status,
      }
    : { question: "", answer: "", category: "", position: 0, status: "ACTIVE" }
}

export function FaqDialog({ faq }: { faq?: Faq }) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, setValue, watch, reset, formState } = useForm<FaqFormValues>({
    defaultValues: toFormValues(faq),
  })

  // Mỗi lần mở lấy lại dữ liệu mới nhất (sau khi lưu, form không được giữ giá trị cũ)
  const handleOpenChange = (next: boolean) => {
    if (next) reset(toFormValues(faq))
    setOpen(next)
  }

  const status = watch("status")

  const onSubmit = async (values: FaqFormValues) => {
    const result = await upsertFaq(values)
    if (result.success) {
      toast.success(faq ? "Đã cập nhật FAQ" : "Đã tạo FAQ")
      setOpen(false)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          faq ? (
            <Button variant="ghost" size="icon" title="Sửa FAQ" />
          ) : (
            <Button />
          )
        }
      >
        {faq ? <Pencil className="h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> Thêm FAQ</>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>{faq ? "Sửa FAQ" : "Thêm FAQ"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("id")} />
          <div className="space-y-2">
            <Label>Câu hỏi</Label>
            <Input {...register("question")} />
          </div>
          <div className="space-y-2">
            <Label>Câu trả lời</Label>
            <Textarea {...register("answer")} className="min-h-[120px]" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Nhóm</Label>
              <Input {...register("category")} placeholder="Học phí, Lịch học..." />
            </div>
            <div className="space-y-2">
              <Label>Thứ tự</Label>
              <Input type="number" {...register("position")} />
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={status} items={statusItems} onValueChange={(value) => setValue("status", value as FaqFormValues["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Đang hiện</SelectItem>
                  <SelectItem value="INACTIVE">Ẩn</SelectItem>
                  <SelectItem value="DRAFT">Nháp</SelectItem>
                  <SelectItem value="PUBLISHED">Xuất bản</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
