"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function PublicNavbar({ siteName = "RosyClass", logoUrl = "" }: { siteName?: string; logoUrl?: string }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Khóa học", href: "/khoa-hoc" },
    { name: "Lịch khai giảng", href: "/lich-khai-giang" },
    { name: "Giáo viên", href: "/giao-vien" },
    { name: "Về chúng tôi", href: "/ve-chung-toi" },
    { name: "Góc học tập", href: "/goc-hoc-tap" },
    { name: "Liên hệ", href: "/lien-he" },
  ]

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? "py-4" : "py-6"}`}>
      <div className="max-w-[1200px] px-4 sm:px-8 mx-auto">
        <motion.div 
          className={`flex items-center justify-between transition-all duration-300 relative z-50 ${
            isScrolled || mobileMenuOpen
              ? "bg-pure-white/90 backdrop-blur-xl shadow-subtle border border-stone/10 rounded-full px-6 h-16" 
              : "bg-transparent h-16 px-0"
          }`}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex gap-10 items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={siteName} className="h-9 object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-midnight-ink flex items-center justify-center text-white font-bold text-lg rotate-3 group-hover:-rotate-3 transition-transform">
                    {siteName.charAt(0)}
                  </div>
                  <span className="font-bold inline-block text-midnight-ink text-xl tracking-tight">
                    {siteName.replace(/^(.)/, '')  ? siteName.slice(0,1) : ''}<span className="text-stone">{siteName.slice(1)}</span>
                  </span>
                </>
              )}
            </Link>
            
            <nav className="hidden lg:flex gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(link.href + "/")
                return (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    className={`text-[14px] font-medium tracking-tight transition-colors relative ${
                      isActive ? "text-midnight-ink" : "text-stone hover:text-midnight-ink"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-midnight-ink rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-4">
              <Link 
                href="/kiem-tra-trinh-do" 
                className="group text-[14px] font-bold tracking-tight bg-primary text-midnight-ink px-5 py-2.5 rounded-full hover:bg-primary/90 hover:scale-105 hover:shadow-md active:scale-95 transition-all duration-300 flex items-center gap-2 relative overflow-hidden"
              >
                <span className="relative z-10">Kiểm tra trình độ</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
                {/* Shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full bg-white/40 group-hover:animate-[shimmer_1.5s_infinite] skew-x-12 z-0" />
              </Link>
            </nav>
            
            <Button 
              variant="ghost" 
              className="lg:hidden p-2 text-midnight-ink hover:bg-black/5 rounded-full"
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
                    <line x1="4" x2="20" y1="12" y2="12"/>
                    <line x1="4" x2="20" y1="6" y2="6"/>
                    <line x1="4" x2="20" y1="18" y2="18"/>
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
              className="absolute top-[calc(100%+8px)] left-4 right-4 bg-pure-white border border-stone/10 shadow-2xl rounded-[24px] p-5 lg:hidden flex flex-col gap-4 overflow-hidden z-50"
            >
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || pathname?.startsWith(link.href + "/")
                  return (
                    <Link 
                      key={link.name} 
                      href={link.href} 
                      onClick={() => setMobileMenuOpen(false)}
                      className={`p-3 rounded-2xl text-[15px] font-medium transition-colors ${
                        isActive ? "bg-sky-wash text-primary" : "text-midnight-ink hover:bg-cloud-veil"
                      }`}
                    >
                      {link.name}
                    </Link>
                  )
                })}
                <Link 
                  href="/kiem-tra-trinh-do"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group p-3 rounded-2xl text-[15px] font-bold text-midnight-ink bg-primary hover:bg-primary/90 transition-all text-center flex items-center justify-center gap-2 mt-2 shadow-sm"
                >
                  <span>Kiểm tra trình độ</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
