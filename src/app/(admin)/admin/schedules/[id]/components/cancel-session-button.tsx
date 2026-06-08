"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CalendarOff, RotateCcw } from "lucide-react"
import { cancelSession } from "@/app/(admin)/admin/classes/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CancelSessionButtonProps {
  sessionId: string
  sessionStatus: string
}

export function CancelSessionButton({ sessionId, sessionStatus }: CancelSessionButtonProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [reason, setReason] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Có thể huỷ khi SCHEDULED hoặc MAKE_UP
  const canCancel = sessionStatus === "SCHEDULED" || sessionStatus === "MAKE_UP"
  if (!canCancel) return null

  const handleCancel = async () => {
    setIsSubmitting(true)
    const res = await cancelSession({
      id: sessionId,
      reason: reason.trim() || undefined,
    })
    setIsSubmitting(false)
    if (res.success) {
      toast.success("Đã huỷ buổi học")
      if (res.data?.warning) toast.warning(res.data.warning)
      setOpen(false)
      setReason("")
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
      >
        <CalendarOff className="w-4 h-4 mr-2" /> Huỷ buổi học
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Huỷ buổi học</DialogTitle>
            <DialogDescription>
              Buổi học sẽ được đánh dấu là CANCELLED. Học viên sẽ không điểm danh được nữa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do huỷ (tuỳ chọn)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Giáo viên ốm, lớp nghỉ lễ..."
              className="min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Quay lại
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isSubmitting}>
              {isSubmitting ? "Đang huỷ..." : "Xác nhận huỷ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
