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
 * Map % đúng → trình độ gợi ý cho bé 3–11 tuổi (định hướng Cambridge Young Learners):
 * - dưới 35%: STARTER (lớp nền tảng, Starters)
 * - 35–70%: A1 (Movers)
 * - từ 70%: A2 (Flyers)
 * Các mức người lớn (B1, IELTS, TOEIC) không còn được gợi ý vì trung tâm chỉ dạy trẻ.
 */
export function suggestLevel(score: number, total: number): LevelSuggestion {
  if (total === 0) {
    return LEVEL_MAP.STARTER
  }
  const percent = (score / total) * 100
  if (percent < 35) return LEVEL_MAP.STARTER
  if (percent < 70) return LEVEL_MAP.A1
  return LEVEL_MAP.A2
}

const LEVEL_MAP: Record<SuggestedLevel, LevelSuggestion> = {
  STARTER: {
    level: "STARTER",
    label: "Lớp nền tảng (Cambridge Starters)",
    description: "Bé nên bắt đầu ở lớp nền tảng: làm quen âm, từ vựng và mẫu câu đơn giản qua bài hát và trò chơi.",
    color: "text-gray-700",
  },
  A1: {
    level: "A1",
    label: "Lớp Movers (Cambridge Movers)",
    description: "Bé đã có nền tảng tốt. Con có thể học lớp luyện nói thành câu, nghe hiểu và đọc đoạn ngắn.",
    color: "text-blue-700",
  },
  A2: {
    level: "A2",
    label: "Lớp Flyers (Cambridge Flyers)",
    description: "Bé làm bài rất tốt! Con có thể học lớp nâng cao, luyện đủ nghe, nói, đọc, viết.",
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
