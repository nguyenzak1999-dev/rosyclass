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
  dashboard: "Dashboard",
  reports: "Báo cáo",
  attendance: "Điểm danh",
  revenue: "Doanh thu",
  debt: "Công nợ",
  leads: "Leads CRM",
  classes: "Lớp học",
  teachers: "Giáo viên",
  notifications: "Thông báo",
  students: "Học viên",
  parents: "Phụ huynh",
  courses: "Khoá học",
  curriculums: "Chương trình học",
  schedules: "Lịch học",
  arrange: "Xếp lớp",
  teach: "Lên lớp",
  homework: "Bài tập về nhà",
  "progress-reports": "Báo cáo tiến bộ",
  payments: "Tài chính học viên",
  payroll: "Bảng lương",
  media: "Thư viện ảnh",
  cms: "Website",
  home: "Trang chủ",
  pages: "Trang",
  builder: "Thiết kế",
  blog: "Góc học tập",
  banners: "Banner",
  faqs: "FAQ",
  testimonials: "Cảm nhận",
  "placement-questions": "Câu hỏi kiểm tra",
  settings: "Cài đặt",
  site: "Website",
  branches: "Cơ sở",
  preferences: "Tuỳ chọn",
  forbidden: "Không có quyền",
  new: "Tạo mới",
  edit: "Chỉnh sửa",
}

// Đoạn là id (uuid, cuid, số) thì hiện "Chi tiết" thay vì chuỗi khó đọc
function isIdSegment(segment: string) {
  return /^[0-9a-f-]{16,}$/i.test(segment) || /^c[a-z0-9]{20,}$/i.test(segment) || /^\d+$/.test(segment)
}

export function AdminBreadcrumb() {
  const pathname = usePathname() ?? "/admin"
  const segments = pathname.split("/").filter(Boolean).slice(1) // bỏ "admin"

  const crumbs = segments.map((segment, index) => ({
    href: `/admin/${segments.slice(0, index + 1).join("/")}`,
    label: SEGMENT_LABELS[segment] ?? (isIdSegment(segment) ? "Chi tiết" : decodeURIComponent(segment)),
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
                {last ? (
                  <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
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
