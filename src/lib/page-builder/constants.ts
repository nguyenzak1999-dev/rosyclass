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
  // Route hệ thống
  "admin",
  "admin-login",
  "api",
  "_next",
  "robots.txt",
  "sitemap.xml",
  "favicon.ico",
]

export function isReservedSlug(slug: string) {
  return RESERVED_PAGE_SLUGS.includes(slug.toLowerCase())
}

export const PAGE_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function getPublicPagePath(slug: string) {
  return slug === HOME_PAGE_SLUG ? "/" : `/${slug}`
}
