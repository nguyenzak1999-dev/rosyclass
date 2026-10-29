"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import type { PlacementQuestion } from "@/generated/prisma/client"
import { Pencil, Plus } from "lucide-react"
import { toast } from "sonner"

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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { upsertPlacementQuestion, type PlacementQuestionFormValues } from "../actions"
import { courseLevelOptions } from "@/lib/course-levels"

const answerItems = ["A", "B", "C", "D"].map((label, index) => ({ value: String(index), label }))

function parseOptions(question?: PlacementQuestion) {
  if (!question) return ["", "", "", ""]
  try {
    const parsed = JSON.parse(question.options)
    return Array.isArray(parsed) ? [...parsed.map(String), "", "", "", ""].slice(0, 4) : ["", "", "", ""]
  } catch {
    return ["", "", "", ""]
  }
}

function toFormValues(question?: PlacementQuestion): PlacementQuestionFormValues {
  const options = parseOptions(question)
  return question
      ? {
          id: question.id,
          type: question.type,
          question: question.question,
          optionA: options[0],
          optionB: options[1],
          optionC: options[2],
          optionD: options[3],
          correctIndex: question.correctIndex,
          order: question.order,
          level: question.level,
          isPublished: question.isPublished,
        }
      : {
          type: "Ngữ pháp",
          question: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctIndex: 0,
          order: 0,
          level: null,
          isPublished: true,
        }
}

export function PlacementQuestionDialog({ question }: { question?: PlacementQuestion }) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, setValue, watch, reset, formState } = useForm<PlacementQuestionFormValues>({
    defaultValues: toFormValues(question),
  })

  // Mỗi lần mở lấy lại dữ liệu mới nhất (sau khi lưu, form không được giữ giá trị cũ)
  const handleOpenChange = (next: boolean) => {
    if (next) reset(toFormValues(question))
    setOpen(next)
  }

  const level = watch("level")
  // Cấp độ trẻ em, cộng cấp độ cũ nếu câu hỏi đang dùng (để không hiện mã thô)
  const levelItems = [{ value: "none", label: "Không gắn cấp độ" }, ...courseLevelOptions(level)]

  const onSubmit = async (values: PlacementQuestionFormValues) => {
    const result = await upsertPlacementQuestion(values)
    if (result.success) {
      toast.success(question ? "Đã cập nhật câu hỏi" : "Đã tạo câu hỏi")
      setOpen(false)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          question ? (
            <Button variant="ghost" size="icon" title="Sửa câu hỏi" />
          ) : (
            <Button />
          )
        }
      >
        {question ? <Pencil className="h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> Thêm câu hỏi</>}
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>{question ? "Sửa câu hỏi" : "Thêm câu hỏi placement test"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("id")} />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Nhóm câu hỏi</Label>
              <Input {...register("type")} placeholder="Ngữ pháp, Từ vựng..." />
            </div>
            <div className="space-y-2">
              <Label>Thứ tự</Label>
              <Input type="number" {...register("order")} />
            </div>
            <div className="space-y-2">
              <Label>Cấp độ gợi ý</Label>
              <Select
                value={level || "none"}
                items={levelItems}
                onValueChange={(value) => setValue("level", value === "none" ? null : value as PlacementQuestionFormValues["level"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levelItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Câu hỏi</Label>
            <Textarea {...register("question")} className="min-h-[110px]" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>A</Label>
              <Input {...register("optionA")} />
            </div>
            <div className="space-y-2">
              <Label>B</Label>
              <Input {...register("optionB")} />
            </div>
            <div className="space-y-2">
              <Label>C</Label>
              <Input {...register("optionC")} />
            </div>
            <div className="space-y-2">
              <Label>D</Label>
              <Input {...register("optionD")} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Đáp án đúng</Label>
              <Select value={String(watch("correctIndex"))} items={answerItems} onValueChange={(value) => setValue("correctIndex", Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">A</SelectItem>
                  <SelectItem value="1">B</SelectItem>
                  <SelectItem value="2">C</SelectItem>
                  <SelectItem value="3">D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Xuất bản</Label>
                <p className="text-xs text-muted-foreground">Chỉ câu hỏi đã xuất bản mới hiện ngoài website.</p>
              </div>
              <Switch checked={watch("isPublished")} onCheckedChange={(checked) => setValue("isPublished", checked)} />
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
