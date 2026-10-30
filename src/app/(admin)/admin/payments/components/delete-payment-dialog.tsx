"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { deletePayment } from "../actions"

/** Xác nhận xoá phiếu thu lập nhầm. Chỉ mở cho phiếu chưa thu tiền (server cũng chặn phiếu đã thu) */
export function DeletePaymentDialog({
  payment,
  open,
  onOpenChange,
  onDeleted,
}: {
  payment: { id: string; receiptCode?: string | null; student?: { fullName: string } | null }
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deletePayment(payment.id)
    setIsDeleting(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success("Đã xoá phiếu thu")
    onOpenChange(false)
    onDeleted()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Xoá phiếu ${payment.receiptCode ?? ""}${payment.student ? ` của ${payment.student.fullName}` : ""}?`}
      description="Dùng khi lập phiếu nhầm. Phiếu và các khoản trên phiếu bị xoá hẳn, không hoàn tác được; buổi kèm bù đã trừ vào phiếu sẽ được trừ lại ở phiếu lập sau."
      confirmText="Xoá phiếu"
      variant="destructive"
      isSubmitting={isDeleting}
      onConfirm={handleDelete}
    />
  )
}
