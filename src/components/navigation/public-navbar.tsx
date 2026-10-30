"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { BookOpen, CalendarDays, FileText, Lightbulb, Menu, Phone, Smile, Sparkles, Users, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { KidButton, Sparkle, Star, toneAt, toneClasses } from "@/components/kids"

const navLinks = [
  { name: "Khóa học", href: "/khoa-hoc", Icon: BookOpen },
  { name: "Lịch khai giảng", href: "/lich-khai-giang", Icon: CalendarDays },
  { name: "Giáo viên", href: "/giao-vien", Icon: Users },
  { name: "Về chúng tôi", href: "/ve-chung-toi", Icon: Smile },
  { name: "Góc học tập", href: "/goc-hoc-tap", Icon: Lightbulb },
  { name: "Liên hệ", href: "/lien-he", Icon: Phone },
]

// Màu hover cho từng pill (liệt kê đủ để Tailwind không purge)
const hoverSoft: Record<string, string> = {
  rose: "hover:bg-kid-rose-soft",
  sun: "hover:bg-kid-sun-soft",
  sky: "hover:bg-kid-sky-soft",
  mint: "hover:bg-kid-mint-soft",
  grape: "hover:bg-kid-grape-soft",
  orange: "hover:bg-kid-orange-soft",
}

function Logo({ siteName, logoUrl }: { siteName: string; logoUrl: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteName} - Trang chủ`}
      className="kid-wiggle kid-focus group flex shrink-0 items-center gap-2 rounded-2xl"
    >
      {logoUrl ? (
        <span className="kid-border kid-shadow-sm inline-flex -rotate-2 items-center rounded-2xl bg-white px-2.5 py-1 transition-transform group-hover:rotate-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt={siteName} className="h-[44px] w-auto max-w-[150px] object-contain md:h-[50px] md:max-w-[180px]" />
        </span>
      ) : (
        <>
          <span className="kid-border kid-shadow-sm flex h-11 w-11 -rotate-6 items-center justify-center rounded-2xl bg-kid-rose font-kid-display text-[24px] font-extrabold text-white transition-transform group-hover:rotate-3">
            {siteName.charAt(0)}
          </span>
          <span className="font-kid-display text-[24px] leading-none font-extrabold tracking-tight text-kid-ink">
            {siteName.slice(0, 1)}
            <span className="text-kid-rose">{siteName.slice(1)}</span>
          </span>
        </>
      )}
    </Link>
  )
}

export function PublicNavbar({
  siteName = "RosyClass",
  logoUrl = "",
  extraLinks = [],
}: {
  siteName?: string
  logoUrl?: string
  /** Trang tự tạo trong CMS được bật "Hiện trên menu" */
  extraLinks?: { name: string; href: string }[]
}) {
  const links = [...navLinks, ...extraLinks.map((link) => ({ ...link, Icon: FileText }))]
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  const isActive = (href: string) => pathname === href || Boolean(pathname?.startsWith(href + "/"))

  // Đóng menu bằng phím Esc và khoá cuộn trang khi menu đang mở
  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [mobileMenuOpen])

  return (
    <header className="fixed inset-x-0 top-0 z-[999]">
      <a
        href="#main-content"
        className="sr-only rounded-full bg-kid-ink px-4 py-2 font-bold text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[1001]"
      >
        Bỏ qua điều hướng
      </a>

      <div className="relative z-[1000] border-b-[3px] border-kid-ink bg-kid-cream/95 backdrop-blur supports-[backdrop-filter]:bg-kid-cream/85">
        <div className="mx-auto flex h-[80px] w-full max-w-[1440px] items-center justify-between gap-3 px-4 md:px-8">
          <Logo siteName={siteName} logoUrl={logoUrl} />

          {/* Điều hướng desktop: các pill nhiều màu */}
          <nav aria-label="Điều hướng chính" className="hidden flex-1 justify-center xl:flex">
            <ul className="flex items-center gap-1.5">
              {links.map((link, i) => {
                const tone = toneAt(i)
                const active = isActive(link.href)
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "kid-focus inline-flex h-11 items-center rounded-full border-[3px] px-3 font-kid-display text-[16px] font-bold whitespace-nowrap transition-[background-color,transform,box-shadow] duration-200",
                        active
                          ? cn(toneClasses[tone].soft, "kid-shadow-sm -rotate-2 border-kid-ink text-kid-ink")
                          : cn("border-transparent text-kid-ink hover:-translate-y-0.5 hover:border-kid-ink", hoverSoft[tone])
                      )}
                    >
                      {link.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2.5">
            <div className="hidden items-center gap-2.5 sm:flex">
              <KidButton href="/dang-ky" tone="white" size="sm" className="hidden md:inline-flex xl:hidden 2xl:inline-flex">
                Đăng ký
              </KidButton>
              <KidButton href="/kiem-tra-trinh-do" tone="rose" size="sm" className="text-kid-ink">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Kiểm tra trình độ
              </KidButton>
            </div>

            <button
              type="button"
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="public-mobile-menu"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className={cn(
                "kid-pop kid-border kid-shadow-sm kid-focus flex h-12 w-12 items-center justify-center rounded-2xl xl:hidden",
                mobileMenuOpen ? "bg-kid-ink text-white" : "bg-kid-sun text-kid-ink"
              )}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" strokeWidth={3} /> : <Menu className="h-6 w-6" strokeWidth={3} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="backdrop"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[998] bg-kid-ink/45 backdrop-blur-[2px] xl:hidden"
            />
            <motion.div
              key="sheet"
              id="public-mobile-menu"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -24, rotate: -2, scale: 0.96 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, rotate: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              // Bấm vào bất kỳ link nào trong sheet thì đóng menu
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("a")) setMobileMenuOpen(false)
              }}
              className="kid-border kid-shadow-lg absolute inset-x-3 top-[92px] z-[999] max-h-[calc(100dvh-110px)] overflow-y-auto rounded-kid-lg bg-white p-4 sm:inset-x-auto sm:right-6 sm:w-[400px] xl:hidden"
            >
              <Star className="pointer-events-none absolute -top-1 right-6 h-9 w-9 rotate-12" />
              <Sparkle className="pointer-events-none absolute top-14 right-4 h-5 w-5 fill-kid-sky" />

              <nav aria-label="Điều hướng di động">
                <ul className="grid gap-2.5">
                  {links.map((link, i) => {
                    const tone = toneAt(i)
                    const active = isActive(link.href)
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "kid-pop kid-focus flex items-center gap-3 rounded-2xl border-[3px] border-kid-ink px-3 py-2.5 font-kid-display text-[18px] font-bold text-kid-ink",
                            active ? cn(toneClasses[tone].soft, "kid-shadow-sm") : "bg-white shadow-[0_2px_0_0_var(--color-kid-ink)]"
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-kid-ink", toneClasses[tone].solid)}
                          >
                            <link.Icon className="h-5 w-5" strokeWidth={2.5} />
                          </span>
                          <span className="flex-1">{link.name}</span>
                          {active ? <span className="h-3 w-3 rounded-full border-2 border-kid-ink bg-kid-sun" aria-hidden="true" /> : null}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              <div className="mt-4 grid gap-2.5 border-t-[3px] border-dashed border-kid-ink/20 pt-4">
                <KidButton href="/kiem-tra-trinh-do" tone="rose" size="md" className="w-full text-kid-ink">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                  Kiểm tra trình độ
                </KidButton>
                <KidButton href="/dang-ky" tone="sun" size="md" className="w-full">
                  Đăng ký
                </KidButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
