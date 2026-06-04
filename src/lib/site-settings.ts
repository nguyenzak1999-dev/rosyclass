// Kiểu dữ liệu cho toàn bộ cài đặt website
export interface SiteSettings {
  // Thương hiệu
  siteName: string
  tagline: string
  logoUrl: string
  faviconUrl: string

  // Liên hệ
  address: string
  phone: string
  email: string
  workingHours: string

  // Mạng xã hội
  facebook: string
  youtube: string
  zalo: string
  tiktok: string

  // SEO mặc định
  seoTitle: string
  seoDescription: string
  ogImage: string // Thumbnail SEO

  // Footer
  copyright: string

  // Hero Section (Trang chủ)
  heroBadge?: string
  heroTitle?: string
  heroHighlight?: string
  heroDescription?: string
  heroButton1Text?: string
  heroButton1Link?: string
  heroButton2Text?: string
  heroButton2Link?: string
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "RosyClass",
  tagline: "Môi trường học tập tiếng Anh chuẩn quốc tế",
  logoUrl: "",
  faviconUrl: "",

  address: "123 Nguyễn Văn Linh, Đà Nẵng",
  phone: "1900 1234",
  email: "contact@rosyclass.edu.vn",
  workingHours: "Thứ 2 – Chủ Nhật: 7:00 – 21:00",

  facebook: "",
  youtube: "",
  zalo: "",
  tiktok: "",

  seoTitle: "RosyClass - Trung tâm tiếng Anh chuẩn quốc tế",
  seoDescription: "Học tiếng Anh tại RosyClass với đội ngũ giáo viên bản ngữ, giáo trình Cambridge chuẩn quốc tế.",
  ogImage: "",

  copyright: "© 2026 RosyClass English Center. All rights reserved.",

  heroBadge: "Trung tâm tiếng Anh số 1",
  heroTitle: "Mở khóa tiềm năng. \n",
  heroHighlight: "Kiến tạo tương lai.",
  heroDescription: "Đánh thức phản xạ ngôn ngữ với 100% giáo viên bản ngữ và lộ trình học tập cá nhân hoá. Tự tin giao tiếp, chinh phục điểm số mơ ước ngay hôm nay.",
  heroButton1Text: "Đăng ký Test miễn phí",
  heroButton1Link: "/kiem-tra-trinh-do",
  heroButton2Text: "Xem lịch khai giảng",
  heroButton2Link: "/khoa-hoc",
}

// Slug dùng để lưu settings trong Page model
export const SITE_SETTINGS_SLUG = "site-settings"
