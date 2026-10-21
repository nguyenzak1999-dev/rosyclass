import Link from "next/link"
import type React from "react"
import { cn } from "@/lib/utils"
import { toneClasses, type KidTone } from "./tones"

type KidButtonTone = KidTone | "white" | "ink"

const extraTones: Record<"white" | "ink", string> = {
  white: "bg-white text-kid-ink",
  ink: "bg-kid-ink text-white",
}

const sizes = {
  sm: "h-10 px-5 text-[15px]",
  md: "h-12 px-7 text-[17px]",
  lg: "h-14 px-9 text-[19px]",
}

export interface KidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  tone?: KidButtonTone
  size?: keyof typeof sizes
}

export function KidButton({ href, tone = "rose", size = "md", className, children, ...props }: KidButtonProps) {
  const toneClass = tone === "white" || tone === "ink" ? extraTones[tone] : toneClasses[tone].solid
  const classes = cn(
    "kid-pop kid-border kid-shadow-sm inline-flex items-center justify-center gap-2 rounded-full font-kid-display font-bold whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-kid-sun/60 disabled:pointer-events-none disabled:opacity-60",
    toneClass,
    sizes[size],
    className
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
