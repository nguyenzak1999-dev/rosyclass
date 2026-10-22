"use client"

import * as React from "react"
import { Minus, Plus, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { MAX_STARS, MOODS, PRAISE_TAGS } from "@/lib/curriculum"

export type AttendanceValue =
  | "PRESENT"
  | "LATE"
  | "ABSENT_WITH_PERMISSION"
  | "ABSENT_WITHOUT_PERMISSION"
  | "MAKE_UP"

export type StudentDraft = {
  status: AttendanceValue | null
  stars: number
  praises: string[]
  mood: string | null
  comment: string
}

export const STATUS_META: Record<AttendanceValue, { label: string; emoji: string; card: string; chip: string }> = {
  PRESENT: { label: "Có mặt", emoji: "✅", card: "bg-kid-mint-soft", chip: "bg-kid-mint text-white" },
  LATE: { label: "Muộn", emoji: "⏰", card: "bg-kid-orange-soft", chip: "bg-kid-orange text-white" },
  ABSENT_WITH_PERMISSION: { label: "Vắng có phép", emoji: "📩", card: "bg-kid-sky-soft", chip: "bg-kid-sky text-white" },
  ABSENT_WITHOUT_PERMISSION: { label: "Vắng", emoji: "➖", card: "bg-[#eceaf1]", chip: "bg-kid-ink-soft text-white" },
  MAKE_UP: { label: "Học bù", emoji: "🔁", card: "bg-kid-grape-soft", chip: "bg-kid-grape text-white" },
}

const CLASS_CYCLE: AttendanceValue[] = ["PRESENT", "LATE", "ABSENT_WITH_PERMISSION", "ABSENT_WITHOUT_PERMISSION"]
const GUEST_CYCLE: AttendanceValue[] = ["MAKE_UP", "LATE", "ABSENT_WITH_PERMISSION", "ABSENT_WITHOUT_PERMISSION"]

export function nextStatus(current: AttendanceValue | null, isGuest: boolean): AttendanceValue {
  const cycle = isGuest ? GUEST_CYCLE : CLASS_CYCLE
  if (!current) return cycle[0]
  const index = cycle.indexOf(current)
  return cycle[(index + 1) % cycle.length]
}

export function isAbsent(status: AttendanceValue | null) {
  return status === "ABSENT_WITH_PERMISSION" || status === "ABSENT_WITHOUT_PERMISSION"
}

const AVATAR_COLORS = ["bg-kid-rose", "bg-kid-sky", "bg-kid-mint", "bg-kid-grape", "bg-kid-orange", "bg-kid-sun"]

function avatarColor(id: string) {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function initials(fullName: string) {
  // Tên tiếng Việt: lấy chữ cái đầu của tên gọi (từ cuối)
  const parts = fullName.trim().split(/\s+/)
  return (parts[parts.length - 1]?.[0] ?? "?").toUpperCase()
}

export const StudentCard = React.memo(function StudentCard({
  id,
  fullName,
  isGuest,
  totalStars,
  draft,
  highlighted,
  disabled,
  onChange,
}: {
  id: string
  fullName: string
  isGuest: boolean
  /** Tổng sao ở các buổi đã lưu của lớp (không tính thay đổi chưa lưu) */
  totalStars: number
  draft: StudentDraft
  highlighted: boolean
  disabled: boolean
  onChange: (id: string, patch: Partial<StudentDraft>) => void
}) {
  const meta = draft.status ? STATUS_META[draft.status] : null
  const absent = isAbsent(draft.status)
  const feedbackDisabled = disabled || absent

  const setStars = (value: number) => onChange(id, { stars: Math.max(0, Math.min(MAX_STARS, value)) })
  const togglePraise = (praise: string) =>
    onChange(id, {
      praises: draft.praises.includes(praise) ? draft.praises.filter((item) => item !== praise) : [...draft.praises, praise],
    })

  return (
    <article
      id={`student-${id}`}
      className={cn(
        "kid-border flex flex-col gap-3 rounded-[24px] p-3 transition-shadow",
        meta ? meta.card : "border-dashed bg-white",
        highlighted ? "kid-shadow ring-4 ring-kid-sun" : "kid-shadow-sm"
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(id, { status: nextStatus(draft.status, isGuest) })}
        className="kid-focus flex min-h-16 items-center gap-3 rounded-[18px] text-left disabled:cursor-default"
        aria-label={`${fullName}: ${meta?.label ?? "chưa điểm danh"}. Chạm để đổi trạng thái`}
      >
        <span
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-kid-ink font-kid-display text-2xl font-bold text-white",
            avatarColor(id),
            absent && "opacity-50"
          )}
          aria-hidden
        >
          {initials(fullName)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-kid-display text-lg leading-tight font-bold">{fullName}</span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-bold",
                meta ? meta.chip : "border-2 border-dashed border-kid-ink/40 text-kid-ink-soft"
              )}
            >
              {meta ? `${meta.emoji} ${meta.label}` : "Chạm để điểm danh"}
            </span>
            {isGuest ? <span className="text-xs font-semibold text-kid-grape">Bé lớp khác</span> : null}
            <span className="text-xs text-kid-ink-soft" title="Tổng sao đã lưu ở lớp này">
              Tổng ⭐ {totalStars}
            </span>
          </span>
        </span>
      </button>

      <div className={cn("space-y-2.5", absent && "opacity-60")}>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={feedbackDisabled || draft.stars === 0}
            onClick={() => setStars(draft.stars - 1)}
            aria-label={`Bớt một sao cho ${fullName}`}
            className="kid-focus flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-kid-ink bg-white disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="flex flex-1 justify-center" role="group" aria-label={`Sao của ${fullName}: ${draft.stars}/${MAX_STARS}`}>
            {Array.from({ length: MAX_STARS }, (_, index) => (
              <button
                key={index}
                type="button"
                disabled={feedbackDisabled}
                onClick={() => setStars(draft.stars === index + 1 ? index : index + 1)}
                aria-label={`${index + 1} sao`}
                className="kid-focus flex h-11 w-9 items-center justify-center rounded-full disabled:cursor-default"
              >
                <Star
                  className={cn(
                    "h-7 w-7 stroke-[2.5] text-kid-ink",
                    index < draft.stars ? "fill-kid-sun" : "fill-white opacity-40"
                  )}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={feedbackDisabled || draft.stars >= MAX_STARS}
            onClick={() => setStars(draft.stars + 1)}
            aria-label={`Thêm một sao cho ${fullName}`}
            className="kid-focus flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-kid-ink bg-kid-sun disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRAISE_TAGS.map((praise) => {
            const active = draft.praises.includes(praise)
            return (
              <button
                key={praise}
                type="button"
                disabled={feedbackDisabled}
                onClick={() => togglePraise(praise)}
                aria-pressed={active}
                className={cn(
                  "kid-focus min-h-9 rounded-full border-2 px-3 text-xs font-bold transition-colors",
                  active ? "border-kid-ink bg-kid-rose text-white" : "border-kid-ink/25 bg-white text-kid-ink"
                )}
              >
                {praise}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex shrink-0 gap-0.5" role="group" aria-label="Cảm xúc của bé">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                type="button"
                disabled={feedbackDisabled}
                onClick={() => onChange(id, { mood: draft.mood === mood.value ? null : mood.value })}
                aria-pressed={draft.mood === mood.value}
                aria-label={mood.label}
                title={mood.label}
                className={cn(
                  "kid-focus flex h-10 w-10 items-center justify-center rounded-full text-xl",
                  draft.mood === mood.value ? "border-2 border-kid-ink bg-kid-sun-soft" : "opacity-60 grayscale-[40%]"
                )}
              >
                {mood.value}
              </button>
            ))}
          </div>
        </div>
        <input
          type="text"
          value={draft.comment}
          disabled={disabled}
          maxLength={500}
          onChange={(event) => onChange(id, { comment: event.target.value })}
          placeholder="Nhận xét ngắn…"
          aria-label={`Nhận xét cho ${fullName}`}
          className="kid-field min-h-11 px-3 py-2 text-sm"
        />
      </div>
    </article>
  )
})
