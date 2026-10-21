import type React from "react"
import { cn } from "@/lib/utils"
import { KidBadge } from "./kid-card"
import { Cloud, Sparkle, Star, WaveDivider } from "./decorations"
import { HighlightTitle } from "./highlight-title"
import { toneClasses, type KidTone } from "./tones"

export interface PageHeroProps {
  eyebrow?: string
  eyebrowIcon?: React.ReactNode
  title: string
  highlight?: string
  description?: React.ReactNode
  tone?: KidTone
  // Tone của nhãn eyebrow (mặc định khác tone nền cho nổi bật)
  badgeTone?: KidTone
  align?: "left" | "center"
  // Màu của sóng ở đáy hero, mặc định trùng nền cream của trang
  waveClassName?: string
  decorations?: boolean
  className?: string
  contentClassName?: string
  children?: React.ReactNode
  // Nội dung cột phải (ảnh, mascot...) khi align="left"
  aside?: React.ReactNode
}

// Hero đầu trang cho các trang công khai: nền màu kẹo, chấm bi, trang trí và sóng ở đáy
export function PageHero({
  eyebrow,
  eyebrowIcon,
  title,
  highlight,
  description,
  tone = "sun",
  badgeTone,
  align = "center",
  waveClassName = "text-kid-cream",
  decorations = true,
  className,
  contentClassName,
  children,
  aside,
}: PageHeroProps) {
  const centered = align === "center"
  const badge = badgeTone ?? (tone === "sun" ? "grape" : "sun")

  return (
    <section className={cn("relative overflow-hidden", toneClasses[tone].soft, className)}>
      <div aria-hidden="true" className="kid-dots pointer-events-none absolute inset-0 opacity-70" />

      {decorations ? (
        <>
          <Star className="kid-float pointer-events-none absolute top-8 left-[6%] hidden h-10 w-10 rotate-12 sm:block md:h-12 md:w-12" />
          <Sparkle className="kid-spin-slow pointer-events-none absolute top-14 right-[8%] h-7 w-7 fill-kid-grape md:h-9 md:w-9" />
          <Cloud className="kid-float-slow pointer-events-none absolute bottom-16 left-[-30px] hidden h-14 w-28 md:block lg:h-16 lg:w-32" />
          <Sparkle className="pointer-events-none absolute right-[18%] bottom-20 hidden h-5 w-5 fill-kid-sky md:block" />
        </>
      ) : null}

      <div
        className={cn(
          "relative mx-auto max-w-[1200px] px-4 pt-12 pb-20 sm:px-8 md:pt-20 md:pb-28",
          aside ? "grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]" : null,
          contentClassName
        )}
      >
        <div className={cn("kid-rise flex flex-col gap-5", centered && !aside ? "mx-auto max-w-[860px] items-center text-center" : "items-start text-left")}>
          {eyebrow ? (
            <KidBadge tone={badge} className="kid-shadow-sm -rotate-2 text-[15px]">
              {eyebrowIcon}
              {eyebrow}
            </KidBadge>
          ) : null}
          <h1 className="text-[36px] leading-[1.08] font-extrabold break-words text-kid-ink sm:text-[44px] md:text-[60px]">
            <HighlightTitle title={title} highlight={highlight} />
          </h1>
          {description ? (
            <div className={cn("max-w-[680px] text-[17px] leading-relaxed text-kid-ink-soft md:text-[19px]", centered && !aside && "mx-auto")}>
              {description}
            </div>
          ) : null}
          {children}
        </div>
        {aside ? <div className="kid-rise relative [--kid-delay:0.15s]">{aside}</div> : null}
      </div>

      <WaveDivider className={cn("absolute inset-x-0 -bottom-px", waveClassName)} />
    </section>
  )
}
