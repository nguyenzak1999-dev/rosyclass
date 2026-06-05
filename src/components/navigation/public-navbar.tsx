"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AnimatedButton } from "@/components/ui/animated-button"
import { motion, AnimatePresence } from "framer-motion"

export function PublicNavbar({ siteName = "RosyClass", logoUrl = "" }: { siteName?: string; logoUrl?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { name: "Khóa học", href: "/khoa-hoc" },
    { name: "Lịch khai giảng", href: "/lich-khai-giang" },
    { name: "Giáo viên", href: "/giao-vien" },
    { name: "Về chúng tôi", href: "/ve-chung-toi" },
    { name: "Góc học tập", href: "/goc-hoc-tap" },
    { name: "Liên hệ", href: "/lien-he" },
  ]

  return (
    <header className="fixed top-0 inset-x-0 z-[999] bg-[#fcf5eb] transition-all duration-300">
      <div className="w-full px-4 md:px-12 mx-auto">
        <motion.div
          className="flex items-center justify-between relative z-[999] h-[80px]"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Left: Logo */}
          <Link href="/" className="flex items-center space-x-2 group shrink-0">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteName} className="h-9 object-contain" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-[#25d366] flex items-center justify-center text-pure-white font-medium text-lg rotate-3 group-hover:-rotate-3 transition-transform">
                  {siteName.charAt(0)}
                </div>
                <span className="font-medium inline-block text-[20px] text-[#1c1e21] tracking-tight">
                  {siteName.replace(/^(.)/, '') ? siteName.slice(0, 1) : ''}<span className="text-[#1c1e21]">{siteName.slice(1)}</span>
                </span>
              </>
            )}
          </Link>

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex flex-1 px-8">
            <nav className="flex items-center justify-between w-full max-w-[700px] mx-auto">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(link.href + "/")
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-[15px] tracking-tight transition-colors flex items-center gap-1 ${isActive
                      ? "text-[#25d366] font-medium"
                      : "text-[#111b21] font-normal hover:text-[#25d366]"
                      }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center space-x-4 shrink-0">
            <nav className="hidden md:flex items-center space-x-4">
              <AnimatedButton href="/dang-nhap" variant="outline" size="sm">
                Đăng nhập
                <svg width="6" height="10" viewBox="0 0 10 18" fill="none"><path d="M0.879395 13.0463L6.41356 7.5L0.879395 1.95375L2.58314 0.25L9.83315 7.5L2.58314 14.75L0.879395 13.0463Z" fill="currentColor"></path></svg>
              </AnimatedButton>
              <AnimatedButton href="/kiem-tra-trinh-do" variant="primary" size="sm">
                Kiểm tra trình độ
              </AnimatedButton>
            </nav>

            <Button
              variant="ghost"
              type="button"
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-[#25d366] text-[#ffffff] hover:bg-[#25d366]/90"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                ) : (
                  <>
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </>
                )}
              </svg>
            </Button>
          </div>
        </motion.div>

        {/* Mobile Menu Backdrop */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 h-screen bg-midnight-ink/40 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[calc(100%+8px)] left-4 right-4 z-50 flex flex-col gap-4 overflow-hidden rounded-[24px] bg-[#ffffff] p-5 shadow-xl lg:hidden"
            >
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || pathname?.startsWith(link.href + "/")
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-2xl px-4 py-3 text-[15px] font-medium tracking-tight transition-colors ${isActive ? "bg-[#25d366]/10 text-[#25d366]" : "text-[#111b21] hover:bg-[#f0f4f9]"
                        }`}
                    >
                      {link.name}
                    </Link>
                  )
                })}
                <Link
                  href="/kiem-tra-trinh-do"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-4 py-3 text-[15px] font-semibold tracking-tight text-[#111b21] transition-colors hover:bg-[#20bd5a]"
                >
                  <span>Kiểm tra trình độ</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
