"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { branchSchema, type BranchFormValues } from "@/lib/schemas/branch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { upsertBranch } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface BranchDialogProps {
  initialData?: any
  trigger?: React.ReactNode
}

/** Bản ghi DB có phone/address null mà schema chỉ nhận string: không chuẩn hoá thì sửa chi nhánh không lưu được */
function toFormValues(data: any): BranchFormValues {
  return {
    id: data?.id,
    name: data?.name ?? "",
    phone: data?.phone ?? "",
    address: data?.address ?? "",
    isActive: data?.isActive ?? true
  }
}

export function BranchDialog({ initialData, trigger }: BranchDialogProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema) as any,
    defaultValues: toFormValues(initialData)
  })

  const isActive = watch("isActive")

  React.useEffect(() => {
    if (open) {
      reset(toFormValues(initialData))
    }
  }, [open, initialData, reset])

  const onSubmit = async (data: BranchFormValues) => {
    const result = await upsertBranch(data)
    if (result.success) {
      toast.success(initialData ? "Cập nhật thành công!" : "Tạo chi nhánh thành công!")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(trigger as React.ReactElement) || <Button>+ Thêm chi nhánh</Button>} />
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa chi nhánh" : "Thêm chi nhánh"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên chi nhánh *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input id="phone" {...register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" {...register("address")} />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="isActive" 
              checked={isActive} 
              onCheckedChange={(checked) => setValue("isActive", checked === true)} 
            />
            <Label htmlFor="isActive" className="font-normal cursor-pointer">Đang hoạt động</Label>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu chi nhánh"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
