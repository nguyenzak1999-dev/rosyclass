"use client"

import { useEffect } from "react"
import { getPrimaryForeground, resolveAdminPrimaryColor } from "@/lib/theme-appearance"

export function StyleProvider() {
  useEffect(() => {
    const root = document.documentElement

    const applySavedStyles = () => {
      const savedColor = localStorage.getItem("app-primary-color")
      const savedRadius = localStorage.getItem("app-radius")
      const primaryColor = resolveAdminPrimaryColor(savedColor, root.classList.contains("dark"))

      if (primaryColor) {
        root.style.setProperty("--primary", primaryColor)
        root.style.setProperty("--primary-foreground", getPrimaryForeground(primaryColor))
      }

      if (savedRadius) root.style.setProperty("--radius", savedRadius)
    }

    applySavedStyles()

    const observer = new MutationObserver(applySavedStyles)

    observer.observe(root, {
      attributeFilter: ["class"],
      attributes: true,
    })

    return () => observer.disconnect()
  }, [])

  return null
}
