import type React from "react"
import { cn } from "@/lib/utils"
import { toneClasses, type KidTone } from "./tones"

export interface KidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: KidTone | "white"
  interactive?: boolean
}

export function KidCard({ tone = "white", interactive = false, className, ...props }: KidCardProps) {
  return (
    <div
      className={cn(
        "kid-border kid-shadow rounded-kid p-6",
        tone === "white" ? "bg-white" : toneClasses[tone].soft,
        interactive && "kid-pop",
        className
      )}
      {...props}
    />
  )
}

export function KidBadge({
  tone = "sun",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: KidTone }) {
  return (
    <span
      className={cn(
        "kid-border inline-flex items-center gap-1.5 rounded-full px-4 py-1 font-kid-display text-[14px] font-bold",
        toneClasses[tone].solid,
        className
      )}
      {...props}
    />
  )
}
