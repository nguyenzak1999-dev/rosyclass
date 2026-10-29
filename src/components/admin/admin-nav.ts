// Điều hướng khu quản trị, sắp theo luồng công việc trong ngày của trung tâm:
// việc trên lớp → học viên → đào tạo → tài chính → báo cáo & website → quản trị.
import {
  BarChart3,
  Bell,
  BookOpen,
  BookOpenCheck,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  GraduationCap,
  Globe,
  HandCoins,
  LayoutDashboard,
  type LucideIcon,
  NotebookPen,
  Presentation,
  School,
  UserCog,
  UserPlus,
  UserRound,
  Users,
  UsersRound,
  Wallet,
  Contact,
} from "lucide-react"
import { PERMISSIONS, type PermissionCode } from "@/lib/auth/permission-definitions"

/** Khoá số đếm việc cần xử lý (layout truyền vào) */
export type NavBadgeKey = "notifications" | "makeUp" | "homework"

export type NavLink = {
  title: string
  url: string
  /** Không khai báo = mọi tài khoản quản trị đều thấy */
  permissions?: PermissionCode[]
  /** Từ khoá thêm cho ô tìm chức năng */
  keywords?: string
  badge?: NavBadgeKey
}

export type NavItem = NavLink & {
  icon: LucideIcon
  /** Mục cha thu gọn được (Báo cáo, Website) */
  children?: NavLink[]
}

export type NavSection = { label?: string; items: NavItem[] }

