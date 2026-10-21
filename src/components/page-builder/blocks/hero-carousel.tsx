"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { KidBadge, type KidTone } from "@/components/kids"
import { cn } from "@/lib/utils"
import type { PbBanner } from "@/lib/page-builder/types"
import { HeroButtons, HeroImage } from "./hero-parts"

const AUTOPLAY_MS = 7000

export function HeroBannerCarousel({
  slides,
  accent,
  badge,
  secondaryText,
  secondaryLink,
  footnote,
}: {
  slides: PbBanner[]
  accent: KidTone
  badge?: string
  secondaryText?: string
  secondaryLink?: string
  footnote?: string
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length
  const active = slides[Math.min(index, count - 1)]

  useEffect(() => {
    if (count < 2 || paused) return
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (reduce) return
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [count, paused])

  if (!active) return null

  const go = (delta: number) => setIndex((current) => (current + delta + count) % count)
  const [firstLine, ...rest] = (active.title || "").split("\n")

  return (
    <div
      className="grid items-center gap-10 @3xl:grid-cols-[1.05fr_0.95fr] @5xl:gap-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="flex flex-col items-start gap-6" aria-live="polite">
        {badge ? <KidBadge tone={accent === "sun" ? "rose" : "sun"}>{badge}</KidBadge> : null}
        {active.title ? (
          <h1 className="text-[40px] leading-[1.05] font-extrabold text-kid-ink @3xl:text-[54px] @5xl:text-[64px]">
            {firstLine}
            {rest.length > 0 ? (
              <>
                <br />
                <span className="text-kid-ink">{rest.join(" ")}</span>
              </>
            ) : null}
          </h1>
        ) : null}
        {active.subtitle ? (
          <p className="max-w-[560px] text-[18px] leading-relaxed whitespace-pre-line text-kid-ink-soft @3xl:text-[20px]">
            {active.subtitle}
          </p>
        ) : null}
        <HeroButtons
          primaryText={active.buttonText}
          primaryLink={active.buttonUrl}
          secondaryText={secondaryText}
          secondaryLink={secondaryLink}
          accent={accent}
        />
        {footnote ? <p className="text-[14px] text-kid-ink-soft">{footnote}</p> : null}

        {count > 1 ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              className="kid-border kid-pop flex h-11 w-11 items-center justify-center rounded-full bg-white"
              aria-label="Slide trước"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Slide ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "kid-border h-3.5 rounded-full transition-all",
                    i === index ? "w-8 bg-kid-ink" : "w-3.5 bg-white"
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              className="kid-border kid-pop flex h-11 w-11 items-center justify-center rounded-full bg-white"
              aria-label="Slide tiếp theo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : null}
      </div>
      <HeroImage key={active.id} src={active.image} alt={active.title || "Banner"} accent={accent} />
    </div>
  )
}
