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
  heroImageUrl?: string
  heroButton1Text?: string
  heroButton1Link?: string
  heroButton2Text?: string
  heroButton2Link?: string
  heroFootnote?: string
  heroChatGroupTitle?: string
  heroChatGroupMeta?: string
  heroChatJoinText?: string
  heroChatIncomingMessage?: string
  heroChatIncomingTime?: string
  heroChatOutgoingAuthor?: string
  heroChatOutgoingMessage?: string
  heroChatOutgoingTime?: string
  heroChatReactions?: string
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
  heroTitle: "Giao tiếp",
  heroHighlight: "tự tin",
  heroDescription: "Phương pháp học đơn giản, đáng tin cậy, phản xạ tự nhiên, dành cho mọi học viên.",
  heroImageUrl: "/english-center-hero.png",
  heroButton1Text: "Đăng ký học thử",
  heroButton1Link: "/dang-ky",
  heroButton2Text: "Xem lịch khai giảng",
  heroButton2Link: "/khoa-hoc",
  heroFootnote: "* Yêu cầu làm bài kiểm tra xếp lớp.",
  heroChatGroupTitle: "Lớp học giao tiếp",
  heroChatGroupMeta: "& 4 others",
  heroChatJoinText: "Tham gia",
  heroChatIncomingMessage: "Vẫn học lịch cũ đúng không bạn?",
  heroChatIncomingTime: "11:53",
  heroChatOutgoingAuthor: "Cô Ngọc",
  heroChatOutgoingMessage: "Sẵn sàng nhé! Hẹn gặp lại mọi người ở lớp. ✨",
  heroChatOutgoingTime: "11:59",
  heroChatReactions: "👍 ❤️ 🤓",
}

// Slug dùng để lưu settings trong Page model
export const SITE_SETTINGS_SLUG = "site-settings"
