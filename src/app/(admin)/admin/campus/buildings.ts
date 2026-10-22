import { PERMISSIONS, type PermissionCode } from "@/lib/auth/permission-definitions"

// Mỗi toà nhà trong khuôn viên 3D là một khu chức năng của CMS

export type BuildingId =
  | "classes"
  | "schedule"
  | "admissions"
  | "students"
  | "teachers"
  | "finance"
  | "library"
  | "principal"
  | "settings"

export interface BuildingLink {
  label: string
  href: string
  permission: PermissionCode
}

export interface BuildingDefinition {
  id: BuildingId
  name: string
  description: string
  href: string
  permission: PermissionCode
  color: string
  roof: string
  /** Kích thước thân nhà [rộng, cao, sâu] */
  size: [number, number, number]
  links: BuildingLink[]
}

export interface CampusBuilding extends BuildingDefinition {
  stat: { value: number; label: string } | null
  links: BuildingLink[]
}

export const BUILDINGS: BuildingDefinition[] = [
  {
    id: "classes",
    name: "Khu lớp học",
    description: "Lớp học, khoá học và lớp học 3D của từng lớp",
    href: "/admin/classes",
    permission: PERMISSIONS.classesRead,
    color: "#ff8fb4",
    roof: "#ff5c93",
    size: [3.4, 2.6, 2.4],
    links: [
      { label: "Lớp học", href: "/admin/classes", permission: PERMISSIONS.classesRead },
      { label: "Xếp lớp", href: "/admin/classes/arrange", permission: PERMISSIONS.classesWrite },
      { label: "Khoá học", href: "/admin/courses", permission: PERMISSIONS.coursesRead },
      { label: "Chương trình học", href: "/admin/curriculums", permission: PERMISSIONS.coursesRead },
    ],
  },
  {
    id: "schedule",
    name: "Nhà điểm danh",
    description: "Lịch học các lớp và điểm danh từng buổi",
    href: "/admin/schedules",
    permission: PERMISSIONS.schedulesRead,
    color: "#7fd3f7",
    roof: "#3bb4f2",
    size: [2.4, 2, 2.2],
    links: [
      { label: "Lên lớp hôm nay", href: "/admin/teach", permission: PERMISSIONS.attendanceRead },
      { label: "Bài tập về nhà", href: "/admin/homework", permission: PERMISSIONS.attendanceRead },
      { label: "Lịch học", href: "/admin/schedules", permission: PERMISSIONS.schedulesRead },
      { label: "Điểm danh", href: "/admin/attendance", permission: PERMISSIONS.attendanceRead },
    ],
  },
  {
    id: "admissions",
    name: "Phòng tuyển sinh",
    description: "Khách hàng tiềm năng, tư vấn và kiểm tra trình độ",
    href: "/admin/leads",
    permission: PERMISSIONS.leadsRead,
    color: "#ffd86b",
    roof: "#ffb703",
    size: [2.6, 2, 2.2],
    links: [
      { label: "Leads CRM", href: "/admin/leads", permission: PERMISSIONS.leadsRead },
      { label: "Câu hỏi kiểm tra trình độ", href: "/admin/cms/placement-questions", permission: PERMISSIONS.cmsRead },
    ],
  },
  {
    id: "students",
    name: "Nhà học viên",
    description: "Hồ sơ học viên, phụ huynh và link cổng phụ huynh",
    href: "/admin/students",
    permission: PERMISSIONS.studentsRead,
    color: "#7be0c3",
    roof: "#2ec4a0",
    size: [2.8, 2.2, 2.2],
    links: [
      { label: "Học viên", href: "/admin/students", permission: PERMISSIONS.studentsRead },
      { label: "Phụ huynh & link cổng phụ huynh", href: "/admin/parents", permission: PERMISSIONS.parentsRead },
    ],
  },
  {
    id: "teachers",
    name: "Phòng giáo viên",
    description: "Đội ngũ giáo viên và trợ giảng",
    href: "/admin/teachers",
    permission: PERMISSIONS.teachersRead,
    color: "#b79cff",
    roof: "#8c5cf0",
    size: [2.4, 2.2, 2],
    links: [{ label: "Giáo viên", href: "/admin/teachers", permission: PERMISSIONS.teachersRead }],
  },
  {
    id: "finance",
    name: "Phòng kế toán",
    description: "Học phí, công nợ và bảng lương",
    href: "/admin/payments",
    permission: PERMISSIONS.paymentsRead,
    color: "#ffb38a",
    roof: "#ff8a3d",
    size: [2.4, 2, 2],
    links: [
      { label: "Tài chính học viên", href: "/admin/payments", permission: PERMISSIONS.paymentsRead },
      { label: "Bảng lương giáo viên", href: "/admin/payroll", permission: PERMISSIONS.paymentsRead },
      { label: "Báo cáo công nợ", href: "/admin/reports/debt", permission: PERMISSIONS.reportsRead },
    ],
  },
  {
    id: "library",
    name: "Thư viện website",
    description: "Trang (page builder), góc học tập, FAQ và thư viện ảnh",
    href: "/admin/cms/pages",
    permission: PERMISSIONS.cmsRead,
    color: "#9fe0f0",
    roof: "#2b9fc4",
    size: [3, 2.4, 2.2],
    links: [
      { label: "Trang & trang chủ", href: "/admin/cms/pages", permission: PERMISSIONS.cmsRead },
      { label: "Góc học tập (blog)", href: "/admin/cms/blog", permission: PERMISSIONS.cmsRead },
      { label: "FAQ", href: "/admin/cms/faqs", permission: PERMISSIONS.cmsRead },
      { label: "Thư viện ảnh", href: "/admin/media", permission: PERMISSIONS.mediaRead },
    ],
  },
  {
    id: "principal",
    name: "Phòng hiệu trưởng",
    description: "Tổng quan và báo cáo toàn trung tâm",
    href: "/admin/dashboard",
    permission: PERMISSIONS.dashboardRead,
    color: "#ffe9a8",
    roof: "#e0a100",
    size: [2.6, 3, 2.2],
    links: [
      { label: "Dashboard", href: "/admin/dashboard", permission: PERMISSIONS.dashboardRead },
      { label: "Báo cáo", href: "/admin/reports", permission: PERMISSIONS.reportsRead },
      { label: "Thông báo", href: "/admin/notifications", permission: PERMISSIONS.dashboardRead },
    ],
  },
  {
    id: "settings",
    name: "Nhà kho cài đặt",
    description: "Thông tin website, cơ sở và tuỳ chọn giao diện",
    href: "/admin/settings/site",
    permission: PERMISSIONS.settingsRead,
    color: "#d7d2e8",
    roof: "#8a84a3",
    size: [2, 1.8, 1.8],
    links: [
      { label: "Cài đặt website", href: "/admin/settings/site", permission: PERMISSIONS.settingsRead },
      { label: "Cơ sở", href: "/admin/settings/branches", permission: PERMISSIONS.settingsRead },
      { label: "Tuỳ chọn giao diện", href: "/admin/settings/preferences", permission: PERMISSIONS.settingsRead },
    ],
  },
]

/** Xếp toà nhà thành vòng quanh sân trường; cửa chính quay vào cột cờ ở giữa */
export function buildingPlacement(index: number, total: number) {
  const radius = total <= 4 ? 6.5 : 8.5
  const angle = (index / total) * Math.PI * 2 + Math.PI / 2
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  return { x, z, rotationY: Math.atan2(-x, -z) }
}
