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
  tagline: "Môi trường học tập tiếng Anh chuẩn quốc tế",
  logoUrl: "",
  faviconUrl: "",

  address: "123 Nguyễn Văn Linh, Đà Nẵng",
  phone: "1900 1234",
  email: "contact@rosyclass.edu.vn",
  workingHours: "Thứ 2 – Chủ Nhật: 7:00 – 21:00",
  googleMapEmbedUrl: "",

  // Cấu hình tài khoản nhận học phí (VietQR)
  paymentBankCode: "MB",
  paymentBankAccountNo: "",
  paymentBankAccountName: "",

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

  featuredCoursesTitle: "Khóa học nổi bật",
  featuredCoursesSubtitle: "Khám phá các lộ trình học được thiết kế riêng biệt để giúp bạn đạt được mục tiêu ngôn ngữ của mình một cách tự nhiên nhất.",

  learningPathBadge: "Lộ trình học",
  learningPathTitle: "Không học theo cảm tính. Mỗi học viên có một đường đi rõ ràng.",
  learningPathDescription: "RosyClass bắt đầu bằng đánh giá năng lực, sau đó ghép lớp và đo tiến bộ theo từng giai đoạn để phụ huynh và học viên luôn biết mình đang ở đâu.",
  learningPathButtonText: "Kiểm tra trình độ miễn phí",
  learningPathButtonLink: "/kiem-tra-trinh-do",
  learningPathSteps: [
    {
      title: "Kiểm tra đầu vào",
      text: "Học viên làm bài đánh giá ngắn để xác định trình độ, mục tiêu và khung giờ học phù hợp.",
    },
    {
      title: "Xếp lớp đúng lộ trình",
      text: "Tư vấn viên đề xuất khóa học theo năng lực hiện tại: trẻ em, giao tiếp, IELTS hoặc 1 kèm 1.",
    },
    {
      title: "Luyện phản xạ trên lớp",
      text: "Lớp nhỏ, nhiều tương tác, giáo viên sửa lỗi phát âm và cách dùng câu ngay trong buổi học.",
    },
    {
      title: "Theo dõi tiến bộ",
      text: "Sau mỗi chặng học, học viên nhận nhận xét cụ thể để biết mình đã tốt lên ở đâu.",
    }
  ],

  features: [
    {
      image: "/hero_slider_2.png",
      title: "Không bỏ lỡ khoảnh khắc với giáo viên bản ngữ",
      description: "Từ các lớp học nhóm đến các buổi luyện nói 1 kèm 1, cảm giác như đang trò chuyện trực tiếp cùng giáo viên thông qua phương pháp tương tác cao.",
      buttonText: "Gặp gỡ đội ngũ",
      buttonLink: "/giao-vien"
    },
    {
      image: "/hero_slider_3.png",
      title: "Giao tiếp tự do",
      description: "Với lộ trình học cá nhân hóa tại RosyClass, các bài nói và hội thoại của bạn được xây dựng bài bản. Chỉ bạn và giáo viên mới có thể hiểu được sự tiến bộ mỗi ngày.",
      buttonText: "Khám phá khóa học",
      buttonLink: "/khoa-hoc"
    },
    {
      image: "/english-center-hero.png",
      title: "Kết nối cùng lớp học nhỏ",
      description: "Dù là lên kế hoạch thực hành ngoại khóa hay đơn giản là trò chuyện nhóm, các cuộc hội thoại lớp học luôn diễn ra tự nhiên và dễ dàng.",
      buttonText: "Tìm hiểu môi trường học",
      buttonLink: "/khoa-hoc"
    },
    {
      image: "/hero_slider_2.png",
      title: "Thể hiện bản thân",
      description: "Thể hiện bản thân không giới hạn. Sử dụng tiếng Anh tự nhiên trong đời sống hàng ngày hoặc chia sẻ những câu chuyện dài hơn về bản thân.",
      buttonText: "Kiểm tra trình độ",
      buttonLink: "/kiem-tra-trinh-do"
    }
  ],

  statistics: [
    { number: "5000+", label: "Học viên tin tưởng" },
    { number: "100+", label: "Giáo viên xuất sắc" },
    { number: "98%", label: "Đạt mục tiêu đề ra" },
    { number: "5", label: "Cơ sở toàn quốc" }
  ],

  testimonialsTitle: "Học viên nói gì về chúng tôi?",
  testimonials: [
    {
      avatar: "/hero_slider_2.png",
      name: "Mai Phương",
      content: "Từ một người ngại nói tiếng Anh, mình đã tự tin thuyết trình trước công ty chỉ sau 3 tháng học tại RosyClass. Giáo viên cực kỳ tận tâm! ✨",
      time: "10:24"
    },
    {
      avatar: "",
      name: "Tuấn Anh (IELTS 7.5)",
      content: "Môi trường học rất tuyệt, các bạn cùng lớp hòa đồng và lộ trình cá nhân hóa giúp mình tiết kiệm rất nhiều thời gian ôn luyện.",
      time: "11:53"
    },
    {
      avatar: "/hero_slider_3.png",
      name: "Hương Giang",
      content: "Mình rất thích tính năng đánh giá hàng tuần, nó giúp mình biết được mình đang yếu điểm nào để khắc phục ngay. 10 điểm cho chất lượng!",
      time: "14:05"
    }
  ],

  faqBadge: "Câu hỏi thường gặp",
  faqTitle: "Những điều phụ huynh và học viên thường hỏi trước khi bắt đầu.",
  faqButtonText: "Xem thêm câu hỏi",
  faqButtonLink: "/hoi-dap",
  faqs: [
    {
      question: "Học thử và kiểm tra trình độ có mất phí không?",
      answer: "RosyClass hỗ trợ kiểm tra trình độ miễn phí. Sau bài test, tư vấn viên đề xuất lớp và lộ trình phù hợp trước khi bạn quyết định đăng ký."
    },
    {
      question: "Một lớp có bao nhiêu học viên?",
      answer: "Lớp được giữ ở quy mô nhỏ để giáo viên có thời gian sửa lỗi phát âm, theo dõi phản xạ nói và hỗ trợ từng học viên trong buổi học."
    },
    {
      question: "Phụ huynh theo dõi tiến bộ của con bằng cách nào?",
      answer: "Trung tâm có nhận xét định kỳ về chuyên cần, mức độ tham gia, điểm mạnh và phần cần luyện thêm để phụ huynh nắm được tiến độ."
    },
    {
      question: "Nếu nghỉ một buổi thì có được học bù không?",
      answer: "Tư vấn viên sẽ hỗ trợ sắp xếp phương án phù hợp theo quy định từng lớp và tình trạng lịch học hiện tại."
    }
  ],

  ctaTitle: "Phát triển tương lai",
  ctaDescription: "RosyClass giúp bạn mở ra cánh cửa toàn cầu để mang lại những cơ hội tuyệt vời. Phát triển tiếng Anh, tăng cơ hội nghề nghiệp, và xây dựng mối quan hệ.",
  ctaButtonText: "Đăng ký ngay",
  ctaButtonLink: "/dang-ky",

  leadNotificationSettings: DEFAULT_LEAD_NOTIFICATION_SETTINGS,
}

// Slug dùng để lưu settings trong Page model
export const SITE_SETTINGS_SLUG = "site-settings"
