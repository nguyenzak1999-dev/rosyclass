import { cn } from "@/lib/utils"
import { KidBadge } from "./kid-card"
import { Squiggle } from "./decorations"
import type { KidTone } from "./tones"

export interface SectionHeadingProps {
  eyebrow?: string
  title: string
  // Từ/cụm từ trong title được gạch chân nguệch ngoạc để nhấn mạnh
  highlight?: string
  description?: string
  align?: "left" | "center"
  tone?: KidTone
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
  tone = "sun",
  className,
}: SectionHeadingProps) {
  const index = highlight ? title.indexOf(highlight) : -1

  return (
    <div className={cn("flex flex-col gap-4", align === "center" ? "items-center text-center" : "items-start text-left", className)}>
      {eyebrow ? <KidBadge tone={tone}>{eyebrow}</KidBadge> : null}
      <h2 className="max-w-[820px] text-[34px] leading-[1.1] font-extrabold text-kid-ink md:text-[52px]">
        {index >= 0 && highlight ? (
          <>
            {title.slice(0, index)}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10">{highlight}</span>
              <Squiggle className="absolute -bottom-2 left-0 h-3 w-full md:h-4" />
            </span>
            {title.slice(index + highlight.length)}
          </>
        ) : (
          title
        )}
      </h2>
      {description ? <p className="max-w-[640px] text-[17px] leading-relaxed text-kid-ink-soft md:text-[19px]">{description}</p> : null}
    </div>
  )
}
