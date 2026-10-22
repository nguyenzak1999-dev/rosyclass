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
  googleMapEmbedUrl?: string

  // Thông tin pháp lý (hiển thị ở footer theo quy định với website thương mại)
  legalName?: string
  taxCode?: string
  legalRepresentative?: string

  // Cấu hình tài khoản nhận học phí (VietQR)
  paymentBankCode?: string
  paymentBankAccountNo?: string
  paymentBankAccountName?: string

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

  // Featured Courses Section
  featuredCoursesTitle?: string
  featuredCoursesSubtitle?: string

  // Learning Path Section
  learningPathBadge?: string
  learningPathTitle?: string
  learningPathDescription?: string
  learningPathButtonText?: string
  learningPathButtonLink?: string
  learningPathSteps?: {
    title: string
    text: string
  }[]

  // Feature Sections
  features?: {
    image: string
    title: string
    description: string
    buttonText: string
    buttonLink: string
  }[]

  // Statistics Section
  statistics?: {
    number: string
    label: string
  }[]

  // Testimonials Section
  testimonialsTitle?: string
  testimonials?: {
    avatar: string
    name: string
    content: string
    time: string
  }[]

  // FAQ Section
  faqBadge?: string
  faqTitle?: string
  faqButtonText?: string
  faqButtonLink?: string
  faqs?: {
    question: string
    answer: string
  }[]

  // CTA Section
  ctaTitle?: string
  ctaDescription?: string
  ctaButtonText?: string
  ctaButtonLink?: string

  // Lead form notifications
  leadNotificationSettings?: LeadNotificationSettings
}

export type LeadFormKey = "contact" | "registration" | "placementTest" | "classSchedule"

export interface LeadFormNotificationSettings {
  enabled: boolean
  label: string
  emailEnabled: boolean
  telegramEnabled: boolean
  customerEmailSubject: string
  customerEmailHtml: string
}

export interface LeadNotificationSettings {
  emailEnabled: boolean
  telegramEnabled: boolean
  emailFrom: string
  replyToEmail: string
  telegramChatId: string
  telegramMessageTemplate: string
  forms: Record<LeadFormKey, LeadFormNotificationSettings>
}

