"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { parentSchema, type ParentFormValues } from "@/lib/schemas/parent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { upsertParent } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Checkbox } from "@/components/ui/checkbox"

interface ParentDialogProps {
  initialData?: any
  students?: any[]
  trigger?: React.ReactNode
}

export function ParentDialog({ initialData, students = [], trigger }: ParentDialogProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<ParentFormValues>({
    resolver: zodResolver(parentSchema) as any,
    defaultValues: initialData ? {
      ...initialData,
      studentIds: initialData.students?.map((s: any) => s.id) || []
    } : {
      fullName: "",
      phone: "",
      email: "",
      relationship: "",
      address: "",
      notes: "",
      studentIds: []
    }
  })

  const selectedStudentIds = watch("studentIds") || []

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          ...initialData,
          studentIds: initialData.students?.map((s: any) => s.id) || []
        })
      } else {
        reset({
          fullName: "",
          phone: "",
          email: "",
          relationship: "",
          address: "",
          notes: "",
          studentIds: []
        })
      }
    }
  }, [open, initialData, reset])

  const onSubmit = async (data: ParentFormValues) => {
    const result = await upsertParent(data)
    if (result.success) {
      toast.success(initialData ? "Cập nhật thành công!" : "Thêm mới thành công!")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(trigger as React.ReactElement) || <Button>+ Thêm phụ huynh</Button>} />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa thông tin" : "Thêm phụ huynh"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input id="fullName" {...register("fullName")} placeholder="Tên phụ huynh" />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship">Mối quan hệ</Label>
              <Input id="relationship" {...register("relationship")} placeholder="Bố/Mẹ/Ông/Bà..." />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...register("email")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" {...register("address")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>

          <div className="space-y-2">
            <Label>Liên kết học viên</Label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
              {students.length === 0 && (
                <p className="text-sm text-muted-foreground">Không có học viên nào.</p>
              )}
              {students.map((student) => (
                <div key={student.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`student-${student.id}`} 
                    checked={selectedStudentIds.includes(student.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setValue("studentIds", [...selectedStudentIds, student.id])
                      } else {
                        setValue("studentIds", selectedStudentIds.filter(id => id !== student.id))
                      }
                    }}
                  />
                  <Label htmlFor={`student-${student.id}`} className="font-normal cursor-pointer">
                    {student.fullName} {student.phone ? `- ${student.phone}` : ""}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
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
