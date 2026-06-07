"use client"

import { useEffect, useRef, useState } from "react"
import { SiteSettings } from "@/lib/site-settings"

/** Tách số và suffix từ string như "5000+", "98%", "5" */
function parseStatNumber(raw: string): { value: number; suffix: string } {
  const match = raw.match(/^([\d,.]+)(.*)$/)
  if (!match) return { value: 0, suffix: raw }
  const value = parseFloat(match[1].replace(/,/g, ""))
  const suffix = match[2] ?? ""
  return { value: isNaN(value) ? 0 : value, suffix }
}

function AnimatedCounter({
  target,
  suffix,
  duration = 1800,
  started,
}: {
  target: number
  suffix: string
  duration?: number
  started: boolean
}) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!started) return

    let startTime: number | null = null
    const startValue = 0

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = Math.round(startValue + (target - startValue) * eased)
      setDisplay(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [started, target, duration])

  /** Format số có dấu phẩy nếu >= 1000 */
  const formatted = display >= 1000 ? display.toLocaleString("vi-VN") : display

  return (
    <span>
      {formatted}
      {suffix}
    </span>
  )
}

export function StatisticsSection({ settings }: { settings?: SiteSettings }) {
  const statistics = settings?.statistics || []
  const sectionRef = useRef<HTMLElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (statistics.length === 0) return null

  return (
    <section
      ref={sectionRef}
      className="reveal-section py-16 border-y border-gray-100 bg-white"
    >
      <div className="max-w-[1000px] mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {statistics.map((stat, index) => {
            const { value, suffix } = parseStatNumber(stat.number)
            return (
              <div key={index} className="space-y-2">
                <h3 className="text-[40px] md:text-[56px] font-medium text-[#25d366]">
                  <AnimatedCounter
                    target={value}
                    suffix={suffix}
                    duration={1800}
                    started={started}
                  />
                </h3>
                <p className="text-[16px] text-[#54656f]">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
