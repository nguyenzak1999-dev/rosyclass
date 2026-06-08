/**
 * Helper cho Placement Test - tính điểm + gợi ý level + courses.
 * Pure function, có thể dùng cả client + server.
 */

export type SuggestedLevel =
  | "STARTER"
  | "A1"
  | "A2"
  | "B1"
  | "B2"
  | "B2_IELTS_FOUNDATION"
  | "IELTS_FOUNDATION"
  | "IELTS_5_5"
  | "IELTS_6_5"
  | "TOEIC"

export interface LevelSuggestion {
  level: SuggestedLevel
  label: string
  description: string
  color: string
}

/**
 * Map % đúng → suggested level.
 * Theo heuristic đơn giản:
 * - 0-30%: STARTER
 * - 30-50%: A1
 * - 50-65%: A2
 * - 65-75%: B1
 * - 75-85%: B2 hoặc IELTS_FOUNDATION
 * - 85-95%: IELTS_5_5
 * - 95-100%: IELTS_6_5 hoặc TOEIC
 */
export function suggestLevel(score: number, total: number): LevelSuggestion {
  if (total === 0) {
    return LEVEL_MAP.STARTER
  }
  const percent = (score / total) * 100
  if (percent < 30) return LEVEL_MAP.STARTER
  if (percent < 50) return LEVEL_MAP.A1
  if (percent < 65) return LEVEL_MAP.A2
  if (percent < 75) return LEVEL_MAP.B1
  if (percent < 85) return LEVEL_MAP.B2_IELTS_FOUNDATION
  if (percent < 95) return LEVEL_MAP.IELTS_5_5
  return LEVEL_MAP.IELTS_6_5
}

const LEVEL_MAP: Record<SuggestedLevel, LevelSuggestion> = {
  STARTER: {
    level: "STARTER",
    label: "Starter (Mất gốc)",
    description: "Bạn nên bắt đầu với khóa Starter để xây nền tảng vững chắc.",
    color: "text-gray-700",
  },
  A1: {
    level: "A1",
    label: "A1 (Sơ cấp)",
    description: "Trình độ mới bắt đầu. Khóa A1 sẽ giúp bạn nắm vững nền tảng cơ bản.",
    color: "text-blue-700",
  },
  A2: {
    level: "A2",
    label: "A2 (Sơ cấp nâng cao)",
    description: "Bạn đã có nền tảng cơ bản. Khóa A2 sẽ giúp phát triển kỹ năng giao tiếp hàng ngày.",
    color: "text-cyan-700",
  },
  B1: {
    level: "B1",
    label: "B1 (Trung cấp)",
    description: "Bạn có thể giao tiếp cơ bản. Khóa B1 sẽ giúp bạn tự tin hơn trong môi trường làm việc.",
    color: "text-teal-700",
  },
  B2: {
    level: "B2",
    label: "B2 (Trung cấp cao)",
    description: "Trình độ khá. Bạn có thể học IELTS Foundation hoặc B2 để chuẩn bị cho IELTS.",
    color: "text-green-700",
  },
  IELTS_FOUNDATION: {
    level: "IELTS_FOUNDATION",
    label: "IELTS Foundation",
    description: "Bạn đã sẵn sàng cho IELTS Foundation. Khóa học sẽ xây dựng từ vựng học thuật và chiến lược làm bài.",
    color: "text-emerald-700",
  },
  B2_IELTS_FOUNDATION: {
    level: "IELTS_FOUNDATION",
    label: "B2 / IELTS Foundation",
    description: "Trình độ tốt! Bạn có thể chọn B2 hoặc IELTS Foundation tùy mục tiêu.",
    color: "text-emerald-700",
  },
  IELTS_5_5: {
    level: "IELTS_5_5",
    label: "IELTS 5.5+",
    description: "Xuất sắc! Bạn đã sẵn sàng cho khóa IELTS 5.5+.",
    color: "text-purple-700",
  },
  IELTS_6_5: {
    level: "IELTS_6_5",
    label: "IELTS 6.5+ / TOEIC",
    description: "Tuyệt vời! Bạn có thể học IELTS 6.5+ hoặc TOEIC tùy mục tiêu.",
    color: "text-rose-700",
  },
  TOEIC: {
    level: "TOEIC",
    label: "IELTS 6.5+ / TOEIC",
    description: "Tuyệt vời! Bạn có thể học IELTS 6.5+ hoặc TOEIC tùy mục tiêu.",
    color: "text-rose-700",
  },
}

/**
 * Format % điểm thành chuỗi hiển thị.
 */
export function formatScorePercent(score: number, total: number): string {
  if (total === 0) return "0%"
  return `${Math.round((score / total) * 100)}%`
}
