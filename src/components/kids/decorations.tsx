import type React from "react"
import { cn } from "@/lib/utils"

type DecoProps = React.SVGProps<SVGSVGElement>

// Các hình trang trí chỉ mang tính minh hoạ nên luôn ẩn với trình đọc màn hình
export function Star({ className, ...props }: DecoProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("fill-kid-sun", className)} {...props}>
      <path
        d="M24 3.5l5.9 12.7 13.9 1.6-10.3 9.5 2.8 13.7L24 34.1 11.7 41l2.8-13.7L4.2 17.8l13.9-1.6z"
        stroke="var(--color-kid-ink)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Sparkle({ className, ...props }: DecoProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("fill-kid-rose", className)} {...props}>
      <path d="M16 1c1.6 7.6 7.4 13.4 15 15-7.6 1.6-13.4 7.4-15 15-1.6-7.6-7.4-13.4-15-15C8.6 14.4 14.4 8.6 16 1z" />
    </svg>
  )
}

export function Cloud({ className, ...props }: DecoProps) {
  return (
    <svg viewBox="0 0 120 64" aria-hidden="true" className={cn("fill-white", className)} {...props}>
      <path
        d="M30 58c-14 0-24-8-24-19 0-10 8-18 19-19 3-10 13-17 25-17 13 0 24 8 26 20 2-1 5-1 7-1 12 0 21 8 21 18s-9 18-21 18z"
        stroke="var(--color-kid-ink)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Squiggle({ className, ...props }: DecoProps) {
  return (
    <svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true" className={cn("stroke-kid-sun", className)} {...props}>
      <path d="M2 12c16-12 32 12 48 0s32-12 48 0 32 12 48 0 32-12 48 0" fill="none" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

export function Blob({ className, ...props }: DecoProps) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={cn("fill-kid-sky-soft", className)} {...props}>
      <path d="M44.7-61.6C57.2-52.1 66.1-38.1 70.6-22.9 75.1-7.7 75.2 8.8 69.4 22.8 63.6 36.8 51.9 48.4 38.3 57.3 24.7 66.2 9.2 72.3-6.7 72.9-22.6 73.6-38.9 68.7-51 58.5-63.1 48.3-71 32.8-73.8 16.5-76.6.2-74.3-17-66.2-30.6-58.1-44.2-44.2-54.3-29.7-63.2-15.2-72.1.1-79.9 15.3-78.1 30.6-76.3 32.2-71.1 44.7-61.6z" transform="translate(100 100)" />
    </svg>
  )
}

export function WaveDivider({
  className,
  flip = false,
  ...props
}: DecoProps & { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("block h-[40px] w-full md:h-[70px]", flip && "rotate-180", className)}
      {...props}
    >
      <path d="M0 40c120-40 240-40 360 0s240 40 360 0 240-40 360 0 240 40 360 0v40H0z" fill="currentColor" />
    </svg>
  )
}
