"use client"

import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"
import { formatVietnam } from "@/lib/curriculum"
import { toast } from "sonner"

interface ExportExcelButtonProps {
  data: any[]
}

export function ExportExcelButton({ data }: ExportExcelButtonProps) {
  const handleExport = () => {
    try {
      if (data.length === 0) {
        toast.error("Không có dữ liệu để xuất")
        return
      }

      const exportData = data.map((c) => ({
        "Tên khóa học": c.name,
        "Slug": c.slug,
        "Cấp độ": c.level,
        "Số buổi": c.totalSessions,
        "Thời lượng (phút)": c.sessionDurationMinutes,
        "Học phí (VNĐ)": c.tuitionFee,
        "Giá ưu đãi (VNĐ)": c.salePrice || "—",
        "Trạng thái": c.status,
        "Hiển thị trên web": c.isPublished ? "Có" : "Không",
        "Ngày tạo": formatVietnam(new Date(c.createdAt), "dd/MM/yyyy HH:mm"),
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      ws["!cols"] = [
        { wch: 30 }, // Tên
        { wch: 25 }, // Slug
        { wch: 18 }, // Level
        { wch: 10 }, // Số buổi
        { wch: 15 }, // Thời lượng
        { wch: 15 }, // Học phí
        { wch: 15 }, // Giá ưu đãi
        { wch: 15 }, // Trạng thái
        { wch: 15 }, // Hiển thị
        { wch: 18 }, // Ngày tạo
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Khóa học")
      XLSX.writeFile(wb, `Khoa-hoc_${formatVietnam(new Date(), "dd-MM-yyyy")}.xlsx`)
      toast.success(`Đã xuất ${data.length} khóa học`)
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
