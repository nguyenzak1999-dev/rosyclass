import "server-only"

import { prisma } from "@/lib/prisma"
import type { SiteSettings } from "@/lib/site-settings"
import type { Block } from "./document"
import type { PageBuilderData, PbContactInfo } from "./types"

const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]

export async function safeQuery<T>(label: string, query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.warn(`[page-builder] Không thể lấy dữ liệu ${label}. Đang dùng dữ liệu dự phòng. ${message}`)
    return fallback
  }
}

export interface DataNeeds {
  courses: number
  upcomingClasses: number
  teachers: number
  banners: number
  testimonials: number
  faqs: number
  contact: boolean
}

const NO_NEEDS: DataNeeds = {
  courses: 0,
  upcomingClasses: 0,
  teachers: 0,
  banners: 0,
  testimonials: 0,
  faqs: 0,
  contact: false,
}

/** Builder preview cần mọi loại dữ liệu vì admin có thể thêm block bất kỳ lúc nào */
export const ALL_DATA_NEEDS: DataNeeds = {
  courses: 12,
  upcomingClasses: 12,
  teachers: 12,
  banners: 5,
  testimonials: 12,
  faqs: 20,
  contact: true,
}

/** Tính dữ liệu cần lấy dựa trên các block đang hiển thị (lấy limit lớn nhất cho mỗi loại) */
export function collectDataNeeds(blocks: Block[]): DataNeeds {
  const needs = { ...NO_NEEDS }
  for (const block of blocks) {
    if (block.hidden) continue
    switch (block.type) {
      case "hero":
        if (block.props.useBanners) needs.banners = 5
        break
      case "featuredCourses":
        needs.courses = Math.max(needs.courses, block.props.limit)
        break
      case "upcomingClasses":
        needs.upcomingClasses = Math.max(needs.upcomingClasses, block.props.limit)
        break
      case "featuredTeachers":
        needs.teachers = Math.max(needs.teachers, block.props.limit)
        break
      case "testimonials":
        if (block.props.source === "db") needs.testimonials = Math.max(needs.testimonials, block.props.limit)
        break
      case "faq":
        if (block.props.source === "db") needs.faqs = Math.max(needs.faqs, block.props.limit)
        break
      case "contactInfo":
        needs.contact = true
        break
    }
  }
  return needs
}

export function contactFromSettings(settings: SiteSettings): PbContactInfo {
  return {
    siteName: settings.siteName || "RosyClass",
    address: settings.address || "",
    phone: settings.phone || "",
    email: settings.email || "",
    workingHours: settings.workingHours || "",
    googleMapEmbedUrl: settings.googleMapEmbedUrl || "",
    facebook: settings.facebook || "",
    youtube: settings.youtube || "",
    zalo: settings.zalo || "",
    tiktok: settings.tiktok || "",
  }
}

/**
 * Lấy dữ liệu cho các block: mỗi loại dữ liệu đúng một truy vấn, chỉ khi có block cần.
 * Mỗi truy vấn tự bắt lỗi để DB lỗi không làm sập trang.
 */
export async function loadBlockData(
  needs: DataNeeds,
  getSettings?: () => Promise<SiteSettings>
): Promise<PageBuilderData> {
  const skip = <T,>(value: T) => Promise.resolve(value)

  const [courses, upcomingClasses, teachers, banners, testimonials, faqs, settings] = await Promise.all([
    needs.courses > 0
      ? safeQuery(
          "khoá học",
          () =>
            prisma.course.findMany({
              where: { status: "PUBLISHED", isPublished: true },
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                thumbnail: true,
                level: true,
                targetAudience: true,
              },
              orderBy: { createdAt: "asc" },
              take: needs.courses,
            }),
          []
        )
      : skip(null),
    needs.upcomingClasses > 0
      ? safeQuery(
          "lớp sắp khai giảng",
          () =>
            prisma.class.findMany({
              where: { status: "UPCOMING" },
              select: {
                id: true,
                name: true,
                startDate: true,
                maxStudents: true,
                course: { select: { name: true } },
                teacher: { select: { fullName: true } },
                branch: { select: { name: true } },
                schedules: {
                  select: { dayOfWeek: true, startTime: true, endTime: true },
                  orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
                  take: 3,
                },
                _count: { select: { students: true } },
              },
              orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
              take: needs.upcomingClasses,
            }),
          []
        )
      : skip(null),
    needs.teachers > 0
      ? safeQuery(
          "giáo viên",
          () =>
            prisma.teacher.findMany({
              where: { status: "ACTIVE", showOnHomepage: true },
              select: { id: true, fullName: true, avatar: true, bio: true, specialties: true },
              orderBy: { createdAt: "asc" },
              take: needs.teachers,
            }),
          []
        )
      : skip(null),
    needs.banners > 0
      ? safeQuery(
          "banner",
          () =>
            prisma.banner.findMany({
              where: { isActive: true },
              select: { id: true, title: true, subtitle: true, image: true, buttonText: true, buttonUrl: true },
              orderBy: [{ position: "asc" }, { createdAt: "asc" }],
              take: needs.banners,
            }),
          []
        )
      : skip(null),
    needs.testimonials > 0
      ? safeQuery(
          "cảm nhận",
          () =>
            prisma.testimonial.findMany({
              where: { isPublished: true },
              select: { id: true, avatar: true, authorName: true, authorTitle: true, content: true },
              orderBy: { createdAt: "desc" },
              take: needs.testimonials,
            }),
          []
        )
      : skip(null),
    needs.faqs > 0
      ? safeQuery(
          "FAQ",
          () =>
            prisma.faq.findMany({
              where: { status: { in: ["ACTIVE", "PUBLISHED"] } },
              select: { question: true, answer: true },
              orderBy: [{ position: "asc" }, { createdAt: "asc" }],
              take: needs.faqs,
            }),
          []
        )
      : skip(null),
    needs.contact && getSettings ? getSettings() : skip(null),
  ])

  const data: PageBuilderData = {}

  if (courses) data.courses = courses
  if (upcomingClasses) {
    data.upcomingClasses = upcomingClasses.map((item) => ({
      id: item.id,
      name: item.name,
      courseName: item.course?.name || "Đang cập nhật khoá học",
      startDate: item.startDate ? new Date(item.startDate).toISOString() : null,
      schedule:
        item.schedules.length > 0
          ? item.schedules
              .map((s) => `${dayNames[s.dayOfWeek] || "Lịch học"} ${s.startTime}-${s.endTime}`)
              .join(", ")
          : "Đang cập nhật lịch học",
      branchName: item.branch?.name || "Đang cập nhật cơ sở",
      teacherName: item.teacher?.fullName || "Đang cập nhật giáo viên",
      spotsLeft: Math.max(item.maxStudents - item._count.students, 0),
    }))
  }
  if (teachers) {
    data.teachers = teachers.map((teacher) => ({
      id: teacher.id,
      fullName: teacher.fullName,
      avatar: teacher.avatar,
      bio: teacher.bio || "",
      specialties: teacher.specialties || "",
    }))
  }
  if (banners) data.banners = banners
  if (testimonials) {
    data.testimonials = testimonials.map((item) => ({
      id: item.id,
      avatar: item.avatar,
      name: item.authorName,
      title: item.authorTitle,
      content: item.content,
    }))
  }
  if (faqs) data.faqs = faqs
  if (settings) data.contact = contactFromSettings(settings)

  return data
}
