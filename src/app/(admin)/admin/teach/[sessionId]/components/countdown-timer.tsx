"use client"

import * as React from "react"
import { Pause, Play, RotateCcw, Timer } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "./use-reduced-motion"

const PRESETS = [1, 3, 5]

function format(ms: number) {
  const total = Math.ceil(ms / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

/**
 * Đồng hồ đếm ngược cho hoạt động trên lớp. Hết giờ thì khung chuyển màu và
 * nhấp nháy nhẹ (không nhấp nháy khi bật giảm chuyển động), không bật hộp thoại.
 */
export function CountdownTimer() {
  const reducedMotion = useReducedMotion()
  const [duration, setDuration] = React.useState(3 * 60 * 1000)
  const [remaining, setRemaining] = React.useState(duration)
  const [endAt, setEndAt] = React.useState<number | null>(null)
  const finished = remaining <= 0

  React.useEffect(() => {
    if (endAt === null) return
    const id = setInterval(() => {
      const left = Math.max(0, endAt - Date.now())
      setRemaining(left)
      if (left <= 0) setEndAt(null)
    }, 250)
    return () => clearInterval(id)
  }, [endAt])

  const choose = (minutes: number) => {
    const ms = minutes * 60 * 1000
    setDuration(ms)
    setRemaining(ms)
    setEndAt(null)
  }

  const toggle = () => {
    if (endAt !== null) {
      setEndAt(null)
      return
    }
    const startFrom = finished ? duration : remaining
    setRemaining(startFrom)
    setEndAt(Date.now() + startFrom)
  }

  const reset = () => {
    setEndAt(null)
    setRemaining(duration)
  }

  const progress = duration > 0 ? remaining / duration : 0

  return (
    <div
      className={cn(
        "kid-border flex flex-wrap items-center gap-2 rounded-[22px] bg-white p-2 pr-3 transition-colors",
        finished && "bg-kid-sun",
        finished && !reducedMotion && "animate-pulse"
      )}
    >
      <div className="flex items-center gap-1">
        {PRESETS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => choose(minutes)}
            aria-pressed={duration === minutes * 60 * 1000}
            className={cn(
              "kid-focus min-h-11 min-w-11 rounded-full border-2 border-kid-ink px-3 text-sm font-bold",
              duration === minutes * 60 * 1000 ? "bg-kid-sky text-white" : "bg-white"
            )}
          >
            {minutes}′
          </button>
        ))}
      </div>
      <div className="flex min-w-[92px] items-center gap-1.5 font-kid-display text-3xl font-bold tabular-nums" aria-live="off">
        <Timer className="h-5 w-5 shrink-0" aria-hidden />
        {format(remaining)}
      </div>
      <div className="hidden h-2 w-20 overflow-hidden rounded-full bg-kid-ink/10 sm:block" aria-hidden>
        <div className="h-full rounded-full bg-kid-sky" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <button
        type="button"
        onClick={toggle}
        className="kid-focus inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-kid-ink bg-kid-mint px-4 font-bold text-white"
      >
        {endAt !== null ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {endAt !== null ? "Tạm dừng" : finished ? "Chạy lại" : "Bắt đầu"}
      </button>
      <button
        type="button"
        onClick={reset}
        aria-label="Đặt lại đồng hồ"
        className="kid-focus inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 border-kid-ink bg-white"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
      <span role="status" className={cn("font-kid-display text-lg font-bold", !finished && "sr-only")}>
        {finished ? "Hết giờ! ⏰" : ""}
      </span>
    </div>
  )
}
