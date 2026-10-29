"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { leadSchema } from "@/lib/schemas/lead"
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

// Ô tuổi là chuỗi trong form (bỏ trống được); đổi sang số khi gửi
const leadFormSchema = leadSchema.extend({
  age: z.string().trim().regex(/^\d{0,3}$/, "Tuổi không hợp lệ").optional().nullable(),
})

type LeadDialogValues = z.infer<typeof leadFormSchema>

const LEAD_STATUS_ITEMS = [
  { value: "NEW", label: "Mới" },
  { value: "CONTACTED", label: "Đã liên hệ" },
  { value: "NO_ANSWER", label: "Không nghe máy" },
  { value: "CONSULTED", label: "Đã tư vấn" },
  { value: "PLACEMENT_TEST_BOOKED", label: "Đã đặt lịch test" },
  { value: "TESTED", label: "Đã test" },
  { value: "WAITING_FOR_PAYMENT", label: "Chờ thanh toán" },
  { value: "ENROLLED", label: "Đã nhập học" },
  { value: "LOST", label: "Không quan tâm (Lost)" },
]

const EMPTY_LEAD_FORM: LeadDialogValues = {
  fullName: "",
  phone: "",
  email: "",
  age: "",
  parentName: "",
  parentPhone: "",
  status: "NEW",
  notes: "",
}

/** Bản ghi lead (null từ DB, lead từ form công khai thường thiếu nhiều trường) → giá trị form */
function toLeadFormValues(lead: any): LeadDialogValues {
  return {
    id: lead.id,
    fullName: lead.fullName || "",
    phone: lead.phone || "",
    email: lead.email || "",
    age: lead.age == null ? "" : String(lead.age),
    parentName: lead.parentName || "",
    parentPhone: lead.parentPhone || "",
    learningGoal: lead.learningGoal || "",
    currentLevel: lead.currentLevel || "",
    source: lead.source || "",
    status: lead.status || "NEW",
    notes: lead.notes || "",
  }
}

interface LeadDialogProps {
  lead?: any
  trigger?: React.ReactNode
}

export function LeadDialog({ lead, trigger }: LeadDialogProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<LeadDialogValues>({
    resolver: zodResolver(leadFormSchema) as any,
    defaultValues: lead ? toLeadFormValues(lead) : EMPTY_LEAD_FORM
  })

  const status = watch("status")

  React.useEffect(() => {
    if (open) {
      reset(lead ? toLeadFormValues(lead) : EMPTY_LEAD_FORM)
    }
  }, [open, lead, reset])

  const onSubmit = async (data: LeadDialogValues) => {
    const result = await upsertLead({ ...data, age: data.age ? Number(data.age) : null })
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
              <Input id="age" type="number" min={0} {...register("age")} />
              {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
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
            <Select value={status} onValueChange={(value: any) => setValue("status", value)} items={LEAD_STATUS_ITEMS}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUS_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
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
