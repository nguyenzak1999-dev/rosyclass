import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Contact,
  GalleryHorizontalEnd,
  GraduationCap,
  HelpCircle,
  Images,
  type LucideIcon,
  Megaphone,
  MessageSquareQuote,
  MoveVertical,
  PanelsTopLeft,
  Route,
  Sparkles,
  Text,
  Video,
  Waves,
} from "lucide-react"
import { KID_TONES } from "@/components/kids/tones"
import { f, type FieldMap, type PropsOf } from "./fields"
import { BLOCK_BACKGROUNDS, type BlockBackground } from "./styles"

export type BlockCategory = "intro" | "content" | "data" | "media" | "engage" | "layout"

export const BLOCK_CATEGORIES: { id: BlockCategory; label: string }[] = [
  { id: "intro", label: "Mở đầu" },
  { id: "content", label: "Nội dung" },
  { id: "data", label: "Dữ liệu tự động" },
  { id: "media", label: "Hình ảnh & video" },
  { id: "engage", label: "Kêu gọi & liên hệ" },
  { id: "layout", label: "Bố cục" },
]

export interface BlockDefinition<M extends FieldMap = FieldMap> {
  label: string
  description: string
  icon: LucideIcon
  category: BlockCategory
  fields: M
  defaults: PropsOf<M>
}

function defineBlock<const M extends FieldMap>(
  def: Omit<BlockDefinition<M>, "defaults"> & { defaults: NoInfer<PropsOf<M>> }
): BlockDefinition<M> {
  return def
}

// ---------------------------------------------------------------------------
// Field dùng chung
// ---------------------------------------------------------------------------

const background = () =>
  f.tone("Màu nền", BLOCK_BACKGROUNDS, { palette: "background", help: "Nền của cả khối" })

const accent = (label = "Màu nhấn") => f.tone(label, KID_TONES)

const anchor = () =>
  f.text("ID neo (tuỳ chọn)", {
    max: 40,
    placeholder: "vd: khoa-hoc",
    help: "Dùng để tạo liên kết #neo tới khối này. Chỉ chữ thường, số và dấu gạch ngang.",
  })

const heading = () => ({
  eyebrow: f.text("Nhãn nhỏ", { max: 60 }),
  title: f.text("Tiêu đề", { max: 160 }),
  highlight: f.text("Cụm từ nhấn mạnh", {
    max: 60,
    help: "Một phần của tiêu đề sẽ được gạch chân nguệch ngoạc",
  }),
})

const sourceOptions = [
  { value: "db", label: "Lấy từ dữ liệu CMS" },
  { value: "inline", label: "Tự nhập trong khối" },
] as const

const commonDefaults = (bg: BlockBackground) => ({ background: bg, anchor: "" })

// ---------------------------------------------------------------------------
// Định nghĩa block
// ---------------------------------------------------------------------------

