import { toneClasses, type KidTone } from "./tones"

// Chữ trắng trên rose/sky/mint/orange không đủ tương phản (WCAG) ở cỡ chữ nhỏ,
// nên dùng chữ mực. Riêng grape đủ tương phản với chữ trắng.
export function inkTextOn(tone: KidTone | "white" | "ink"): string | undefined {
  if (tone === "grape" || tone === "ink" || tone === "white" || tone === "sun") return undefined
  return "text-kid-ink"
}

// Nền đặc + màu chữ dễ đọc, dùng cho chip/nhãn/ô số nhỏ
export function readableSolid(tone: KidTone): string {
  return tone === "grape" || tone === "sun" ? toneClasses[tone].solid : `${toneClasses[tone].solid.replace("text-white", "")} text-kid-ink`.trim()
}
