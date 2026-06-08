"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  scheduleSchema,
  type ScheduleFormValues,
  DAY_OF_WEEK_LABELS,
} from "@/lib/schemas/schedule"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createClassSchedule,
  updateClassSchedule,
} from "@/app/(admin)/admin/classes/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ScheduleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
  schedule: {
    id: string
    dayOfWeek: number
    startTime: string
    endTime: string
    teacherId: string | null
    roomId: string | null
  } | null
  teachers: { id: string; fullName: string }[]
  rooms: { id: string; name: string }[]
}

export function ScheduleFormDialog({
  open,
  onOpenChange,
  classId,
  schedule,
  teachers,
  rooms,
}: ScheduleFormDialogProps) {
  const router = useRouter()

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } =
    useForm<ScheduleFormValues>({
      resolver: zodResolver(scheduleSchema) as any,
      defaultValues: {
        classId,
        dayOfWeek: 1,
        startTime: "18:00",
        endTime: "19:30",
        teacherId: null,
        roomId: null,
      },
    })

  const dayOfWeek = watch("dayOfWeek")
  const teacherId = watch("teacherId")
  const roomId = watch("roomId")

  React.useEffect(() => {
    if (open) {
      if (schedule) {
        reset({
          id: schedule.id,
          classId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          teacherId: schedule.teacherId,
          roomId: schedule.roomId,
        })
      } else {
        reset({
          classId,
          dayOfWeek: 1,
          startTime: "18:00",
          endTime: "19:30",
          teacherId: null,
          roomId: null,
        })
      }
    }
  }, [open, schedule, classId, reset])

  const onSubmit = async (data: ScheduleFormValues) => {
    const result = schedule
      ? await updateClassSchedule(data)
      : await createClassSchedule(data)
    if (result.success) {
      toast.success(schedule ? "Đã cập nhật lịch học" : "Đã thêm lịch học")
      onOpenChange(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{schedule ? "Sửa lịch học" : "Thêm lịch học cố định"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Thứ trong tuần *</Label>
            <Select
              value={String(dayOfWeek)}
              onValueChange={(v: any) => setValue("dayOfWeek", Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn thứ" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dayOfWeek && (
              <p className="text-sm text-destructive">{errors.dayOfWeek.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Giờ bắt đầu *</Label>
              <Input id="startTime" type="time" {...register("startTime")} />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Giờ kết thúc *</Label>
              <Input id="endTime" type="time" {...register("endTime")} />
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Giáo viên (bỏ trống = dùng GV mặc định của lớp)</Label>
            <Select
              value={teacherId || "inherit"}
              onValueChange={(v: any) =>
                setValue("teacherId", v === "inherit" ? null : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Kế thừa từ lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inherit">— Kế thừa từ lớp —</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Phòng học (bỏ trống = dùng phòng mặc định)</Label>
            <Select
              value={roomId || "inherit"}
              onValueChange={(v: any) =>
                setValue("roomId", v === "inherit" ? null : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Kế thừa từ lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inherit">— Kế thừa từ lớp —</SelectItem>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Hủy
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
