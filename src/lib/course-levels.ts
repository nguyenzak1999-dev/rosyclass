// Nhãn cấp độ khoá học dùng chung cho admin và website.
// Trung tâm chỉ dạy trẻ 3–11 tuổi nên chỉ các cấp độ trẻ em được đưa ra để chọn;
// các cấp độ người lớn còn trong enum CourseLevel để không làm hỏng dữ liệu cũ.

export const KID_COURSE_LEVELS = [
  { value: "KIDS", label: "Mầm non (3–5 tuổi)" },
  { value: "STARTER", label: "Starters (lớp 1–2)" },
  { value: "A1", label: "Movers (lớp 3–4)" },
  { value: "A2", label: "Flyers (lớp 4–5)" },
  { value: "ONE_ON_ONE", label: "Kèm 1–1" },
] as const

const LEGACY_LEVEL_LABELS: Record<string, string> = {
  B1: "B1 (cũ)",
  B2: "B2 (cũ)",
  IELTS_FOUNDATION: "IELTS Foundation (cũ)",
  IELTS_5_5: "IELTS 5.5 (cũ)",
  IELTS_6_5: "IELTS 6.5 (cũ)",
  TOEIC: "TOEIC (cũ)",
  COMMUNICATION: "Giao tiếp (cũ)",
}

export function courseLevelLabel(level?: string | null) {
  if (!level) return "Chưa xếp cấp độ"
  return KID_COURSE_LEVELS.find((item) => item.value === level)?.label ?? LEGACY_LEVEL_LABELS[level] ?? level
}

/** Danh sách để chọn: cấp độ trẻ em, cộng cấp độ cũ nếu bản ghi đang dùng nó */
export function courseLevelOptions(current?: string | null) {
  const options: Array<{ value: string; label: string }> = [...KID_COURSE_LEVELS]
  if (current && !options.some((item) => item.value === current)) {
    options.push({ value: current, label: courseLevelLabel(current) })
  }
  return options
}

/** Nhóm lứa tuổi cho báo cáo */
export function courseAgeGroup(level?: string | null): "preschool" | "primary" | "one-on-one" | "other" {
  if (level === "KIDS") return "preschool"
  if (level === "STARTER" || level === "A1" || level === "A2") return "primary"
  if (level === "ONE_ON_ONE") return "one-on-one"
  return "other"
}

export const AGE_GROUP_LABELS = {
  preschool: "Mầm non",
  primary: "Tiểu học",
  "one-on-one": "Kèm 1–1",
  other: "Khác",
} as const