export const ADMIN_NAV: NavSection[] = [
  {
    items: [
      { title: "Khuôn viên", url: "/admin/campus", icon: School, keywords: "3d trang chủ bàn làm việc" },
      { title: "Tổng quan", url: "/admin/dashboard", icon: LayoutDashboard, permissions: [PERMISSIONS.dashboardRead], keywords: "dashboard thống kê" },
      { title: "Thông báo", url: "/admin/notifications", icon: Bell, badge: "notifications" },
    ],
  },
  {
    label: "Trên lớp hằng ngày",
    items: [
      { title: "Lên lớp hôm nay", url: "/admin/teach", icon: Presentation, permissions: [PERMISSIONS.attendanceRead], keywords: "dạy giáo án sao nhận xét" },
      { title: "Điểm danh", url: "/admin/attendance", icon: CalendarCheck, permissions: [PERMISSIONS.attendanceRead], keywords: "chuyên cần vắng" },
      { title: "Kèm bù", url: "/admin/make-up", icon: CalendarClock, permissions: [PERMISSIONS.attendanceRead], badge: "makeUp", keywords: "học bù nghỉ" },
      { title: "Bài tập về nhà", url: "/admin/homework", icon: NotebookPen, permissions: [PERMISSIONS.attendanceRead], badge: "homework", keywords: "homework chấm bài" },
    ],
  },
  {
    label: "Học viên & phụ huynh",
    items: [
      { title: "Tuyển sinh", url: "/admin/leads", icon: Contact, permissions: [PERMISSIONS.leadsRead], keywords: "lead crm tư vấn đăng ký kiểm tra trình độ" },
      { title: "Học viên", url: "/admin/students", icon: Users, permissions: [PERMISSIONS.studentsRead], keywords: "học sinh bé" },
      { title: "Phụ huynh", url: "/admin/parents", icon: UsersRound, permissions: [PERMISSIONS.parentsRead], keywords: "anh chị em gia đình" },
      { title: "Xếp lớp", url: "/admin/classes/arrange", icon: UserPlus, permissions: [PERMISSIONS.classesWrite], keywords: "chuyển lớp chờ xếp" },
    ],
  },
  {
    label: "Đào tạo",
    items: [
      { title: "Lớp học", url: "/admin/classes", icon: GraduationCap, permissions: [PERMISSIONS.classesRead], keywords: "lớp 1-1 gv nước ngoài" },
      { title: "Lịch học", url: "/admin/schedules", icon: CalendarDays, permissions: [PERMISSIONS.schedulesRead], keywords: "buổi học thời khoá biểu" },
      { title: "Khoá học", url: "/admin/courses", icon: BookOpen, permissions: [PERMISSIONS.coursesRead], keywords: "đơn giá học phí" },
      { title: "Chương trình học", url: "/admin/curriculums", icon: BookOpenCheck, permissions: [PERMISSIONS.coursesRead], keywords: "giáo trình unit bài" },
    ],
  },
  {
    label: "Tài chính",
    items: [
      { title: "Học phí", url: "/admin/payments", icon: Wallet, permissions: [PERMISSIONS.paymentsRead], keywords: "thanh toán phiếu thu tháng công nợ" },
      { title: "Lương giáo viên", url: "/admin/payroll", icon: HandCoins, permissions: [PERMISSIONS.paymentsRead], keywords: "bảng lương payroll" },
    ],
  },
  {
    label: "Báo cáo & website",
    items: [
      {
        title: "Báo cáo",
        url: "/admin/reports",
        icon: BarChart3,
        permissions: [PERMISSIONS.reportsRead, PERMISSIONS.paymentsRead, PERMISSIONS.attendanceRead, PERMISSIONS.leadsRead, PERMISSIONS.classesRead, PERMISSIONS.teachersRead],
        children: [
          { title: "Tổng hợp", url: "/admin/reports", permissions: [PERMISSIONS.reportsRead] },
          { title: "Doanh thu", url: "/admin/reports/revenue", permissions: [PERMISSIONS.paymentsRead] },
          { title: "Công nợ", url: "/admin/reports/debt", permissions: [PERMISSIONS.paymentsRead], keywords: "nợ học phí" },
          { title: "Chuyên cần", url: "/admin/reports/attendance", permissions: [PERMISSIONS.attendanceRead] },
          { title: "Tuyển sinh", url: "/admin/reports/leads", permissions: [PERMISSIONS.leadsRead], keywords: "chuyển đổi lead" },
          { title: "Lấp đầy lớp", url: "/admin/reports/classes", permissions: [PERMISSIONS.classesRead], keywords: "sĩ số" },
          { title: "Giờ dạy giáo viên", url: "/admin/reports/teachers", permissions: [PERMISSIONS.teachersRead], keywords: "khối lượng" },
        ],
      },
      {
        title: "Website",
        url: "/admin/cms",
        icon: Globe,
        permissions: [PERMISSIONS.cmsRead, PERMISSIONS.mediaRead, PERMISSIONS.settingsRead],
        children: [
          { title: "Trang chủ", url: "/admin/cms/home", permissions: [PERMISSIONS.cmsRead], keywords: "giao diện builder" },
          { title: "Các trang", url: "/admin/cms/pages", permissions: [PERMISSIONS.cmsRead], keywords: "page builder cms" },
          { title: "Banner", url: "/admin/cms/banners", permissions: [PERMISSIONS.cmsRead], keywords: "hero" },
          { title: "Góc học tập", url: "/admin/cms/blog", permissions: [PERMISSIONS.cmsRead], keywords: "blog bài viết" },
          { title: "Cảm nhận", url: "/admin/cms/testimonials", permissions: [PERMISSIONS.cmsRead], keywords: "testimonial đánh giá" },
          { title: "Hỏi đáp", url: "/admin/cms/faqs", permissions: [PERMISSIONS.cmsRead], keywords: "faq" },
          { title: "Đề kiểm tra trình độ", url: "/admin/cms/placement-questions", permissions: [PERMISSIONS.cmsRead], keywords: "placement test câu hỏi" },
          { title: "Thông báo form", url: "/admin/cms/notifications", permissions: [PERMISSIONS.cmsRead], keywords: "email telegram" },
          { title: "Thư viện ảnh", url: "/admin/media", permissions: [PERMISSIONS.mediaRead], keywords: "media upload" },
          { title: "Cài đặt website", url: "/admin/settings/site", permissions: [PERMISSIONS.settingsRead], keywords: "seo logo liên hệ" },
        ],
      },
    ],
  },
  {
    label: "Quản trị",
    items: [
      { title: "Giáo viên & nhân sự", url: "/admin/teachers", icon: UserCog, permissions: [PERMISSIONS.teachersRead], keywords: "tài khoản phân quyền nhân viên" },
      { title: "Chi nhánh & phòng", url: "/admin/settings/branches", icon: Building2, permissions: [PERMISSIONS.settingsRead], keywords: "cơ sở" },
      { title: "Tài khoản của tôi", url: "/admin/settings/preferences", icon: UserRound, keywords: "mật khẩu hồ sơ" },
    ],
  },
]

/** Mục đang mở: đường dẫn dài nhất khớp với trang hiện tại, để chỉ một mục được tô sáng */
export function activeNavUrl(pathname: string, urls: string[]) {
  return urls
    .filter((url) => pathname === url || pathname.startsWith(`${url}/`))
    .sort((a, b) => b.length - a.length)[0]
}

/** So khớp tìm kiếm không phân biệt dấu ("hoc phi" tìm ra "Học phí") */
export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
}
