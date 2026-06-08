"use client"

import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"
import { type ClassData } from "./columns"

interface ExportExcelButtonProps {
  data: ClassData[]
}

export function ExportExcelButton({ data }: ExportExcelButtonProps) {
  const handleExport = async () => {
    try {
      if (data.length === 0) {
        toast.error("Không có dữ liệu để xuất")
        return
      }

      const XLSX = await import("xlsx")
      const exportData = data.map((c) => ({
        "Tên lớp": c.name,
        "Khóa học": c.course?.name || "—",
        "Giáo viên": c.teacher?.fullName || "—",
        "Chi nhánh": c.branch?.name || "—",
        "Sĩ số": c._count?.students ?? 0,
        "Sĩ số tối đa": c.maxStudents,
        "Trạng thái": c.status,
        "Ngày bắt đầu": c.startDate
          ? formatDate(c.startDate)
          : "—",
        "Ngày kết thúc dự kiến": c.expectedEndDate
          ? formatDate(c.expectedEndDate)
          : "—",
        "Ngày tạo": formatDateTime(c.createdAt),
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      ws["!cols"] = [
        { wch: 25 }, // Tên lớp
        { wch: 30 }, // Khóa học
        { wch: 25 }, // GV
        { wch: 20 }, // Chi nhánh
        { wch: 10 }, // Sĩ số
        { wch: 12 }, // Max
        { wch: 15 }, // Trạng thái
        { wch: 14 }, // Bắt đầu
        { wch: 18 }, // Kết thúc
        { wch: 18 }, // Ngày tạo
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Lớp học")
      XLSX.writeFile(wb, `Lop-hoc_${formatFileDate(new Date())}.xlsx`)
      toast.success(`Đã xuất ${data.length} lớp học`)
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

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value))
}

function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatFileDate(value: Date) {
  const day = String(value.getDate()).padStart(2, "0")
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const year = value.getFullYear()
  return `${day}-${month}-${year}`
}
