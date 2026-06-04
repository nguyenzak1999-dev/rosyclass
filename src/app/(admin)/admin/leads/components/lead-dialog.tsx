"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { leadSchema, type LeadFormValues } from "@/lib/schemas/lead"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { upsertLead } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface LeadDialogProps {
  lead?: any
  trigger?: React.ReactNode
}

export function LeadDialog({ lead, trigger }: LeadDialogProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema) as any,
    defaultValues: lead || {
      fullName: "",
      phone: "",
      email: "",
      status: "NEW",
    }
  })

  const status = watch("status")

  React.useEffect(() => {
    if (open) {
      if (lead) {
        reset(lead)
      } else {
        reset({
          fullName: "",
          phone: "",
          email: "",
          status: "NEW",
        })
      }
    }
  }, [open, lead, reset])

  const onSubmit = async (data: LeadFormValues) => {
    const result = await upsertLead(data)
    if (result.success) {
      toast.success(lead ? "Cập nhật thành công!" : "Thêm mới thành công!")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(trigger as React.ReactElement) || <Button>+ Thêm lead mới</Button>} />
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? "Sửa thông tin khách hàng" : "Thêm khách hàng tiềm năng"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input id="fullName" {...register("fullName")} placeholder="Nguyễn Văn A" />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input id="phone" {...register("phone")} placeholder="0987654321" />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...register("email")} placeholder="email@example.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Tuổi</Label>
              <Input id="age" type="number" {...register("age")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentName">Tên phụ huynh</Label>
              <Input id="parentName" {...register("parentName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentPhone">SĐT Phụ huynh</Label>
              <Input id="parentPhone" {...register("parentPhone")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select value={status} onValueChange={(value: any) => setValue("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">Mới</SelectItem>
                <SelectItem value="CONTACTED">Đã liên hệ</SelectItem>
                <SelectItem value="NO_ANSWER">Không nghe máy</SelectItem>
                <SelectItem value="CONSULTED">Đã tư vấn</SelectItem>
                <SelectItem value="PLACEMENT_TEST_BOOKED">Đã đặt lịch test</SelectItem>
                <SelectItem value="TESTED">Đã test</SelectItem>
                <SelectItem value="WAITING_FOR_PAYMENT">Chờ thanh toán</SelectItem>
                <SelectItem value="ENROLLED">Đã nhập học</SelectItem>
                <SelectItem value="LOST">Không quan tâm (Lost)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Ghi chú về khách hàng này..." />
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
