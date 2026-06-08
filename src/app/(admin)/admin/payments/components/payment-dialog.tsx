"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { paymentSchema, type PaymentFormValues } from "@/lib/schemas/payment"
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
import { upsertPayment } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PaymentDialogProps {
  initialData?: any
  trigger?: React.ReactNode
  students: { id: string; fullName: string }[]
}

export function PaymentDialog({ initialData, trigger, students }: PaymentDialogProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: initialData || {
      studentId: "",
      totalAmount: 0,
      paidAmount: 0,
      paymentMethod: "CASH",
      status: "UNPAID",
      note: ""
    }
  })

  const studentId = watch("studentId")
  const paymentMethod = watch("paymentMethod")
  const status = watch("status")

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset(initialData)
      } else {
        reset({
          studentId: "",
          totalAmount: 0,
          paidAmount: 0,
          paymentMethod: "CASH",
          status: "UNPAID",
          note: ""
        })
      }
    }
  }, [open, initialData, reset])

  const onSubmit = async (data: PaymentFormValues) => {
    const result = await upsertPayment(data)
    if (result.success) {
      toast.success(initialData ? "Cập nhật thành công!" : "Tạo phiếu thu thành công!")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(trigger as React.ReactElement) || <Button>+ Tạo phiếu thu</Button>} />
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa phiếu thu" : "Tạo phiếu thu mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">Học viên *</Label>
            <Select value={studentId} onValueChange={(value: any) => setValue("studentId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn học viên" />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.studentId && <p className="text-sm text-destructive">{errors.studentId.message}</p>}
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Tổng tiền (VNĐ) *</Label>
              <Input id="totalAmount" type="number" {...register("totalAmount")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidAmount">Đã đóng (VNĐ)</Label>
              <Input id="paidAmount" type="number" {...register("paidAmount")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Phương thức</Label>
              <Select value={paymentMethod} onValueChange={(value: any) => setValue("paymentMethod", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Tiền mặt</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                  <SelectItem value="CARD">Quẹt thẻ</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={status} onValueChange={(value: any) => setValue("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPAID">Chưa thanh toán</SelectItem>
                  <SelectItem value="PARTIAL">Thanh toán 1 phần</SelectItem>
                  <SelectItem value="PAID">Đã thanh toán đủ</SelectItem>
                  <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
                  <SelectItem value="CANCELLED">Hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea id="note" {...register("note")} />
          </div>

          <div className="grid gap-2 pt-4 sm:flex sm:justify-end sm:space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu phiếu thu"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
