import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoneyInput(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") return ""
  const clean = String(value).replace(/\D/g, "")
  if (!clean) return ""
  return new Intl.NumberFormat("vi-VN").format(parseInt(clean, 10))
}

export function parseMoneyInput(value: string): number {
  const clean = value.replace(/\D/g, "")
  return clean ? parseInt(clean, 10) : 0
}
