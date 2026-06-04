"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-[68px] h-6"></div> // Placeholder to prevent layout shift
  }

  const isDark = resolvedTheme === "dark"

  return (
    <div className="flex items-center gap-2">
      <Sun className={`h-4 w-4 ${isDark ? "text-muted-foreground" : "text-foreground"}`} />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
      <Moon className={`h-4 w-4 ${!isDark ? "text-muted-foreground" : "text-foreground"}`} />
    </div>
  )
}
