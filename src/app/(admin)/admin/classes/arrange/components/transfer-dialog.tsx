"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react"
import { transferStudentToClass } from "@/app/(admin)/admin/classes/actions"
import { toast } from "sonner"

interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: { id: string; fullName: string } | null
  fromClass: { id: string; name: string } | null
  toClass: { id: string; name: string } | null
  onSuccess?: () => void
}

export function TransferDialog({
  open,
  onOpenChange,
  student,
  fromClass,
  toClass,
  onSuccess,
}: TransferDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTransfer = async () => {
    if (!student || !fromClass || !toClass) return
    setIsSubmitting(true)
    const res = await transferStudentToClass(student.id, fromClass.id, toClass.id)
    setIsSubmitting(false)

    if (res.success) {
      toast.success(
        `Đã chuyển ${student.fullName} từ "${res.data?.fromClassName}" sang "${res.data?.toClassName}"`
      )
      onOpenChange(false)
      onSuccess?.()
    } else {
      toast.error(res.error)
    }
  }

  if (!student || !fromClass || !toClass) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Chuyển lớp cho học viên</DialogTitle>
          <DialogDescription>
            Hành động này sẽ chuyển học viên sang lớp mới và cập nhật trạng thái lớp cũ thành
            DROPPED.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Học viên</Label>
            <p className="font-medium">{student.fullName}</p>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex-1 min-w-0">
              <Label className="text-xs text-muted-foreground">Từ lớp</Label>
              <p className="font-medium truncate">{fromClass.name}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Label className="text-xs text-muted-foreground">Sang lớp</Label>
              <p className="font-medium truncate">{toClass.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-yellow-800">
              <p className="font-medium">Lưu ý</p>
              <p className="text-xs mt-0.5">
                Lớp cũ sẽ được đánh dấu DROPPED. Các buổi học đã qua vẫn giữ nguyên dữ liệu.
                Học viên có thể được chuyển lại nếu cần.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button onClick={handleTransfer} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang chuyển...
              </>
            ) : (
              "Xác nhận chuyển lớp"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
