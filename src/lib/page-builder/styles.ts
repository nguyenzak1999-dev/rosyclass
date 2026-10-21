import { KID_TONES, type KidTone } from "@/components/kids/tones"

/** Nền của mỗi block: kem, trắng hoặc phiên bản "soft" của tone kid */
export const BLOCK_BACKGROUNDS = ["cream", "white", ...KID_TONES] as const
export type BlockBackground = (typeof BLOCK_BACKGROUNDS)[number]

export const BACKGROUND_LABELS: Record<BlockBackground, string> = {
  cream: "Kem",
  white: "Trắng",
  rose: "Hồng",
  sun: "Vàng",
  sky: "Xanh trời",
  mint: "Bạc hà",
  grape: "Tím",
  orange: "Cam",
}

// Liệt kê đầy đủ class để Tailwind không purge
export const backgroundClasses: Record<BlockBackground, string> = {
  cream: "bg-kid-cream",
  white: "bg-white",
  rose: "bg-kid-rose-soft",
  sun: "bg-kid-sun-soft",
  sky: "bg-kid-sky-soft",
  mint: "bg-kid-mint-soft",
  grape: "bg-kid-grape-soft",
  orange: "bg-kid-orange-soft",
}

/** Màu chữ tương ứng với nền (dùng cho WaveDivider vẽ bằng currentColor) */
export const backgroundTextClasses: Record<BlockBackground, string> = {
  cream: "text-kid-cream",
  white: "text-white",
  rose: "text-kid-rose-soft",
  sun: "text-kid-sun-soft",
  sky: "text-kid-sky-soft",
  mint: "text-kid-mint-soft",
  grape: "text-kid-grape-soft",
  orange: "text-kid-orange-soft",
}

/** Màu mẫu cho bộ chọn trong inspector (inline style để không phụ thuộc .theme-client) */
export const BACKGROUND_SWATCHES: Record<BlockBackground, string> = {
  cream: "#fff8ec",
  white: "#ffffff",
  rose: "#ffe0ec",
  sun: "#fff1c7",
  sky: "#dcf2ff",
  mint: "#d6f7ee",
  grape: "#ece3ff",
  orange: "#ffe6d4",
}

export const TONE_LABELS: Record<KidTone, string> = {
  rose: "Hồng",
  sun: "Vàng",
  sky: "Xanh trời",
  mint: "Bạc hà",
  grape: "Tím",
  orange: "Cam",
}

export const TONE_SWATCHES: Record<KidTone, string> = {
  rose: "#ff5c93",
  sun: "#ffc93c",
  sky: "#3bb4f2",
  mint: "#2ec4a0",
  grape: "#8c5cf0",
  orange: "#ff8a3d",
}

export function labelForTone(value: string): string {
  return (
    (TONE_LABELS as Record<string, string>)[value] ??
    (BACKGROUND_LABELS as Record<string, string>)[value] ??
    value
  )
}
