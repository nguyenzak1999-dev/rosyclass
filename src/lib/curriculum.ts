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
