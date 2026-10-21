import { Blob, Sparkle, Star, toneClasses, type KidTone } from "@/components/kids"
import { cn } from "@/lib/utils"
import { BlockButton, BlockImage } from "./shared"

export function HeroButtons({
  primaryText,
  primaryLink,
  secondaryText,
  secondaryLink,
  accent,
}: {
  primaryText?: string | null
  primaryLink?: string | null
  secondaryText?: string
  secondaryLink?: string
  accent: KidTone
}) {
  if (!(primaryText && primaryLink) && !(secondaryText && secondaryLink)) return null
  return (
    <div className="flex w-full flex-col gap-3 @md:w-auto @md:flex-row @md:flex-wrap">
      <BlockButton text={primaryText ?? ""} link={primaryLink ?? ""} tone={accent} size="lg" />
      <BlockButton text={secondaryText} link={secondaryLink} tone="white" size="lg" />
    </div>
  )
}

export function HeroImage({ src, alt, accent }: { src: string; alt: string; accent: KidTone }) {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <Blob className={cn("absolute -inset-8 h-[calc(100%+4rem)] w-[calc(100%+4rem)]", toneClasses[accent].fill, "opacity-30")} />
      <div className="kid-border kid-shadow relative rotate-2 overflow-hidden rounded-kid-lg bg-white">
        <BlockImage src={src} alt={alt} eager className="aspect-[4/3] w-full" tone={accent} />
      </div>
      <Star className="kid-float absolute -top-6 -left-4 h-14 w-14 @3xl:h-16 @3xl:w-16" />
      <Sparkle className="kid-float-slow absolute -right-3 -bottom-5 h-10 w-10 fill-kid-sky" />
    </div>
  )
}
