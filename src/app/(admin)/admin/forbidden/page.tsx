import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Không có quyền truy cập</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Tài khoản của bạn chưa được cấp quyền xem khu vực này. Vui lòng liên hệ quản trị viên nếu cần mở quyền.
        </p>
        <Button render={<Link href="/admin/dashboard" />}>Quay về Dashboard</Button>
      </div>
    </div>
  )
}
