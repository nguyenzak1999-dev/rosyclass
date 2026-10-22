"use client"

import { HOMEWORK_STICKERS } from "@/lib/curriculum"
import { cn } from "@/lib/utils"

/** Chọn một sticker chấm bài; bấm lại sticker đang chọn để bỏ chọn */
export function StickerPicker({
  value,
  onChange,
  disabled,
}: {
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Sticker">
      {HOMEWORK_STICKERS.map((sticker) => {
        const selected = value === sticker
        return (
          <button
            key={sticker}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onChange(selected ? null : sticker)}
            className={cn(
              "min-h-10 rounded-full border px-3 text-sm font-semibold transition-colors disabled:opacity-50",
              selected ? "border-amber-500 bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100" : "hover:bg-muted"
            )}
          >
            {sticker}
          </button>
        )
      })}
    </div>
  )
}
