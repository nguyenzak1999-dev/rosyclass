import React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  variant?: "primary" | "outline"
  size?: "default" | "sm"
  children: React.ReactNode
}

export function AnimatedButton({
  href,
  variant = "primary",
  size = "default",
  className,
  children,
  ...props
}: AnimatedButtonProps) {
  // Use font-medium as requested to make it lighter (mảnh hơn) than bold/semibold
  const baseClasses =
    "group relative overflow-hidden inline-flex items-center justify-center transition-colors duration-300 font-medium whitespace-nowrap"

  const variantClasses = {
    primary: "bg-[#25d366] text-[#111b21] hover:text-white border-0 shadow-sm",
    outline: "bg-transparent text-[#111b21] hover:text-white border-[1.5px] border-[#111b21]",
  }

  const hoverBgClasses = {
    primary: "bg-[#111b21]",
    outline: "bg-[#111b21]",
  }

  const sizeClasses = {
    default: "rounded-[50px] px-[32px] py-[16px] text-[18px]",
    sm: "rounded-[50px] px-[24px] py-[10px] text-[15px]",
  }

  const combinedClasses = cn(baseClasses, variantClasses[variant], sizeClasses[size], className)

  const content = (
    <>
      <div
        className={cn(
          "absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0",
          hoverBgClasses[variant]
        )}
      />
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {content}
      </Link>
    )
  }

  return (
    <button className={combinedClasses} {...props}>
      {content}
    </button>
  )
}
