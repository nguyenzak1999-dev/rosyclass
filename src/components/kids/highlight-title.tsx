import { cn } from "@/lib/utils"
import { Squiggle } from "./decorations"

export interface HighlightTitleProps {
  title: string
  // Cụm từ trong title được gạch chân nguệch ngoạc
  highlight?: string
  squiggleClassName?: string
}

// Tách title để chèn gạch chân Squiggle dưới cụm từ highlight (dùng chung cho h1/h2)
export function HighlightTitle({ title, highlight, squiggleClassName }: HighlightTitleProps) {
  const index = highlight ? title.indexOf(highlight) : -1
  if (index < 0 || !highlight) return <>{title}</>

  return (
    <>
      {title.slice(0, index)}
      <span className="relative inline-block">
        <span className="relative z-10">{highlight}</span>
        <Squiggle className={cn("absolute -bottom-2 left-0 h-3 w-full md:h-4", squiggleClassName)} />
      </span>
      {title.slice(index + highlight.length)}
    </>
  )
}
