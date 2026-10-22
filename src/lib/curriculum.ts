// Tiện ích dùng chung (server + client) cho phân hệ Tiếng Anh lớp 1:
// chương trình học (Unit → Bài), màn hình "Lên lớp", sao & nhận xét.

/** Tách chuỗi nhập tay (dấu phẩy, chấm phẩy hoặc xuống dòng) thành danh sách, bỏ trùng */
export function splitWords(text: string | null | undefined): string[] {
  return dedupe((text ?? "").split(/[\n,;]+/))
}

/** Mỗi dòng một mục (mẫu câu có thể chứa dấu phẩy nên chỉ tách theo dòng) */
export function splitLines(text: string | null | undefined): string[] {
  return dedupe((text ?? "").split(/\r?\n/))
}

function dedupe(items: string[]) {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of items) {
    const item = raw.trim()
    if (!item || seen.has(item.toLowerCase())) continue
    seen.add(item.toLowerCase())
    result.push(item)
  }
  return result
}

/** Đọc cột JSON array (vocabulary, sentencePatterns, praises); dữ liệu hỏng thì trả về [] */
export function parseJsonList(value: string | null | undefined): string[] {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []
  } catch {
    return []
  }
}

/** "Unit 2 – Bài 3: Colours around us" */
export function lessonLabel(lesson: { order: number; title: string; unit: { order: number } }) {
  return `Unit ${lesson.unit.order} – Bài ${lesson.order}: ${lesson.title}`
}

export const PRAISE_TAGS = [
  "Phát âm tốt",
  "Hăng hái phát biểu",
  "Ngoan, tập trung",
  "Giúp đỡ bạn",
  "Hoàn thành bài",
] as const

export const MOODS = [
  { value: "😄", label: "Rất vui" },
  { value: "🙂", label: "Vui" },
  { value: "😐", label: "Bình thường" },
  { value: "😴", label: "Mệt" },
  { value: "😢", label: "Buồn" },
] as const

export const MAX_STARS = 5

// ------------------------------------------------------
// Giờ Việt Nam: Worker chạy theo UTC nên "hôm nay" phải tính theo UTC+7
// ------------------------------------------------------

export const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh"
const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000

/**
 * Khoảng [start, end) của một ngày theo giờ Việt Nam.
 * sessionDate được lưu là 00:00 UTC (sinh trên Worker) hoặc 00:00 giờ VN (sinh ở máy giờ VN);
 * cả hai đều rơi vào khoảng này.
 */
export function vietnamDayRange(now = new Date(), offsetDays = 0) {
  const local = new Date(now.getTime() + VIETNAM_OFFSET_MS)
  const midnightUtc = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + offsetDays)
  return {
    start: new Date(midnightUtc - VIETNAM_OFFSET_MS),
    end: new Date(midnightUtc - VIETNAM_OFFSET_MS + 24 * 60 * 60 * 1000),
  }
}

export function formatVietnamDate(value: Date | string, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  }).format(new Date(value))
}

/** "23/10" (vi-VN tự in "23-10" khi chỉ có ngày + tháng nên cắt từ dạng đầy đủ) */
export function formatVietnamDayMonth(value: Date | string) {
  return formatVietnamDate(value).slice(0, 5)
}

/** Ngày theo giờ Việt Nam dạng "YYYY-MM-DD" (cho input type="date") */
export function vietnamDateKey(value: Date | string) {
  const local = new Date(new Date(value).getTime() + VIETNAM_OFFSET_MS)
  return local.toISOString().slice(0, 10)
}

/** "YYYY-MM-DD" (giờ VN) → thời điểm 00:00 giờ VN của ngày đó; null nếu sai định dạng */
export function parseVietnamDateKey(key: string | null | undefined) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key ?? "")
  if (!match) return null
  const utc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  const date = new Date(utc - VIETNAM_OFFSET_MS)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Ngày đầu và ngày cuối (00:00 giờ VN) của tháng "YYYY-MM" */
export function vietnamMonthBounds(month: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(month)
  if (!match) return null
  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  if (monthIndex < 0 || monthIndex > 11) return null
  return {
    start: new Date(Date.UTC(year, monthIndex, 1) - VIETNAM_OFFSET_MS),
    lastDay: new Date(Date.UTC(year, monthIndex + 1, 0) - VIETNAM_OFFSET_MS),
  }
}

export const DAY_MS = 24 * 60 * 60 * 1000

/** Thời điểm cách đây `days` ngày (dùng cho bộ lọc "gần đây") */
export function daysAgo(days: number, now = new Date()) {
  return new Date(now.getTime() - days * DAY_MS)
}

// ------------------------------------------------------
// Bài tập về nhà
// ------------------------------------------------------

export const HOMEWORK_KINDS = [
  { value: "DRAWING", label: "Tô màu / vẽ", emoji: "🖍️" },
  { value: "SPEAKING", label: "Luyện nói", emoji: "🗣️" },
  { value: "LISTENING", label: "Nghe bài hát", emoji: "🎧" },
  { value: "WORKSHEET", label: "Phiếu bài tập", emoji: "📝" },
  { value: "OTHER", label: "Khác", emoji: "📚" },
] as const

export type HomeworkKind = (typeof HOMEWORK_KINDS)[number]["value"]

export function homeworkKindInfo(kind: string) {
  return HOMEWORK_KINDS.find((item) => item.value === kind) ?? HOMEWORK_KINDS[HOMEWORK_KINDS.length - 1]
}

export const HOMEWORK_STICKERS = ["⭐ Tuyệt vời", "🌈 Rất cố gắng", "🦄 Sáng tạo", "👍 Tốt lắm", "💪 Cố lên nhé"] as const

export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Chờ cô chấm",
  REVIEWED: "Đã chấm",
}

/** Giới hạn file bài nộp của phụ huynh */
export const HOMEWORK_MAX_BYTES = 15 * 1024 * 1024

/**
 * URL phát âm thanh: ghi âm trên Chrome là webm, Safari không phát được.
 * File âm thanh lưu loại "video" của Cloudinary nên đổi đuôi sang .mp3 là Cloudinary tự chuyển định dạng.
 */
export function playableAudioUrl(url: string) {
  if (!/res\.cloudinary\.com\/.+\/video\/upload\//.test(url)) return url
  return url.replace(/\.[a-z0-9]+(\?.*)?$/i, ".mp3")
}

// ------------------------------------------------------
// Đánh giá kỹ năng (cuối Unit, 3 mức theo Cambridge Pre-A1 Starters)
// ------------------------------------------------------

export const SKILLS = [
  { value: "LISTENING", label: "Nghe", emoji: "👂" },
  { value: "SPEAKING", label: "Nói", emoji: "🗣️" },
  { value: "READING", label: "Đọc", emoji: "📖" },
  { value: "WRITING", label: "Viết", emoji: "✏️" },
  { value: "PHONICS", label: "Âm & chữ", emoji: "🔤" },
] as const

export type SkillCode = (typeof SKILLS)[number]["value"]

export const SKILL_LEVELS = [
  { value: 1, label: "Cần cố gắng", short: "Cố gắng" },
  { value: 2, label: "Đạt", short: "Đạt" },
  { value: 3, label: "Tốt", short: "Tốt" },
] as const

export function skillLevelLabel(level: number | null | undefined) {
  return SKILL_LEVELS.find((item) => item.value === level)?.label ?? "Chưa đánh giá"
}
