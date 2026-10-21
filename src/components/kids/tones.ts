export const KID_TONES = ["rose", "sun", "sky", "mint", "grape", "orange"] as const

export type KidTone = (typeof KID_TONES)[number]

// Chữ trắng chỉ đủ tương phản trên grape; các tone sáng dùng chữ màu mực (WCAG AA)
// Tailwind cần class đầy đủ để không bị purge, nên liệt kê tường minh từng tone
export const toneClasses: Record<KidTone, { solid: string; soft: string; text: string; fill: string }> = {
  rose: { solid: "bg-kid-rose text-kid-ink", soft: "bg-kid-rose-soft", text: "text-kid-rose", fill: "fill-kid-rose" },
  sun: { solid: "bg-kid-sun text-kid-ink", soft: "bg-kid-sun-soft", text: "text-kid-sun", fill: "fill-kid-sun" },
  sky: { solid: "bg-kid-sky text-kid-ink", soft: "bg-kid-sky-soft", text: "text-kid-sky", fill: "fill-kid-sky" },
  mint: { solid: "bg-kid-mint text-kid-ink", soft: "bg-kid-mint-soft", text: "text-kid-mint", fill: "fill-kid-mint" },
  grape: { solid: "bg-kid-grape text-white", soft: "bg-kid-grape-soft", text: "text-kid-grape", fill: "fill-kid-grape" },
  orange: { solid: "bg-kid-orange text-kid-ink", soft: "bg-kid-orange-soft", text: "text-kid-orange", fill: "fill-kid-orange" },
}

export function toneAt(index: number): KidTone {
  return KID_TONES[((index % KID_TONES.length) + KID_TONES.length) % KID_TONES.length]
}

export function isKidTone(value: unknown): value is KidTone {
  return typeof value === "string" && (KID_TONES as readonly string[]).includes(value)
}
