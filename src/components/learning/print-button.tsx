"use client"

import { Printer } from "lucide-react"
import { cn } from "@/lib/utils"

/** Mở hộp thoại in của trình duyệt (in giấy hoặc "Lưu thành PDF") */
export function PrintButton({ className, label = "In / Lưu PDF" }: { className?: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={cn(
        "report-no-print kid-border kid-focus kid-pop inline-flex min-h-11 items-center gap-2 rounded-full bg-kid-sun px-5 font-bold text-kid-ink",
        className
      )}
    >
      <Printer className="h-4 w-4" /> {label}
    </button>
  )
}
