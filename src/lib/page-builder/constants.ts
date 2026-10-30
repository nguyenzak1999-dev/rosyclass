import { SITE_SETTINGS_SLUG } from "@/lib/site-settings"

/** Slug của Page lưu trang chủ dựng bằng page builder */
export const HOME_PAGE_SLUG = "trang-chu"

export const PAGE_DOCUMENT_VERSION = 1

/** Trạng thái Page được coi là đang hiển thị công khai */
export const PUBLIC_PAGE_STATUSES = ["ACTIVE", "PUBLISHED"] as const

export const PAGE_STATUSES = ["ACTIVE", "INACTIVE", "DRAFT", "PUBLISHED"] as const
export type PageStatus = (typeof PAGE_STATUSES)[number]

export function isPublicStatus(status: string) {
  return (PUBLIC_PAGE_STATUSES as readonly string[]).includes(status)
}

/**
 * Slug hệ thống: không render qua route /[slug] và không cho trang tuỳ chỉnh dùng.
 * Gồm các Page dùng để lưu cấu hình và các route tĩnh đang có của website.
 */
export const SYSTEM_PAGE_SLUGS = [SITE_SETTINGS_SLUG, HOME_PAGE_SLUG] as const

export const RESERVED_PAGE_SLUGS: readonly string[] = [
  ...SYSTEM_PAGE_SLUGS,
  // Route tĩnh công khai
  "khoa-hoc",
  "giao-vien",
  "goc-hoc-tap",
  "hoi-dap",
  "lich-khai-giang",
  "lien-he",
  "dang-ky",
  "kiem-tra-trinh-do",
  "ve-chung-toi",
  "chinh-sach-bao-mat",
  "phu-huynh",
  "xem-truoc",
  // Route hệ thống
  "admin",
  "admin-login",
  "api",
  "_next",
  "robots.txt",
  "sitemap.xml",
  "favicon.ico",
]

/**
 * Trang hệ thống thiết kế lại được bằng page builder. Route vẫn giữ phần chức năng (danh sách, form, bài kiểm tra…)
 * trong khối "Nội dung chính của trang"; admin xếp thêm khối quanh nó hoặc xoá đi để tự thiết kế.
 * Chưa có bản thiết kế đã xuất bản thì website hiển thị trang mặc định như cũ.
 */
export const DESIGNABLE_SYSTEM_PAGES = {
  "khoa-hoc": { title: "Khóa học", content: "Danh sách khóa học kèm bộ lọc" },
  "lich-khai-giang": { title: "Lịch khai giảng", content: "Danh sách lớp sắp khai giảng và form giữ chỗ" },
  "giao-vien": { title: "Giáo viên", content: "Danh sách giáo viên" },
  "ve-chung-toi": { title: "Về chúng tôi", content: "Giới thiệu trung tâm, số liệu thực tế" },
  "goc-hoc-tap": { title: "Góc học tập", content: "Danh sách bài viết" },
  "hoi-dap": { title: "Hỏi đáp", content: "Danh sách câu hỏi thường gặp" },
  "lien-he": { title: "Liên hệ", content: "Thông tin liên hệ và form gửi yêu cầu tư vấn" },
  "dang-ky": { title: "Đăng ký học thử", content: "Form đăng ký học thử" },
  "kiem-tra-trinh-do": { title: "Kiểm tra trình độ", content: "Bài kiểm tra trình độ và gợi ý khóa học" },
  "chinh-sach-bao-mat": { title: "Chính sách bảo mật", content: "Nội dung chính sách bảo mật" },
} as const

export type SystemPageSlug = keyof typeof DESIGNABLE_SYSTEM_PAGES

export const SYSTEM_PAGE_SLUGS_LIST = Object.keys(DESIGNABLE_SYSTEM_PAGES) as SystemPageSlug[]

export function isSystemPageSlug(slug: string): slug is SystemPageSlug {
  return Object.prototype.hasOwnProperty.call(DESIGNABLE_SYSTEM_PAGES, slug)
}

/** Trang có slug cố định (trang chủ, trang hệ thống): không đổi slug, không vào route /[slug] */
export function isFixedSlug(slug: string) {
  return slug === HOME_PAGE_SLUG || isSystemPageSlug(slug)
}

export function isReservedSlug(slug: string) {
  return RESERVED_PAGE_SLUGS.includes(slug.toLowerCase())
}

export const PAGE_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function getPublicPagePath(slug: string) {
  return slug === HOME_PAGE_SLUG ? "/" : `/${slug}`
}
