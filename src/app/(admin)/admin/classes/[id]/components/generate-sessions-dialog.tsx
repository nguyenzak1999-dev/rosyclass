"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  generateSessionsSchema,
  type GenerateSessionsFormValues,
} from "@/lib/schemas/schedule"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { generateSessions } from "@/app/(admin)/admin/classes/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface GenerateSessionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
  schedulesCount: number
}

export function GenerateSessionsDialog({
  open,
  onOpenChange,
  classId,
  schedulesCount,
}: GenerateSessionsDialogProps) {
  const router = useRouter()

  // Default: từ hôm nay đến 30 ngày sau
  const today = new Date()
  const in30Days = new Date()
  in30Days.setDate(today.getDate() + 30)

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, reset } =
    useForm<GenerateSessionsFormValues>({
      resolver: zodResolver(generateSessionsSchema) as any,
      defaultValues: {
        classId,
        fromDate: today.toISOString().split("T")[0],
        toDate: in30Days.toISOString().split("T")[0],
        replaceExisting: false,
      },
    })

  const replaceExisting = watch("replaceExisting")

  React.useEffect(() => {
    if (open) {
      const t = new Date()
      const e = new Date()
      e.setDate(t.getDate() + 30)
      reset({
        classId,
        fromDate: t.toISOString().split("T")[0],
        toDate: e.toISOString().split("T")[0],
        replaceExisting: false,
      })
    }
  }, [open, classId, reset])

  const onSubmit = async (data: GenerateSessionsFormValues) => {
    // data.fromDate / toDate đã là string "YYYY-MM-DD" từ <input type="date">
    // Action sẽ tự new Date(...) bên trong
    const result = await generateSessions(data)
    if (result.success) {
      const count = result.data?.count ?? 0
      toast.success(`Đã sinh ${count} buổi học mới`)
      onOpenChange(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Sinh buổi học tự động</DialogTitle>
          <DialogDescription>
            Hệ thống sẽ tạo buổi học cho mỗi ngày trong khoảng đã chọn khớp với lịch cố định
            ({schedulesCount} lịch).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate">Từ ngày *</Label>
              <Input id="fromDate" type="date" {...register("fromDate")} />
              {errors.fromDate && (
                <p className="text-sm text-destructive">{errors.fromDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="toDate">Đến ngày *</Label>
              <Input id="toDate" type="date" {...register("toDate")} />
              {errors.toDate && (
                <p className="text-sm text-destructive">{errors.toDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-2 p-3 border rounded-lg bg-muted/30">
            <Checkbox
              id="replaceExisting"
              checked={replaceExisting}
              onCheckedChange={(checked) => setValue("replaceExisting", checked === true)}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="replaceExisting" className="cursor-pointer">
                Xoá & tạo lại các buổi SCHEDULED trong khoảng này
              </Label>
              <p className="text-xs text-muted-foreground">
                Buổi học đã có điểm danh sẽ KHÔNG bị xoá.
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang sinh..." : "Sinh buổi học"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
