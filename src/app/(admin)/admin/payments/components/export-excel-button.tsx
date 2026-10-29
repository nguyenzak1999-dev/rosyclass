"use client"

import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"
import { formatVietnam, VIETNAM_TIME_ZONE } from "@/lib/curriculum"

interface ExportExcelButtonProps {
  data: any[]
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value: Date | string | null): string {
  if (!value) return "—"
  return new Intl.DateTimeFormat("vi-VN", { timeZone: VIETNAM_TIME_ZONE }).format(new Date(value))
}

export function ExportExcelButton({ data }: ExportExcelButtonProps) {
  const handleExport = async () => {
    try {
      if (data.length === 0) {
        toast.error("Không có dữ liệu để xuất")
        return
      }
      const XLSX = await import("xlsx")
      const exportData = data.map((p) => ({
        "Mã phiếu": p.receiptCode || p.id,
        "Học viên": p.student?.fullName || "—",
        "Lớp": p.class?.name || "—",
        "Khóa học": p.course?.name || "—",
        "Tổng tiền": p.totalAmount,
        "Đã trả": p.paidAmount,
        "Còn lại": p.remainingAmount,
        "Phương thức": p.paymentMethod,
        "Trạng thái": p.status,
        "Ngày thanh toán": formatDate(p.paymentDate),
        "Hạn thanh toán": formatDate(p.dueDate),
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      ws["!cols"] = [
        { wch: 22 }, // Mã phiếu
        { wch: 25 }, // HV
        { wch: 25 }, // Lớp
        { wch: 30 }, // Khóa
        { wch: 15 }, // Tổng
        { wch: 15 }, // Đã trả
        { wch: 15 }, // Còn
        { wch: 18 }, // Method
        { wch: 15 }, // Status
        { wch: 14 }, // Date
        { wch: 14 }, // Due
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Thanh toán")
      XLSX.writeFile(wb, `Thanh-toan_${formatVietnam(new Date(), "dd-MM-yyyy")}.xlsx`)
      toast.success(`Đã xuất ${data.length} phiếu thanh toán`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Có lỗi khi xuất Excel")
    }
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <FileSpreadsheet className="w-4 h-4 mr-2" /> Xuất Excel
    </Button>
  )
}
