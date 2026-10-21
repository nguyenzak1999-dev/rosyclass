import type React from "react"
import { cn } from "@/lib/utils"

export type MascotMood = "happy" | "wow" | "think"

export interface RosyMascotProps extends React.SVGProps<SVGSVGElement> {
  mood?: MascotMood
  // Nếu truyền title thì mascot được đọc bởi trình đọc màn hình, ngược lại là trang trí
  title?: string
}

// "Bé Rosy": nhân vật tròn ủm màu hồng, có mầm hoa trên đầu
export function RosyMascot({ mood = "happy", title, className, ...props }: RosyMascotProps) {
  const ink = "var(--color-kid-ink)"
  const decorative = !title

  return (
    <svg
      viewBox="0 0 200 200"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={title}
      className={cn("h-32 w-32", className)}
      {...props}
    >
      {/* Mầm cây + bông hoa */}
      <path d="M100 46 C100 34 102 26 108 18" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      <path d="M102 34 C88 22 74 26 70 36 C82 42 94 40 102 34z" fill="var(--color-kid-mint)" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
      <g transform="translate(110 16)">
        <circle cx="0" cy="-8" r="7" fill="var(--color-kid-sun)" stroke={ink} strokeWidth="3.5" />
        <circle cx="8" cy="0" r="7" fill="var(--color-kid-sun)" stroke={ink} strokeWidth="3.5" />
        <circle cx="0" cy="8" r="7" fill="var(--color-kid-sun)" stroke={ink} strokeWidth="3.5" />
        <circle cx="-8" cy="0" r="7" fill="var(--color-kid-sun)" stroke={ink} strokeWidth="3.5" />
        <circle cx="0" cy="0" r="5.5" fill="var(--color-kid-orange)" stroke={ink} strokeWidth="3" />
      </g>

      {/* Tay */}
      {mood === "wow" ? (
        <>
          <path d="M40 104 C24 92 20 74 26 62" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" />
          <path d="M160 104 C176 92 180 74 174 62" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M38 118 C24 112 18 98 22 84" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" />
          <path d="M162 124 C176 128 182 138 180 150" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" />
        </>
      )}

      {/* Chân */}
      <ellipse cx="78" cy="180" rx="16" ry="9" fill="var(--color-kid-rose)" stroke={ink} strokeWidth="4.5" />
      <ellipse cx="122" cy="180" rx="16" ry="9" fill="var(--color-kid-rose)" stroke={ink} strokeWidth="4.5" />

      {/* Thân */}
      <path
        d="M100 46 C146 46 172 76 170 116 C168 152 140 176 100 176 C60 176 32 152 30 116 C28 76 54 46 100 46z"
        fill="var(--color-kid-rose)"
        stroke={ink}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M62 74 C70 64 82 58 94 57" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="7" strokeLinecap="round" />

      {/* Mắt */}
      {mood === "think" ? (
        <>
          <path d="M66 104 C72 98 82 98 88 104" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
          <circle cx="126" cy="102" r="11" fill="#fff" stroke={ink} strokeWidth="4" />
          <circle cx="130" cy="99" r="5.5" fill={ink} />
        </>
      ) : (
        <>
          <ellipse cx="78" cy="102" rx="12" ry={mood === "wow" ? 15 : 13} fill="#fff" stroke={ink} strokeWidth="4" />
          <ellipse cx="122" cy="102" rx="12" ry={mood === "wow" ? 15 : 13} fill="#fff" stroke={ink} strokeWidth="4" />
          <circle cx="80" cy="105" r="6" fill={ink} />
          <circle cx="124" cy="105" r="6" fill={ink} />
          <circle cx="82.5" cy="102" r="2" fill="#fff" />
          <circle cx="126.5" cy="102" r="2" fill="#fff" />
        </>
      )}

      {/* Má hồng */}
      <ellipse cx="60" cy="128" rx="10" ry="6" fill="#ffc2d6" />
      <ellipse cx="140" cy="128" rx="10" ry="6" fill="#ffc2d6" />

      {/* Miệng */}
      {mood === "happy" && (
        <>
          <path d="M84 128 C88 146 112 146 116 128z" fill={ink} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
          <path d="M92 138 C96 134 104 134 108 138 C104 142 96 142 92 138z" fill="#ff8fb3" />
        </>
      )}
      {mood === "wow" && <ellipse cx="100" cy="138" rx="9" ry="11" fill={ink} />}
      {mood === "think" && <path d="M90 136 C96 132 104 134 112 132" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />}
      {title ? <title>{title}</title> : null}
    </svg>
  )
}
