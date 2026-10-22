import { createPermissionLayout } from "@/components/admin/permission-guard-layout"

// Bảng lương chứa lương và tài khoản ngân hàng giáo viên: chỉ ai xem được tài chính mới vào được
export default createPermissionLayout("payments")
