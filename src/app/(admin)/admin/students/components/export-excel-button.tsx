"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from "xlsx"
import { format } from "date-fns"

export function ExportExcelButton({ data }: { data: any[] }) {
  const handleExport = () => {
    // Chuyển đổi dữ liệu sang dạng phẳng dễ đọc cho Excel
    const exportData = data.map(item => ({
      "Họ và tên": item.fullName,
      "Số điện thoại": item.phone || "",
      "Email": item.email || "",
      "Trạng thái": item.status === "ACTIVE" ? "Đang học" :
                    item.status === "WAITING_CLASS" ? "Chờ xếp lớp" :
                    item.status === "RESERVED" ? "Bảo lưu" :
                    item.status === "PAUSED" ? "Tạm dừng" :
                    item.status === "COMPLETED" ? "Hoàn thành" :
                    item.status === "DROPPED" ? "Đã nghỉ" : item.status,
      "Lớp hiện tại": item.className || "Chưa xếp lớp",
      "Khóa học": item.courseName || "",
      "Trình độ hiện tại": item.currentLevel || "",
      "Tên Phụ huynh": item.parentName || "",
      "Ngày nhập học": item.joinedAt ? format(new Date(item.joinedAt), "dd/MM/yyyy") : "",
    }))

    // Tạo Worksheet từ JSON
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    // Tùy chỉnh độ rộng cột
    const wscols = [
      { wch: 25 }, // Họ tên
      { wch: 15 }, // SĐT
      { wch: 25 }, // Email
      { wch: 15 }, // Trạng thái
      { wch: 20 }, // Lớp
      { wch: 20 }, // Khóa
      { wch: 15 }, // Trình độ
      { wch: 25 }, // Phụ huynh
      { wch: 15 }, // Ngày nhập học
    ]
    ws['!cols'] = wscols

    // Tạo Workbook và lưu
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách học viên")

    const dateStr = format(new Date(), "dd-MM-yyyy")
    XLSX.writeFile(wb, `Danh_Sach_Hoc_Vien_${dateStr}.xlsx`)
  }

  return (
    <Button variant="outline" className="gap-2" onClick={handleExport}>
      <Download className="w-4 h-4" /> Xuất Excel
    </Button>
  )
}