export const BLOCK_DEFINITIONS = {
  hero: defineBlock({
    label: "Hero mở đầu",
    description: "Tiêu đề lớn, ảnh, 2 nút kêu gọi. Có thể dùng slide Banner.",
    icon: Sparkles,
    category: "intro",
    fields: {
      badge: f.text("Nhãn nhỏ", { max: 60 }),
      title: f.text("Tiêu đề", { max: 160 }),
      highlight: f.text("Cụm từ nhấn mạnh", { max: 60, help: "Hiển thị nổi bật ngay sau tiêu đề" }),
      description: f.textarea("Mô tả", { rows: 3, max: 500 }),
      image: f.image("Ảnh minh hoạ", { aspectRatio: "4/3", folder: "pages" }),
      imageAlt: f.text("Mô tả ảnh (alt)", { max: 160 }),
      button1Text: f.text("Nút chính – chữ", { max: 40 }),
      button1Link: f.link("Nút chính – liên kết"),
      button2Text: f.text("Nút phụ – chữ", { max: 40 }),
      button2Link: f.link("Nút phụ – liên kết"),
      footnote: f.text("Ghi chú nhỏ", { max: 160 }),
      useBanners: f.boolean("Dùng slide từ Hero/Banner", {
        help: "Nếu có banner đang bật, hero sẽ hiển thị dạng slide. Không có banner thì dùng nội dung bên trên.",
      }),
      accent: accent(),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      badge: "Trung tâm tiếng Anh cho bé",
      title: "Bé học tiếng Anh",
      highlight: "vui như chơi",
      description: "Lớp nhỏ, giáo viên tận tâm, bé tự tin giao tiếp mỗi ngày.",
      image: "/english-center-hero.png",
      imageAlt: "Bé học tiếng Anh tại RosyClass",
      button1Text: "Đăng ký học thử",
      button1Link: "/dang-ky",
      button2Text: "Xem lịch khai giảng",
      button2Link: "/lich-khai-giang",
      footnote: "",
      useBanners: false,
      accent: "rose",
      ...commonDefaults("cream"),
    },
  }),

  features: defineBlock({
    label: "Ưu điểm nổi bật",
    description: "Các thẻ ảnh + tiêu đề + mô tả + nút.",
    icon: PanelsTopLeft,
    category: "content",
    fields: {
      ...heading(),
      description: f.textarea("Mô tả", { rows: 2, max: 400 }),
      layout: f.select("Bố cục", [
        { value: "grid", label: "Lưới thẻ" },
        { value: "alternate", label: "Ảnh xen kẽ trái/phải" },
      ]),
      items: f.list(
        "Danh sách ưu điểm",
        {
          image: f.image("Ảnh", { aspectRatio: "4/3", folder: "pages" }),
          title: f.text("Tiêu đề", { max: 120 }),
          description: f.textarea("Mô tả", { rows: 3, max: 600 }),
          buttonText: f.text("Chữ trên nút", { max: 40 }),
          buttonLink: f.link("Liên kết nút"),
        },
        {
          itemLabel: "Ưu điểm",
          titleKey: "title",
          maxItems: 12,
          newItem: { image: "", title: "Ưu điểm mới", description: "", buttonText: "", buttonLink: "" },
        }
      ),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      eyebrow: "Vì sao chọn RosyClass",
      title: "Học vui, tiến bộ thật",
      highlight: "tiến bộ thật",
      description: "",
      layout: "grid",
      items: [
        { image: "", title: "Giáo viên tận tâm", description: "Thầy cô theo sát từng bé trong mỗi buổi học.", buttonText: "", buttonLink: "" },
        { image: "", title: "Lớp học nhỏ", description: "Mỗi bé đều được nói, được sửa lỗi ngay trên lớp.", buttonText: "", buttonLink: "" },
        { image: "", title: "Lộ trình rõ ràng", description: "Phụ huynh nắm được bé đang ở đâu và sẽ đi tới đâu.", buttonText: "", buttonLink: "" },
      ],
      ...commonDefaults("white"),
    },
  }),

  statistics: defineBlock({
    label: "Con số thống kê",
    description: "Các con số nổi bật dạng sticker.",
    icon: BarChart3,
    category: "content",
    fields: {
      ...heading(),
      items: f.list(
        "Các con số",
        {
          number: f.text("Con số", { max: 20 }),
          label: f.text("Nhãn", { max: 80 }),
        },
        { itemLabel: "Con số", titleKey: "label", maxItems: 8, newItem: { number: "100+", label: "Nhãn mới" } }
      ),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      eyebrow: "",
      title: "",
      highlight: "",
      items: [
        { number: "5000+", label: "Học viên tin tưởng" },
        { number: "100+", label: "Giáo viên xuất sắc" },
        { number: "98%", label: "Đạt mục tiêu đề ra" },
        { number: "5", label: "Cơ sở toàn quốc" },
      ],
      ...commonDefaults("cream"),
    },
  }),

  learningPath: defineBlock({
    label: "Lộ trình học",
    description: "Các bước học được đánh số.",
    icon: Route,
    category: "content",
    fields: {
      ...heading(),
      description: f.textarea("Mô tả", { rows: 3, max: 600 }),
      buttonText: f.text("Chữ trên nút", { max: 40 }),
      buttonLink: f.link("Liên kết nút"),
      steps: f.list(
        "Các bước",
        {
          title: f.text("Tiêu đề bước", { max: 120 }),
          text: f.textarea("Mô tả bước", { rows: 3, max: 500 }),
        },
        { itemLabel: "Bước", titleKey: "title", maxItems: 8, newItem: { title: "Bước mới", text: "" } }
      ),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      eyebrow: "Lộ trình học",
      title: "Mỗi bé một con đường rõ ràng",
      highlight: "rõ ràng",
      description: "",
      buttonText: "Kiểm tra trình độ miễn phí",
      buttonLink: "/kiem-tra-trinh-do",
      steps: [
        { title: "Kiểm tra đầu vào", text: "Bé làm bài đánh giá ngắn để xác định trình độ." },
        { title: "Xếp lớp phù hợp", text: "Tư vấn viên đề xuất lớp theo năng lực và độ tuổi." },
        { title: "Học vui mỗi ngày", text: "Lớp nhỏ, nhiều trò chơi, bé được nói nhiều." },
        { title: "Theo dõi tiến bộ", text: "Phụ huynh nhận nhận xét sau mỗi chặng học." },
      ],
      ...commonDefaults("sky"),
    },
  }),

  featuredCourses: defineBlock({
    label: "Khoá học nổi bật",
    description: "Tự động lấy khoá học đã xuất bản.",
    icon: BookOpen,
    category: "data",
    fields: {
      ...heading(),
      subtitle: f.textarea("Mô tả", { rows: 2, max: 400 }),
      limit: f.number("Số khoá học hiển thị", { min: 1, max: 12 }),
      buttonText: f.text("Chữ trên nút", { max: 40 }),
      buttonLink: f.link("Liên kết nút"),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      eyebrow: "Khoá học",
      title: "Khóa học nổi bật",
      highlight: "nổi bật",
      subtitle: "",
      limit: 3,
      buttonText: "Xem tất cả khoá học",
      buttonLink: "/khoa-hoc",
      ...commonDefaults("white"),
    },
  }),

  upcomingClasses: defineBlock({
    label: "Lớp sắp khai giảng",
    description: "Tự động lấy các lớp sắp khai giảng.",
    icon: CalendarDays,
    category: "data",
    fields: {
      ...heading(),
      description: f.textarea("Mô tả", { rows: 2, max: 400 }),
      limit: f.number("Số lớp hiển thị", { min: 1, max: 12 }),
      buttonText: f.text("Chữ trên nút", { max: 40 }),
      buttonLink: f.link("Liên kết nút"),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      eyebrow: "Lớp sắp khai giảng",
      title: "Chọn lớp gần nhất, giữ chỗ cho bé",
      highlight: "giữ chỗ",
      description: "",
      limit: 3,
      buttonText: "Xem toàn bộ lịch",
      buttonLink: "/lich-khai-giang",
      ...commonDefaults("sun"),
    },
  }),

  featuredTeachers: defineBlock({
    label: "Giáo viên nổi bật",
    description: "Giáo viên được bật hiển thị trên trang chủ.",
    icon: GraduationCap,
    category: "data",
    fields: {
      ...heading(),
      description: f.textarea("Mô tả", { rows: 2, max: 400 }),
      limit: f.number("Số giáo viên hiển thị", { min: 1, max: 12 }),
      buttonText: f.text("Chữ trên nút", { max: 40 }),
      buttonLink: f.link("Liên kết nút"),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      eyebrow: "Giáo viên RosyClass",
      title: "Thầy cô đồng hành cùng bé",
      highlight: "đồng hành",
      description: "",
      limit: 3,
      buttonText: "Gặp gỡ đội ngũ",
      buttonLink: "/giao-vien",
      ...commonDefaults("cream"),
    },
  }),

  testimonials: defineBlock({
    label: "Cảm nhận phụ huynh",
    description: "Cảm nhận từ CMS hoặc tự nhập.",
    icon: MessageSquareQuote,
    category: "data",
    fields: {
      ...heading(),
      source: f.select("Nguồn dữ liệu", sourceOptions),
      limit: f.number("Số cảm nhận (nguồn CMS)", { min: 1, max: 12 }),
      items: f.list(
        "Cảm nhận tự nhập",
        {
          avatar: f.image("Ảnh đại diện", { aspectRatio: "1/1", folder: "pages" }),
          name: f.text("Tên", { max: 80 }),
          role: f.text("Vai trò", { max: 80, placeholder: "Phụ huynh bé An" }),
          content: f.textarea("Nội dung", { rows: 4, max: 800 }),
        },
        {
          itemLabel: "Cảm nhận",
          titleKey: "name",
          maxItems: 12,
          newItem: { avatar: "", name: "Phụ huynh", role: "", content: "" },
          help: "Chỉ dùng khi nguồn dữ liệu là “Tự nhập trong khối”",
        }
      ),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      eyebrow: "Phụ huynh nói gì",
      title: "Học viên nói gì về chúng tôi?",
      highlight: "",
      source: "db",
      limit: 5,
      items: [],
      ...commonDefaults("grape"),
    },
  }),

  faq: defineBlock({
    label: "Câu hỏi thường gặp",
    description: "FAQ dạng mở/đóng, từ CMS hoặc tự nhập.",
    icon: HelpCircle,
    category: "engage",
    fields: {
      ...heading(),
      description: f.textarea("Mô tả", { rows: 2, max: 400 }),
      source: f.select("Nguồn dữ liệu", sourceOptions),
      limit: f.number("Số câu hỏi (nguồn CMS)", { min: 1, max: 20 }),
      items: f.list(
        "Câu hỏi tự nhập",
        {
          question: f.text("Câu hỏi", { max: 240 }),
          answer: f.textarea("Trả lời", { rows: 4, max: 2000 }),
        },
        {
          itemLabel: "Câu hỏi",
          titleKey: "question",
          maxItems: 20,
          newItem: { question: "Câu hỏi mới?", answer: "" },
          help: "Chỉ dùng khi nguồn dữ liệu là “Tự nhập trong khối”",
        }
      ),
      buttonText: f.text("Chữ trên nút", { max: 40 }),
      buttonLink: f.link("Liên kết nút"),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      eyebrow: "Câu hỏi thường gặp",
      title: "Ba mẹ thường hỏi gì?",
      highlight: "",
      description: "",
      source: "db",
      limit: 4,
      items: [],
      buttonText: "Xem thêm câu hỏi",
      buttonLink: "/hoi-dap",
      ...commonDefaults("white"),
    },
  }),

  cta: defineBlock({
    label: "Kêu gọi hành động",
    description: "Thẻ lớn nổi bật với nút đăng ký.",
    icon: Megaphone,
    category: "engage",
    fields: {
      title: f.text("Tiêu đề", { max: 160 }),
      highlight: f.text("Cụm từ nhấn mạnh", { max: 60 }),
      description: f.textarea("Mô tả", { rows: 3, max: 600 }),
      buttonText: f.text("Nút chính – chữ", { max: 40 }),
      buttonLink: f.link("Nút chính – liên kết"),
      button2Text: f.text("Nút phụ – chữ", { max: 40 }),
      button2Link: f.link("Nút phụ – liên kết"),
      image: f.image("Ảnh (tuỳ chọn)", { aspectRatio: "1/1", folder: "pages" }),
      tone: accent("Màu thẻ"),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      title: "Sẵn sàng cho bé bắt đầu?",
      highlight: "bắt đầu",
      description: "Đăng ký học thử miễn phí để bé trải nghiệm lớp học vui nhộn tại RosyClass.",
      buttonText: "Đăng ký ngay",
      buttonLink: "/dang-ky",
      button2Text: "",
      button2Link: "",
      image: "",
      tone: "rose",
      ...commonDefaults("cream"),
    },
  }),

  richText: defineBlock({
    label: "Văn bản",
    description: "Nội dung tự do bằng Markdown đơn giản.",
    icon: Text,
    category: "content",
    fields: {
      content: f.markdown("Nội dung", {
        rows: 12,
        help: "Hỗ trợ: # Tiêu đề, **đậm**, *nghiêng*, [liên kết](/duong-dan), - danh sách, 1. danh sách số, > trích dẫn",
      }),
      align: f.select("Căn lề", [
        { value: "left", label: "Trái" },
        { value: "center", label: "Giữa" },
      ]),
      width: f.select("Độ rộng", [
        { value: "narrow", label: "Hẹp (dễ đọc)" },
        { value: "wide", label: "Rộng" },
      ]),
      card: f.boolean("Đặt trong thẻ"),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      content: "## Tiêu đề đoạn văn\n\nNội dung giới thiệu. Bạn có thể viết **chữ đậm**, *chữ nghiêng* và [liên kết](/lien-he).",
      align: "left",
      width: "narrow",
      card: false,
      ...commonDefaults("white"),
    },
  }),

  imageText: defineBlock({
    label: "Ảnh + văn bản",
    description: "Ảnh bên trái hoặc phải, kèm nội dung.",
    icon: Images,
    category: "content",
    fields: {
      ...heading(),
      content: f.markdown("Nội dung", { rows: 6 }),
      image: f.image("Ảnh", { aspectRatio: "4/3", folder: "pages" }),
      imageAlt: f.text("Mô tả ảnh (alt)", { max: 160 }),
      imagePosition: f.select("Vị trí ảnh", [
        { value: "left", label: "Bên trái" },
        { value: "right", label: "Bên phải" },
      ]),
      buttonText: f.text("Chữ trên nút", { max: 40 }),
      buttonLink: f.link("Liên kết nút"),
      accent: accent(),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      eyebrow: "",
      title: "Một ngày vui ở RosyClass",
      highlight: "vui",
      content: "Bé được hát, chơi trò chơi và nói tiếng Anh cùng bạn bè trong một không gian an toàn, ấm áp.",
      image: "/hero_slider_2.png",
      imageAlt: "",
      imagePosition: "left",
      buttonText: "",
      buttonLink: "",
      accent: "mint",
      ...commonDefaults("white"),
    },
  }),

  gallery: defineBlock({
    label: "Thư viện ảnh",
    description: "Lưới ảnh kèm chú thích.",
    icon: GalleryHorizontalEnd,
    category: "media",
    fields: {
      ...heading(),
      description: f.textarea("Mô tả", { rows: 2, max: 400 }),
      columns: f.select("Số cột (máy tính)", [
        { value: "2", label: "2 cột" },
        { value: "3", label: "3 cột" },
        { value: "4", label: "4 cột" },
      ]),
      items: f.list(
        "Ảnh",
        {
          image: f.image("Ảnh", { aspectRatio: "1/1", folder: "pages" }),
          caption: f.text("Chú thích", { max: 120 }),
        },
        { itemLabel: "Ảnh", titleKey: "caption", maxItems: 24, newItem: { image: "", caption: "" } }
      ),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      eyebrow: "Khoảnh khắc",
      title: "Lớp học của bé",
      highlight: "",
      description: "",
      columns: "3",
      items: [
        { image: "/hero_slider_2.png", caption: "" },
        { image: "/hero_slider_3.png", caption: "" },
        { image: "/english-center-hero.png", caption: "" },
      ],
      ...commonDefaults("white"),
    },
  }),

  videoEmbed: defineBlock({
    label: "Video YouTube",
    description: "Nhúng video YouTube (chế độ bảo mật, chỉ tải khi bấm xem).",
    icon: Video,
    category: "media",
    fields: {
      ...heading(),
      description: f.textarea("Mô tả", { rows: 2, max: 400 }),
      url: f.text("Đường dẫn YouTube", { max: 300, placeholder: "https://www.youtube.com/watch?v=..." }),
      poster: f.image("Ảnh bìa (tuỳ chọn)", { aspectRatio: "16/9", folder: "pages" }),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      eyebrow: "",
      title: "Cùng xem bé học nhé!",
      highlight: "",
      description: "",
      url: "",
      poster: "",
      ...commonDefaults("cream"),
    },
  }),

  contactInfo: defineBlock({
    label: "Thông tin liên hệ",
    description: "Địa chỉ, điện thoại, email từ Cài đặt website.",
    icon: Contact,
    category: "engage",
    fields: {
      ...heading(),
      description: f.textarea("Mô tả", { rows: 2, max: 400 }),
      showMap: f.boolean("Hiện bản đồ Google Maps"),
      showSocial: f.boolean("Hiện mạng xã hội"),
      buttonText: f.text("Chữ trên nút", { max: 40 }),
      buttonLink: f.link("Liên kết nút"),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      eyebrow: "Liên hệ",
      title: "Ghé thăm RosyClass",
      highlight: "RosyClass",
      description: "",
      showMap: true,
      showSocial: true,
      buttonText: "Gửi yêu cầu tư vấn",
      buttonLink: "/lien-he",
      ...commonDefaults("mint"),
    },
  }),

  spacer: defineBlock({
    label: "Khoảng trống",
    description: "Thêm khoảng cách giữa các khối.",
    icon: MoveVertical,
    category: "layout",
    fields: {
      size: f.select("Độ cao", [
        { value: "sm", label: "Nhỏ" },
        { value: "md", label: "Vừa" },
        { value: "lg", label: "Lớn" },
        { value: "xl", label: "Rất lớn" },
      ]),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      size: "md",
      ...commonDefaults("cream"),
    },
  }),

  divider: defineBlock({
    label: "Đường phân cách",
    description: "Sóng lượn hoặc nét nguệch ngoạc chuyển giữa hai nền.",
    icon: Waves,
    category: "layout",
    fields: {
      style: f.select("Kiểu", [
        { value: "wave", label: "Sóng lượn" },
        { value: "squiggle", label: "Nét nguệch ngoạc" },
        { value: "stars", label: "Ngôi sao" },
      ]),
      color: f.tone("Màu sóng (nền khối bên dưới)", BLOCK_BACKGROUNDS, { palette: "background" }),
      flip: f.boolean("Lật ngược sóng"),
      background: background(),
      anchor: anchor(),
    },
    defaults: {
      style: "wave",
      color: "white",
      flip: false,
      ...commonDefaults("cream"),
    },
  }),
} satisfies Record<string, BlockDefinition>

export type BlockType = keyof typeof BLOCK_DEFINITIONS

export const BLOCK_TYPES = Object.keys(BLOCK_DEFINITIONS) as BlockType[]

export type BlockPropsMap = {
  [T in BlockType]: PropsOf<(typeof BLOCK_DEFINITIONS)[T]["fields"]>
}

export type BlockProps<T extends BlockType> = BlockPropsMap[T]

export function isBlockType(value: unknown): value is BlockType {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(BLOCK_DEFINITIONS, value)
}

export function getBlockDefinition(type: BlockType): BlockDefinition {
  return BLOCK_DEFINITIONS[type] as unknown as BlockDefinition
}
