"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Download, User, ClipboardList, Receipt, FileCheck, BookOpen, File } from "lucide-react"

const documentTypes = [
  { id: "avatar", label: "Ảnh đại diện", icon: User, accept: "image/*" },
  { id: "registration", label: "Phiếu đăng ký", icon: ClipboardList, accept: ".pdf,.doc,.docx" },
  { id: "payment_receipt", label: "Biên lai thanh toán", icon: Receipt, accept: ".pdf,.jpg,.png" },
  { id: "placement_result", label: "Kết quả kiểm tra đầu vào", icon: FileCheck, accept: ".pdf,.jpg,.png" },
  { id: "learning_contract", label: "Hợp đồng học tập", icon: BookOpen, accept: ".pdf,.doc" },
  { id: "other", label: "Tài liệu khác", icon: File, accept: "*" },
]

export function DocumentsTab({ student }: { student: any }) {
  const handleUpload = (docType: string) => {
    // In production: trigger file input and upload to Supabase Storage
    const input = document.createElement("input")
    input.type = "file"
    input.accept = documentTypes.find(d => d.id === docType)?.accept || "*"
    input.onchange = () => {
      // TODO: upload file
      alert("Tính năng tải lên đang được phát triển. Kết nối Supabase Storage để kích hoạt.")
    }
    input.click()
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Hồ sơ tài liệu</h3>
        <p className="text-sm text-muted-foreground">Tải lên và quản lý tài liệu học viên</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentTypes.map(({ id, label, icon: Icon }) => (
          <Card key={id} className="hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Badge variant="outline" className="text-xs px-1">Chưa tải lên</Badge>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleUpload(id)}>
                <Upload className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-2">
        <CardContent className="py-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">Kéo & thả tài liệu vào đây</p>
          <p className="text-xs text-muted-foreground mt-1">Hỗ trợ PDF, Word, Excel, hình ảnh (tối đa 10MB mỗi file)</p>
          <Button size="sm" className="mt-4" variant="outline" onClick={() => handleUpload("other")}>
            <Upload className="mr-2 h-4 w-4" /> Chọn tài liệu từ máy
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
