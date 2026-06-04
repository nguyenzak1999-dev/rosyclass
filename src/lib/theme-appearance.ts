export const ADMIN_COLORS = [
  { name: "Zinc (Mặc định)", value: "oklch(0.205 0 0)", isDark: "oklch(0.985 0 0)" },
  { name: "Rose", value: "oklch(0.511 0.262 27.681)", isDark: "oklch(0.672 0.222 23.363)" },
  { name: "Blue", value: "oklch(0.546 0.245 262.881)", isDark: "oklch(0.669 0.178 259.043)" },
  { name: "Green", value: "oklch(0.528 0.198 141.488)", isDark: "oklch(0.627 0.194 149.214)" },
  { name: "Orange", value: "oklch(0.646 0.222 41.116)", isDark: "oklch(0.724 0.213 42.41)" },
]

export function resolveAdminPrimaryColor(color: string | null, isDark: boolean) {
  const colorConfig = ADMIN_COLORS.find((item) => item.value === color || item.isDark === color)

  if (!colorConfig) {
    return color
  }

  return isDark ? colorConfig.isDark : colorConfig.value
}

export function getPrimaryForeground(primaryColor: string | null) {
  if (!primaryColor) {
    return "oklch(0.985 0 0)"
  }

  const oklchLightness = primaryColor.match(/oklch\(\s*([0-9.]+)/i)?.[1]
  if (oklchLightness) {
    return Number(oklchLightness) > 0.7 ? "oklch(0.205 0 0)" : "oklch(0.985 0 0)"
  }

  const hex = primaryColor.match(/^#?([a-f\d]{6})$/i)?.[1]
  if (hex) {
    const red = Number.parseInt(hex.slice(0, 2), 16)
    const green = Number.parseInt(hex.slice(2, 4), 16)
    const blue = Number.parseInt(hex.slice(4, 6), 16)
    const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255

    return luminance > 0.62 ? "oklch(0.205 0 0)" : "oklch(0.985 0 0)"
  }

  return "oklch(0.985 0 0)"
}
