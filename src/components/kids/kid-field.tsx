import type React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { toneClasses, type KidTone } from "./tones"

// Các ô nhập liệu kiểu "sticker" cho form công khai. Đều là thẻ HTML gốc nên
// tương thích với react-hook-form (register) lẫn form không kiểm soát.

export function KidLabel({
  className,
  required,
  icon,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean; icon?: React.ReactNode }) {
  return (
    <label className={cn("flex items-center gap-2 font-kid-display text-[16px] font-bold text-kid-ink", className)} {...props}>
      {icon ? <span className="inline-flex shrink-0 items-center" aria-hidden="true">{icon}</span> : null}
      <span>
        {children}
        {required ? (
          <span className="ml-1 text-[#d92d5b]" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
    </label>
  )
}

export function KidInput({ className, ref, ...props }: React.ComponentProps<"input">) {
  return <input ref={ref} className={cn("kid-field h-14 px-4", className)} {...props} />
}

export function KidTextarea({ className, ref, ...props }: React.ComponentProps<"textarea">) {
  return <textarea ref={ref} className={cn("kid-field min-h-[120px] resize-y p-4 leading-relaxed", className)} {...props} />
}

export function KidSelect({ className, children, ref, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select ref={ref} className={cn("kid-field h-14 cursor-pointer appearance-none pr-12 pl-4", className)} {...props}>
        {children}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-3 my-auto flex h-8 w-8 items-center justify-center rounded-full border-2 border-kid-ink bg-kid-sun text-kid-ink"
      >
        <ChevronDown className="h-4 w-4" strokeWidth={3} />
      </span>
    </div>
  )
}

export function KidField({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />
}

// Nút chọn dạng "chip" (toggle). Dùng aria-pressed để trình đọc màn hình biết trạng thái
export function KidChoice({
  selected,
  tone = "sun",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; tone?: KidTone }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "kid-pop kid-focus flex min-h-12 items-center gap-2 rounded-2xl border-[3px] border-kid-ink px-3.5 py-2.5 text-left text-[15px] font-bold text-kid-ink",
        selected ? cn(toneClasses[tone].soft, "kid-shadow-sm") : "bg-white shadow-[0_2px_0_0_var(--color-kid-ink)] hover:bg-kid-cream",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-kid-ink",
          selected ? toneClasses[tone].solid : "bg-white"
        )}
      >
        {selected ? <span className="h-2 w-2 rounded-full bg-current" /> : null}
      </span>
      <span className="leading-snug">{children}</span>
    </button>
  )
}
