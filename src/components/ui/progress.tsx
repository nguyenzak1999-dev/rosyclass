"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number
  max?: number
}

export function Progress({ value = 0, max = 100, className, ...props }: ProgressProps) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      className={cn("h-2 w-full bg-muted rounded-full overflow-hidden", className)}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