export const DEFAULT_LEAD_NOTIFICATION_SETTINGS: LeadNotificationSettings = {
  emailEnabled: false,
  telegramEnabled: false,
  emailFrom: "RosyClass <contact@rosyclass.edu.vn>",
  replyToEmail: "contact@rosyclass.edu.vn",
  telegramChatId: "",
  telegramMessageTemplate: [
    "🔔 Lead mới từ {{formLabel}}",
    "",
    "Họ tên: {{fullName}}",
    "SĐT: {{phone}}",
    "Email: {{email}}",
    "Khóa/lớp quan tâm: {{courseInterest}}",
    "",
    "{{notes}}",
  ].join("\n"),
  forms: {
    contact: {
      enabled: true,
      label: "Form Liên hệ",
      emailEnabled: true,
      telegramEnabled: true,
      customerEmailSubject: "RosyClass đã nhận thông tin tư vấn của bạn",
      customerEmailHtml: [
        "<p>Chào {{fullName}},</p>",
        "<p>RosyClass đã nhận thông tin đăng ký tư vấn của bạn. Đội ngũ tư vấn sẽ liên hệ lại trong thời gian sớm nhất.</p>",
        "<p>Cảm ơn bạn đã quan tâm đến RosyClass.</p>",
      ].join("\n"),
    },
    registration: {
      enabled: true,
      label: "Form Đăng ký học",
      emailEnabled: true,
      telegramEnabled: true,
      customerEmailSubject: "RosyClass đã nhận đăng ký học của bạn",
      customerEmailHtml: [
        "<p>Chào {{fullName}},</p>",
        "<p>RosyClass đã nhận thông tin đăng ký học của bạn. Tư vấn viên sẽ liên hệ để xác nhận khóa học và lịch phù hợp.</p>",
        "<p>Hẹn gặp bạn tại RosyClass.</p>",
      ].join("\n"),
    },
    placementTest: {
      enabled: true,
      label: "Form Kiểm tra trình độ",
      emailEnabled: true,
      telegramEnabled: true,
      customerEmailSubject: "RosyClass đã nhận thông tin kiểm tra trình độ",
      customerEmailHtml: [
        "<p>Chào {{fullName}},</p>",
        "<p>RosyClass đã nhận thông tin kiểm tra trình độ của bạn. Kết quả và lộ trình phù hợp sẽ được tư vấn sau khi hoàn tất bài test.</p>",
        "<p>Cảm ơn bạn.</p>",
      ].join("\n"),
    },
    classSchedule: {
      enabled: true,
      label: "Form Đăng ký lớp khai giảng",
      emailEnabled: true,
      telegramEnabled: true,
      customerEmailSubject: "RosyClass đã nhận đăng ký lớp {{courseInterest}}",
      customerEmailHtml: [
        "<p>Chào {{fullName}},</p>",
        "<p>RosyClass đã nhận đăng ký lớp <strong>{{courseInterest}}</strong> của bạn. Tư vấn viên sẽ liên hệ xác nhận chỗ học và lịch khai giảng.</p>",
        "<p>Cảm ơn bạn.</p>",
      ].join("\n"),
    },
  },
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "RosyClass",
  tagline: "Tiếng Anh vui nhộn cho bé mầm non và tiểu học",
  logoUrl: "",
  faviconUrl: "",

  address: "Số 22A, ngõ 5, đường Dương Xá, xã Dương Xá, huyện Gia Lâm, TP. Hà Nội, Việt Nam",
  phone: "1900 1234",
  email: "contact@rosyclass.edu.vn",
  workingHours: "Thứ 2 – Chủ Nhật: 7:00 – 21:00",
  googleMapEmbedUrl: "",

  legalName: "Hộ Kinh Doanh Rosy Class",
  taxCode: "001093004500",
  legalRepresentative: "Phùng Tuấn Anh",

  // Cấu hình tài khoản nhận học phí (VietQR)
  paymentBankCode: "MB",
  paymentBankAccountNo: "",
  paymentBankAccountName: "",

  facebook: "",
  youtube: "",
  zalo: "",
  tiktok: "",

  seoTitle: "RosyClass – Tiếng Anh cho bé mầm non và tiểu học tại Gia Lâm",
  seoDescription: "Lớp tiếng Anh vui nhộn cho bé 3–11 tuổi tại Dương Xá, Gia Lâm: học qua bài hát, trò chơi và câu chuyện, lớp nhỏ, phụ huynh theo dõi tiến bộ của con.",
  ogImage: "/demo/og-rosyclass.png",

  copyright: "© 2026 Hộ Kinh Doanh Rosy Class. Bảo lưu mọi quyền.",

  heroBadge: "Tiếng Anh cho bé 3–11 tuổi",
  heroTitle: "Bé học tiếng Anh",
  heroHighlight: "vui mỗi ngày",
  heroDescription: "Lớp nhỏ cho bé mầm non và tiểu học. Con học qua bài hát, trò chơi và câu chuyện để tự tin nói tiếng Anh, còn ba mẹ luôn biết con đã tiến bộ ra sao.",
  heroImageUrl: "/demo/kids-classroom.svg",
  heroButton1Text: "Đăng ký học thử cho bé",
  heroButton1Link: "/dang-ky",
  heroButton2Text: "Xem các lớp",
  heroButton2Link: "/khoa-hoc",
  heroFootnote: "Bé được làm quen lớp và kiểm tra trình độ nhẹ nhàng như chơi trò chơi.",
  heroChatGroupTitle: "Lớp tiếng Anh của bé",
  heroChatGroupMeta: "& các bạn",
  heroChatJoinText: "Tham gia",
  heroChatIncomingMessage: "Hôm nay con học bài gì cô ơi?",
  heroChatIncomingTime: "17:30",
  heroChatOutgoingAuthor: "Cô giáo",
  heroChatOutgoingMessage: "Hôm nay lớp học về màu sắc và bài hát Rainbow nhé! 🌈",
  heroChatOutgoingTime: "17:32",
  heroChatReactions: "👍 ❤️ ⭐",

  featuredCoursesTitle: "Lớp học cho từng lứa tuổi",
  featuredCoursesSubtitle: "Mỗi lứa tuổi có cách học riêng: bé nhỏ làm quen qua âm thanh và vận động, bé lớn hơn tập đọc, viết và nói thành câu.",

  learningPathBadge: "Con học thế nào?",
  learningPathTitle: "Bốn bước để bé yêu tiếng Anh",
  learningPathDescription: "Từ buổi làm quen đầu tiên đến mỗi chặng học, ba mẹ đều biết con đang ở đâu và cần luyện thêm gì.",
  learningPathButtonText: "Cho bé kiểm tra trình độ",
  learningPathButtonLink: "/kiem-tra-trinh-do",
  learningPathSteps: [
    {
      title: "Làm quen và kiểm tra nhẹ nhàng",
      text: "Bé trò chuyện, chơi trò chơi cùng giáo viên để trung tâm hiểu khả năng nghe, nói và tính cách của con.",
    },
    {
      title: "Xếp lớp theo tuổi và trình độ",
      text: "Bé học cùng các bạn gần tuổi: mầm non 3–5 tuổi, tiểu học lớp 1–2 hoặc lớp 3–5.",
    },
    {
      title: "Học qua bài hát, trò chơi, câu chuyện",
      text: "Mỗi buổi học có hoạt động vận động, phát âm và thẻ hình để con nhớ từ vựng tự nhiên, không áp lực.",
    },
    {
      title: "Ba mẹ theo dõi tiến bộ",
      text: "Giáo viên nhận xét điểm mạnh và phần cần luyện thêm của từng bé để ba mẹ đồng hành cùng con ở nhà.",
    }
  ],

  features: [
    {
      image: "/demo/kids-preschool.svg",
      title: "Mầm non (3–5 tuổi)",
      description: "Bé làm quen tiếng Anh qua âm thanh, màu sắc, bài hát và vận động. Không cần biết đọc, con học bằng nghe, nhìn và chơi.",
      buttonText: "Đăng ký học thử",
      buttonLink: "/dang-ky"
    },
    {
      image: "/demo/kids-grade-1-2.svg",
      title: "Tiểu học lớp 1–2",
      description: "Bé học chữ cái, âm phonics và từ vựng theo chủ đề quen thuộc, bắt đầu nói những câu ngắn và đọc từ đơn giản.",
      buttonText: "Xem lớp lớp 1–2",
      buttonLink: "/khoa-hoc"
    },
    {
      image: "/demo/kids-grade-3-5.svg",
      title: "Tiểu học lớp 3–5",
      description: "Bé luyện đủ nghe, nói, đọc, viết và làm quen các bài thi Cambridge Starters, Movers, Flyers để tự tin hơn mỗi ngày.",
      buttonText: "Xem lớp lớp 3–5",
      buttonLink: "/khoa-hoc"
    },
    {
      image: "/demo/kids-storytime.svg",
      title: "Giờ kể chuyện và bài hát",
      description: "Những câu chuyện tranh và bài hát tiếng Anh giúp con nghe nhiều, bắt chước phát âm và yêu thích tiếng Anh từ nhỏ.",
      buttonText: "Tìm hiểu cách học",
      buttonLink: "/ve-chung-toi"
    }
  ],

  // Chỉ dùng thông tin chắc chắn; trung tâm có thể đổi thành số liệu thật trong page builder
  statistics: [
    { number: "3–11", label: "Tuổi: mầm non và tiểu học" },
    { number: "4", label: "Kỹ năng: nghe, nói, đọc, viết" },
    { number: "3", label: "Nhóm lớp theo lứa tuổi" },
    { number: "Gia Lâm", label: "Cơ sở tại Dương Xá, Hà Nội" }
  ],

  testimonialsTitle: "Ba mẹ nói gì về RosyClass?",
  // Để trống: cảm nhận chỉ lấy từ phụ huynh thật trong mục "Cảm nhận học viên"
  testimonials: [],

  faqBadge: "Ba mẹ thường hỏi",
  faqTitle: "Những điều ba mẹ hay hỏi trước khi cho con đi học",
  faqButtonText: "Xem thêm câu hỏi",
  faqButtonLink: "/hoi-dap",
  faqs: [
    {
      question: "Bé mấy tuổi thì có thể học tiếng Anh tại RosyClass?",
      answer: "Trung tâm nhận bé từ 3 đến 11 tuổi, chia lớp mầm non (3–5 tuổi) và tiểu học (lớp 1–2, lớp 3–5) để con học cùng các bạn gần tuổi."
    },
    {
      question: "Bé chưa biết đọc có học được không?",
      answer: "Được ạ. Các bé mầm non học chủ yếu qua nghe, nhìn tranh, bài hát và trò chơi, chưa cần biết đọc hay viết."
    },
    {
      question: "Ba mẹ theo dõi việc học của con bằng cách nào?",
      answer: "Giáo viên nhận xét định kỳ về chuyên cần, sự tham gia, điểm mạnh và phần con cần luyện thêm để ba mẹ cùng con ôn ở nhà."
    },
    {
      question: "Con có được học thử trước khi đăng ký không?",
      answer: "Ba mẹ để lại thông tin, tư vấn viên sẽ liên hệ sắp xếp buổi làm quen và kiểm tra trình độ nhẹ nhàng cho bé trước khi xếp lớp."
    }
  ],

  ctaTitle: "Cho bé buổi học tiếng Anh đầu tiên",
  ctaDescription: "Để lại thông tin, RosyClass sẽ gọi lại tư vấn lớp phù hợp với tuổi và trình độ của con.",
  ctaButtonText: "Đăng ký học thử",
  ctaButtonLink: "/dang-ky",

  leadNotificationSettings: DEFAULT_LEAD_NOTIFICATION_SETTINGS,
}

// Slug dùng để lưu settings trong Page model
export const SITE_SETTINGS_SLUG = "site-settings"
