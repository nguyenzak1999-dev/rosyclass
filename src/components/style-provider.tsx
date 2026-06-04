"use client"

import { useEffect } from "react"

export function StyleProvider() {
  useEffect(() => {
    // Tải cấu hình giao diện từ localStorage
    const savedColor = localStorage.getItem("app-primary-color")
    const savedRadius = localStorage.getItem("app-radius")
    const savedFont = localStorage.getItem("app-font")
    
    const root = document.documentElement
    
    if (savedColor) root.style.setProperty("--primary", savedColor)
    if (savedRadius) root.style.setProperty("--radius", savedRadius)
    if (savedFont) root.style.setProperty("font-family", savedFont)
  }, [])

  return null
}
