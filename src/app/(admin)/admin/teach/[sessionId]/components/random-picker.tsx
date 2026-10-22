"use client"

import * as React from "react"
import { Shuffle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "./use-reduced-motion"

type Candidate = { id: string; fullName: string }

/**
 * "Chọn bé ngẫu nhiên": lướt qua tên các bé rồi chậm dần và dừng ở một bé.
 * Lần lượt chọn hết các bé trước khi lặp lại, để bé nào cũng được gọi.
 * Bật giảm chuyển động thì hiện ngay kết quả, không lướt tên.
 */
export function RandomPicker({
  candidates,
  onPicked,
  usingFallback,
}: {
  candidates: Candidate[]
  onPicked: (studentId: string | null) => void
  /** true khi chưa có bé nào được điểm danh có mặt, đang chọn trong các bé chưa điểm danh */
  usingFallback: boolean
}) {
  const reducedMotion = useReducedMotion()
  const [display, setDisplay] = React.useState<Candidate | null>(null)
  const [spinning, setSpinning] = React.useState(false)
  const [landed, setLanded] = React.useState(false)
  const pickedRef = React.useRef<Set<string>>(new Set())
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const pick = () => {
    if (candidates.length === 0 || spinning) return

    let pool = candidates.filter((candidate) => !pickedRef.current.has(candidate.id))
    if (pool.length === 0) {
      pickedRef.current.clear()
      pool = candidates.filter((candidate) => candidate.id !== display?.id)
      if (pool.length === 0) pool = candidates
    }
    const winner = pool[Math.floor(Math.random() * pool.length)]
    pickedRef.current.add(winner.id)

    if (reducedMotion || candidates.length === 1) {
      setDisplay(winner)
      setLanded(true)
      onPicked(winner.id)
      return
    }

    setSpinning(true)
    setLanded(false)
    onPicked(null)
    const steps = 16 + Math.floor(Math.random() * 6)
    let index = Math.floor(Math.random() * candidates.length)
    let step = 0
    const tick = () => {
      step++
      if (step >= steps) {
        setDisplay(winner)
        setSpinning(false)
        setLanded(true)
        onPicked(winner.id)
        return
      }
      index = (index + 1) % candidates.length
      setDisplay(candidates[index])
      // Chậm dần: 55ms → khoảng 330ms
      const progress = step / steps
      timerRef.current = setTimeout(tick, 55 + progress * progress * 280)
    }
    tick()
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={pick}
        disabled={candidates.length === 0 || spinning}
        className="kid-border kid-shadow-sm kid-pop kid-focus inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-kid-grape px-5 font-bold text-white disabled:opacity-50"
      >
        <Shuffle className="h-5 w-5" /> Chọn bé ngẫu nhiên
      </button>
      <div
        aria-live="polite"
        className={cn(
          "flex min-h-12 min-w-0 flex-1 items-center rounded-full border-2 border-dashed border-kid-ink/30 px-5 font-kid-display text-xl font-bold",
          landed && "border-solid border-kid-ink bg-kid-sun-soft",
          landed && !reducedMotion && "kid-bounce-in"
        )}
      >
        <span className="truncate">
          {display ? (landed ? `🌟 ${display.fullName}` : display.fullName) : candidates.length === 0 ? "Chưa có bé nào để chọn" : "Bé nào sẽ trả lời nhỉ?"}
        </span>
      </div>
      {usingFallback && candidates.length > 0 ? (
        <p className="text-xs text-kid-ink-soft sm:max-w-40">Chưa điểm danh nên đang chọn trong cả lớp.</p>
      ) : null}
    </div>
  )
}
