/**
 * Dữ liệu động (từ DB / cài đặt website) mà các block cần để render.
 * Tất cả đều serializable để truyền được từ server sang client component (builder preview).
 */

export interface PbCourse {
  id: string
  name: string
  slug: string
  description: string | null
  thumbnail: string | null
  level: string
  targetAudience: string | null
}

export interface PbUpcomingClass {
  id: string
  name: string
  courseName: string
  startDate: string | null
  schedule: string
  branchName: string
  teacherName: string
  spotsLeft: number
}

export interface PbTeacher {
  id: string
  fullName: string
  avatar: string | null
  bio: string
  specialties: string
}

export interface PbBanner {
  id: string
  title: string | null
  subtitle: string | null
  image: string
  buttonText: string | null
  buttonUrl: string | null
}

export interface PbTestimonial {
  id: string
  avatar: string | null
  name: string
  title: string | null
  content: string
}

export interface PbFaq {
  question: string
  answer: string
}

export interface PbContactInfo {
  siteName: string
  address: string
  phone: string
  email: string
  workingHours: string
  googleMapEmbedUrl: string
  facebook: string
  youtube: string
  zalo: string
  tiktok: string
}

export interface PageBuilderData {
  courses?: PbCourse[]
  upcomingClasses?: PbUpcomingClass[]
  teachers?: PbTeacher[]
  banners?: PbBanner[]
  testimonials?: PbTestimonial[]
  faqs?: PbFaq[]
  contact?: PbContactInfo
}
