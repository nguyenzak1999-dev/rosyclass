"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Tên tiếng Việt cho từng đoạn đường dẫn trong /admin
const SEGMENT_LABELS: Record<string, string> = {
  campus: "Khuôn viên",
  dashboard: "Tổng quan",
  reports: "Báo cáo",
  attendance: "Điểm danh",
  revenue: "Doanh thu",
  debt: "Công nợ",
  leads: "Tuyển sinh",
  classes: "Lớp học",
  teachers: "Giáo viên & nhân sự",
  notifications: "Thông báo",
  students: "Học viên",
  parents: "Phụ huynh",
  courses: "Khoá học",
  curriculums: "Chương trình học",
  schedules: "Lịch học",
  arrange: "Xếp lớp",
  teach: "Lên lớp",
  homework: "Bài tập về nhà",
  "make-up": "Kèm bù",
  "progress-reports": "Báo cáo tiến bộ",
  payments: "Học phí",
  payroll: "Lương giáo viên",
  media: "Thư viện ảnh",
  cms: "Website",
  home: "Trang chủ",
  pages: "Các trang",
  builder: "Thiết kế",
  blog: "Góc học tập",
  banners: "Banner",
  faqs: "Hỏi đáp",
  testimonials: "Cảm nhận",
  "placement-questions": "Đề kiểm tra trình độ",
  settings: "Quản trị",
  site: "Cài đặt website",
  branches: "Chi nhánh & phòng",
  preferences: "Tài khoản của tôi",
  forbidden: "Không có quyền",
  new: "Tạo mới",
  edit: "Chỉnh sửa",
}

// Cùng một đoạn nhưng nghĩa khác trong Báo cáo / Website (vd. /reports/classes là báo cáo lấp đầy lớp)
const NESTED_LABELS: Record<string, string> = {
  "reports/attendance": "Chuyên cần",
  "reports/leads": "Tuyển sinh",
  "reports/classes": "Lấp đầy lớp",
  "reports/teachers": "Giờ dạy giáo viên",
  "cms/notifications": "Thông báo form",
}

// Nhóm không có trang riêng: hiện chữ, không tạo liên kết (tránh dẫn tới trang 404)
const NON_LINK_SEGMENTS = new Set(["settings"])

// Đoạn là id (uuid, cuid, số) thì hiện "Chi tiết" thay vì chuỗi khó đọc
function isIdSegment(segment: string) {
  return /^[0-9a-f-]{16,}$/i.test(segment) || /^c[a-z0-9]{20,}$/i.test(segment) || /^\d+$/.test(segment)
}

export function AdminBreadcrumb() {
  const pathname = usePathname() ?? "/admin"
  const segments = pathname.split("/").filter(Boolean).slice(1) // bỏ "admin"

  const crumbs = segments.map((segment, index) => ({
    href: `/admin/${segments.slice(0, index + 1).join("/")}`,
    label:
      NESTED_LABELS[`${segments[index - 1]}/${segment}`] ??
      SEGMENT_LABELS[segment] ??
      (isIdSegment(segment) ? "Chi tiết" : decodeURIComponent(segment)),
    linkable: !NON_LINK_SEGMENTS.has(segment),
  }))

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink render={<Link href="/admin/campus" />}>Admin</BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1
          return (
            <Fragment key={crumb.href}>
              <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : undefined} />
              <BreadcrumbItem className={last ? "min-w-0" : "hidden sm:inline-flex"}>
                {last || !crumb.linkable ? (
                  <BreadcrumbPage className={last ? "truncate" : "text-muted-foreground"}>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
