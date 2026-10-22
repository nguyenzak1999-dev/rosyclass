import Link from "next/link"
import { ChevronDown, Clock, Mail, MessageCircle, Music2, Phone, PlayCircle, Sparkles } from "lucide-react"
import type { SiteSettings } from "@/lib/site-settings"
import { cn } from "@/lib/utils"
import { Cloud, KidButton, RosyMascot, Sparkle, Star, WaveDivider, toneAt, toneClasses } from "@/components/kids"

interface PublicFooterProps {
  settings: SiteSettings
}

const footerColumns = [
  {
    eyebrow: "Học gì",
    links: [
      { label: "Tiếng Anh trẻ em", href: "/khoa-hoc?level=kids" },
      { label: "Tiếng Anh thiếu niên", href: "/khoa-hoc?level=teens" },
      { label: "Luyện thi IELTS", href: "/khoa-hoc?level=ielts" },
      { label: "Giao tiếp thực chiến", href: "/khoa-hoc?level=communication" },
    ],
  },
  {
    eyebrow: "RosyClass",
    links: [
      { label: "Về chúng tôi", href: "/ve-chung-toi" },
      { label: "Giáo viên", href: "/giao-vien" },
      { label: "Góc học tập", href: "/goc-hoc-tap" },
      { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat" },
    ],
  },
  {
    eyebrow: "Bắt đầu",
    links: [
      { label: "Kiểm tra trình độ", href: "/kiem-tra-trinh-do" },
      { label: "Lịch khai giảng", href: "/lich-khai-giang" },
      { label: "Khóa học", href: "/khoa-hoc" },
      { label: "Hỏi đáp", href: "/hoi-dap" },
    ],
  },
  {
    eyebrow: "Cần hỗ trợ?",
    links: [
      { label: "Liên hệ tư vấn", href: "/lien-he" },
    ],
  },
]

const headingColors = ["text-kid-sun", "text-kid-rose-soft", "text-kid-sky-soft", "text-kid-mint-soft"]

function LogoMark({ settings }: PublicFooterProps) {
  return (
    <Link href="/" aria-label={`${settings.siteName} - Trang chủ`} className="kid-wiggle kid-focus inline-flex rounded-2xl">
      {settings.logoUrl ? (
        <span className="kid-border kid-shadow-sm inline-flex -rotate-2 items-center rounded-2xl bg-white px-3 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={settings.logoUrl} alt={settings.siteName} className="h-[56px] w-auto max-w-[220px] object-contain" />
        </span>
      ) : (
        <span className="flex items-center gap-3">
          <span className="flex h-12 w-12 -rotate-6 items-center justify-center rounded-2xl border-[3px] border-white bg-kid-rose font-kid-display text-[26px] font-extrabold text-white">
            {settings.siteName.charAt(0)}
          </span>
          <span className="font-kid-display text-[28px] font-extrabold tracking-tight text-white">{settings.siteName}</span>
        </span>
      )}
    </Link>
  )
}

function SocialLink({
  href,
  label,
  index,
  children,
}: {
  href?: string
  label: string
  index: number
  children: React.ReactNode
}) {
  const className = cn(
    "kid-focus flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-white font-kid-display text-[20px] font-extrabold transition-transform duration-200",
    index % 2 === 0 ? "rotate-3" : "-rotate-3",
    href ? cn(toneClasses[toneAt(index)].solid, "hover:-translate-y-1 hover:rotate-0") : "bg-white/10 text-white/60"
  )

  if (!href) {
    return (
      <span role="img" aria-label={label} className={className}>
        {children}
      </span>
    )
  }

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={className}>
      {children}
    </Link>
  )
}

function SocialLinks({ settings, className = "" }: PublicFooterProps & { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <SocialLink href={settings.tiktok} label="TikTok" index={0}>
        <Music2 className="h-5 w-5" aria-hidden="true" />
      </SocialLink>
      <SocialLink href={settings.youtube} label="YouTube" index={1}>
        <PlayCircle className="h-5 w-5" aria-hidden="true" />
      </SocialLink>
      <SocialLink href={settings.zalo} label="Zalo" index={2}>
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
      </SocialLink>
      <SocialLink href={settings.facebook} label="Facebook" index={3}>
        <span aria-hidden="true">f</span>
      </SocialLink>
    </div>
  )
}

