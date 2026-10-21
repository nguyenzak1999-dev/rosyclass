import type React from "react"
import { cn } from "@/lib/utils"
import { RosyMascot, type MascotMood } from "./mascot"
import { toneClasses, toneAt, type KidTone } from "./tones"

// Giá trị cố định (không random) để không lệch giữa server và client khi hydrate
const PIECES = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 7) % 12) / 10,
  size: 8 + ((i * 5) % 9),
  round: i % 3 === 0,
  tone: toneAt(i),
  drift: i % 2 === 0 ? 1 : -1,
}))

// Mưa giấy màu ăn mừng, chỉ là trang trí (ẩn khi người dùng giảm chuyển động)
export function Confetti({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {PIECES.map((piece, i) => (
        <span
          key={i}
          className={cn("kid-confetti-piece", toneClasses[piece.tone].solid, piece.round ? "rounded-full" : "rounded-[3px]")}
          style={
            {
              left: `${piece.left}%`,
              width: piece.size,
              height: piece.round ? piece.size : piece.size * 1.6,
              rotate: `${piece.drift * 15}deg`,
              "--kid-delay": `${piece.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

export interface KidProgressProps {
  value: number
  max: number
  tone?: KidTone
  label: string
  className?: string
}

// Thanh tiến độ to, sọc chạy, có ngôi sao ở đích — dùng cho bài quiz/form nhiều bước
export function KidProgress({ value, max, tone = "mint", label, className }: KidProgressProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("relative h-7 w-full rounded-full border-[3px] border-kid-ink bg-white p-[3px]", className)}
    >
      <div
        className={cn("kid-stripes h-full rounded-full transition-[width] duration-500 ease-out", toneClasses[tone].solid)}
        style={{ width: `${Math.max(percent, 6)}%` }}
      />
      <svg
        viewBox="0 0 48 48"
        aria-hidden="true"
        className={cn(
          "absolute -top-3 -right-3 h-11 w-11 transition-transform duration-500",
          percent >= 100 ? "scale-110 fill-kid-sun" : "fill-white"
        )}
      >
        <path
          d="M24 3.5l5.9 12.7 13.9 1.6-10.3 9.5 2.8 13.7L24 34.1 11.7 41l2.8-13.7L4.2 17.8l13.9-1.6z"
          stroke="var(--color-kid-ink)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export interface EmptyStateProps {
  title: string
  description?: React.ReactNode
  mood?: MascotMood
  tone?: KidTone | "white"
  action?: React.ReactNode
  className?: string
}

// Trạng thái rỗng thân thiện với mascot
export function EmptyState({ title, description, mood = "think", tone = "white", action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "kid-border kid-shadow flex flex-col items-center gap-4 rounded-kid-lg px-6 py-12 text-center",
        tone === "white" ? "bg-white" : toneClasses[tone].soft,
        className
      )}
    >
      <RosyMascot mood={mood} className="kid-float h-28 w-28" />
      <p className="font-kid-display text-[22px] leading-snug font-bold text-kid-ink">{title}</p>
      {description ? <div className="max-w-[480px] text-[16px] leading-relaxed text-kid-ink-soft">{description}</div> : null}
      {action ? <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  )
}
