import type { SiteSettings } from "@/lib/site-settings"
import { isSafeImage, isSafeLink } from "./fields"
import { PAGE_DOCUMENT_VERSION } from "./constants"
import { createBlock, normalizeBlocks, type Block, type PageDocument } from "./document"

const text = (value: string | undefined | null, fallback = "") => (value ?? "").trim() || fallback
const link = (value: string | undefined | null, fallback = "") => {
  const v = text(value, fallback)
  return isSafeLink(v) ? v : fallback
}
const image = (value: string | undefined | null, fallback = "") => {
  const v = text(value, fallback)
  return isSafeImage(v) ? v : fallback
}

/**
 * Dựng danh sách block mặc định cho trang chủ từ các field trang chủ cũ trong SiteSettings.
 * Dùng khi chưa có Page "trang-chu" (đường chuyển đổi) để nội dung giống trang chủ hiện tại.
 */
export function buildDefaultHomeBlocks(settings: SiteSettings): Block[] {
  const blocks: Block[] = [
    createBlock("hero", {
      badge: text(settings.heroBadge),
      title: text(settings.heroTitle, "Giao tiếp"),
      highlight: text(settings.heroHighlight, "tự tin"),
      description: text(settings.heroDescription),
      image: image(settings.heroImageUrl, "/demo/kids-classroom.svg"),
      imageAlt: text(settings.siteName, "RosyClass"),
      button1Text: text(settings.heroButton1Text, "Đăng ký học thử"),
      button1Link: link(settings.heroButton1Link, "/dang-ky"),
      button2Text: text(settings.heroButton2Text),
      button2Link: link(settings.heroButton2Link, "/khoa-hoc"),
      footnote: text(settings.heroFootnote),
      useBanners: true,
      background: "cream",
    }),
  ]

  if (settings.features?.length) {
    blocks.push(
      createBlock("features", {
        eyebrow: "",
        title: "",
        highlight: "",
        layout: "alternate",
        items: settings.features.map((item) => ({
          image: image(item.image),
          title: text(item.title),
          description: text(item.description),
          buttonText: text(item.buttonText),
          buttonLink: link(item.buttonLink),
        })),
        background: "white",
      })
    )
  }

  if (settings.statistics?.length) {
    blocks.push(
      createBlock("statistics", {
        items: settings.statistics.map((item) => ({ number: text(item.number), label: text(item.label) })),
        background: "cream",
      })
    )
  }

  blocks.push(
    createBlock("learningPath", {
      eyebrow: text(settings.learningPathBadge, "Lộ trình học"),
      title: text(settings.learningPathTitle, "Bốn bước để bé yêu tiếng Anh"),
      highlight: "",
      description: text(settings.learningPathDescription),
      buttonText: text(settings.learningPathButtonText),
      buttonLink: link(settings.learningPathButtonLink, "/kiem-tra-trinh-do"),
      ...(settings.learningPathSteps?.length
        ? { steps: settings.learningPathSteps.map((step) => ({ title: text(step.title), text: text(step.text) })) }
        : {}),
      background: "sky",
    }),
    createBlock("featuredCourses", {
      title: text(settings.featuredCoursesTitle, "Lớp học cho từng lứa tuổi"),
      highlight: "",
      subtitle: text(settings.featuredCoursesSubtitle),
      limit: 3,
    }),
    createBlock("upcomingClasses", {
      eyebrow: "Lớp sắp khai giảng",
      title: "Chọn lớp cho bé, giữ chỗ trước khi đủ sĩ số.",
      highlight: "giữ chỗ",
      limit: 3,
    }),
    createBlock("featuredTeachers", {
      eyebrow: "Thầy cô của bé",
      title: "Thầy cô kiên nhẫn, vui vẻ đồng hành cùng con mỗi buổi học.",
      highlight: "đồng hành",
      limit: 3,
    }),
    createBlock("testimonials", {
      eyebrow: "",
      title: text(settings.testimonialsTitle, "Ba mẹ nói gì về RosyClass?"),
      highlight: "",
      source: "db",
      limit: 5,
    }),
    createBlock("faq", {
      eyebrow: text(settings.faqBadge, "Câu hỏi thường gặp"),
      title: text(settings.faqTitle, "Những điều ba mẹ hay hỏi trước khi cho con đi học"),
      highlight: "",
      source: "db",
      limit: 4,
      // Nếu CMS chưa có FAQ, khối sẽ dùng các câu hỏi này làm dự phòng
      items: (settings.faqs ?? []).map((faq) => ({ question: text(faq.question), answer: text(faq.answer) })),
      buttonText: text(settings.faqButtonText),
      buttonLink: link(settings.faqButtonLink, "/hoi-dap"),
    }),
    createBlock("cta", {
      title: text(settings.ctaTitle, "Cho bé buổi học tiếng Anh đầu tiên"),
      highlight: "",
      description: text(settings.ctaDescription),
      buttonText: text(settings.ctaButtonText, "Đăng ký ngay"),
      buttonLink: link(settings.ctaButtonLink, "/dang-ky"),
    })
  )

  // Chạy qua normalize để đảm bảo mọi giá trị khớp schema (vd: chuỗi quá dài bị thay bằng mặc định)
  return normalizeBlocks(blocks)
}

export function buildDefaultHomeDocument(settings: SiteSettings): PageDocument {
  return { version: PAGE_DOCUMENT_VERSION, blocks: buildDefaultHomeBlocks(settings) }
}

/** Khối khởi đầu cho một trang mới */
export function buildStarterBlocks(title: string): Block[] {
  return [
    createBlock("hero", {
      badge: "",
      title: title || "Trang mới",
      highlight: "",
      description: "Giới thiệu ngắn về nội dung trang.",
      useBanners: false,
      button2Text: "",
      button2Link: "",
    }),
    createBlock("richText"),
    createBlock("cta"),
  ]
}