export function PublicFooter({ settings }: PublicFooterProps) {
  const contactLinks = [
    ...footerColumns.slice(0, 3),
    {
      ...footerColumns[3],
      links: [
        ...footerColumns[3].links,
        ...(settings.phone ? [{ label: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` }] : []),
        ...(settings.email ? [{ label: settings.email, href: `mailto:${settings.email}` }] : []),
        ...(settings.workingHours ? [{ label: settings.workingHours, href: "/lien-he" }] : []),
      ],
    },
  ]

  const contactIcon = (href: string) => {
    if (href.startsWith("tel:")) return <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
    if (href.startsWith("mailto:")) return <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
    return null
  }

  return (
    <footer className="relative mt-0 text-white">
      {/* Sóng chuyển từ nền kem sang nền mực */}
      <div className="relative bg-kid-cream">
        <Cloud className="kid-float-slow pointer-events-none absolute -top-2 left-[8%] hidden h-12 w-24 md:block" />
        <Star className="kid-float pointer-events-none absolute top-0 right-[10%] hidden h-9 w-9 -rotate-12 md:block" />
        <WaveDivider className="text-kid-ink" />
      </div>

      <div className="relative overflow-hidden bg-kid-ink">
        <Sparkle className="kid-spin-slow pointer-events-none absolute top-10 right-[6%] h-8 w-8 fill-kid-sun" />
        <Sparkle className="pointer-events-none absolute bottom-24 left-[4%] hidden h-6 w-6 fill-kid-sky md:block" />

        <div className="mx-auto max-w-[1206px] px-5 pt-10 pb-10 sm:px-8 lg:pt-16 lg:pb-12">
          <div className="grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-16">
            <div className="flex flex-col items-start gap-7">
              <LogoMark settings={settings} />

              {/* Sticker CTA kiểm tra trình độ */}
              <div className="relative w-full max-w-[300px] rotate-[-1.5deg] rounded-kid border-[3px] border-white bg-kid-sun p-5 text-kid-ink shadow-[0_6px_0_0_rgba(255,255,255,0.35)]">
                <RosyMascot mood="happy" className="absolute -top-12 -right-4 h-20 w-20 rotate-6" />
                <p className="pr-12 font-kid-display text-[20px] leading-tight font-extrabold">Kiểm tra trình độ</p>
                <KidButton href="/kiem-tra-trinh-do" tone="ink" size="sm" className="mt-4">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Đăng ký test
                </KidButton>
              </div>
            </div>

            <nav aria-label="Liên kết chân trang" className="grid grid-cols-1 gap-x-8 gap-y-10 min-[420px]:grid-cols-2 lg:grid-cols-4 lg:gap-10">
              {contactLinks.map((column, columnIndex) => (
                <div key={column.eyebrow} className="min-w-0">
                  <h3 className={cn("mb-5 font-kid-display text-[18px] font-extrabold", headingColors[columnIndex % headingColors.length])}>
                    {column.eyebrow}
                  </h3>
                  <ul className="space-y-3.5">
                    {column.links.map((link) => (
                      <li key={`${column.eyebrow}-${link.label}`}>
                        <Link
                          href={link.href}
                          className="kid-focus group inline-flex max-w-full items-center gap-2 rounded-lg text-[16px] leading-snug font-semibold break-words text-white/90 transition-colors hover:text-kid-sun"
                        >
                          {contactIcon(link.href) ?? (
                            link.href === "/lien-he" && link.label === settings.workingHours ? (
                              <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="h-2 w-2 shrink-0 rounded-full bg-white/40 transition-colors group-hover:bg-kid-sun"
                              />
                            )
                          )}
                          <span className="min-w-0">{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-12 border-t-[3px] border-dashed border-white/20 pt-8">
            <div className="mb-6 max-w-[720px] space-y-1 text-[14px] leading-6 text-white/75 lg:text-[15px]">
              {settings.legalName ? <p className="font-bold text-white/90">{settings.legalName}</p> : null}
              {settings.taxCode ? <p>Mã số thuế: {settings.taxCode}</p> : null}
              {settings.legalRepresentative ? <p>Người đại diện: {settings.legalRepresentative}</p> : null}
              {settings.address ? <p>Địa chỉ: {settings.address}</p> : null}
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] font-semibold text-white/80">
                <span className="text-white/70">{settings.copyright}</span>
                <Link href="/chinh-sach-bao-mat" className="kid-focus rounded transition-colors hover:text-kid-sun">
                  Chính sách bảo mật
                </Link>
                <Link href="/khoa-hoc" className="kid-focus rounded transition-colors hover:text-kid-sun">
                  Sitemap
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <SocialLinks settings={settings} />
                <button
                  type="button"
                  className="kid-focus hidden h-12 items-center gap-3 rounded-full border-[3px] border-white px-5 font-kid-display text-[16px] font-bold text-white transition-colors hover:bg-white/10 lg:inline-flex"
                >
                  <span>Tiếng Việt</span>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
