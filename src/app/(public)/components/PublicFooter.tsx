import Link from "next/link"
import { ChevronDown, Download, MessageCircle, Music2, PlayCircle } from "lucide-react"
import type { SiteSettings } from "@/lib/site-settings"

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

function LogoMark({ settings }: PublicFooterProps) {
  return (
    <Link href="/" className="flex items-center gap-3">
      {settings.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={settings.logoUrl}
          alt={settings.siteName}
          className="h-[80px] max-w-[380px] object-contain brightness-0 invert"
        />
      ) : (
        <>
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#f7fbf8] text-[15px] font-semibold leading-none text-[#f7fbf8] lg:text-[22px]">
            {settings.siteName.charAt(0)}
          </div>
          <span className="inline-block text-[20px] font-semibold tracking-tight text-[#f7fbf8] lg:text-[28px]">
            {settings.siteName}
          </span>
        </>
      )}
    </Link>
  )
}

function SocialLink({
  href,
  label,
  children,
}: {
  href?: string
  label: string
  children: React.ReactNode
}) {
  const className = "flex h-[62px] w-[62px] items-center justify-center rounded-full border border-[#f7fbf8]/85 text-[15px] font-semibold text-[#f7fbf8] transition-colors hover:border-[#25d366] hover:text-[#25d366] lg:h-[58px] lg:w-[58px] lg:text-[22px]"

  if (!href) {
    return (
      <span aria-label={label} className={className}>
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
    <div className={`flex items-center justify-center gap-6 text-[#f7fbf8] ${className}`}>
      <SocialLink href={settings.tiktok} label="TikTok">
        <Music2 className="h-5 w-5" />
      </SocialLink>
      <SocialLink href={settings.youtube} label="YouTube">
        <PlayCircle className="h-5 w-5" />
      </SocialLink>
      <SocialLink href={settings.zalo} label="Zalo">
        <MessageCircle className="h-5 w-5" />
      </SocialLink>
      <SocialLink href={settings.facebook} label="Facebook">
        f
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

  return (
    <footer className="mt-0 bg-[#111b21] text-[#f7fbf8]">
      <div className="border-y border-[#d9fdd3]/20 py-8 lg:hidden">
        <SocialLinks settings={settings} />
      </div>

      <div className="mx-auto max-w-[1206px] px-6 pb-10 pt-14 sm:px-8 lg:pb-12 lg:pt-28">
        <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
          <div className="flex flex-col items-start gap-8 lg:min-h-[220px] lg:justify-between">
            <LogoMark settings={settings} />

            <Link
              href="/kiem-tra-trinh-do"
              className="hidden min-h-[60px] items-center gap-4 rounded-full bg-[#25d366] px-8 text-[18px] font-medium tracking-tight text-[#06140b] transition-colors hover:bg-[#d9fdd3] lg:inline-flex"
            >
              <span>Đăng ký test</span>
              <Download className="h-5 w-5" strokeWidth={2.2} />
            </Link>
          </div>

          <nav className="grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-4 lg:gap-12">
            {contactLinks.map((column) => (
              <div key={column.eyebrow}>
                <h3 className="mb-7 text-[11px] font-semibold tracking-tight text-[#f7fbf8]/70 lg:mb-8 lg:text-[13px]">
                  {column.eyebrow}
                </h3>
                <ul className="space-y-6">
                  {column.links.map((link) => (
                    <li key={`${column.eyebrow}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center text-[15px] font-semibold leading-tight tracking-tight text-[#f7fbf8] transition-colors hover:text-[#25d366] lg:whitespace-nowrap lg:text-[20px] lg:font-medium"
                      >
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 border-t border-[#d9fdd3]/20 pt-9 lg:mt-20">
          {settings.address && (
            <p className="mb-8 max-w-[560px] text-[11px] leading-5 tracking-tight text-[#f7fbf8]/70 lg:text-[15px] lg:leading-6">
              {settings.address}
            </p>
          )}

          <div className="grid gap-8 lg:grid-cols-[1fr_auto_260px] lg:items-center">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[10px] font-medium leading-tight tracking-tight text-[#f7fbf8] lg:text-[14px]">
              <span className="max-w-[220px] text-[#f7fbf8]">{settings.copyright}</span>
              <Link href="/chinh-sach-bao-mat" className="transition-colors hover:text-[#25d366]">
                Chính sách bảo mật
              </Link>
              <Link href="/khoa-hoc" className="transition-colors hover:text-[#25d366]">
                Sitemap
              </Link>
            </div>

            <SocialLinks settings={settings} className="hidden lg:flex" />

            <button
              type="button"
              className="hidden h-[66px] w-full items-center justify-between rounded-full border-2 border-[#f7fbf8] px-8 text-left text-[18px] font-semibold tracking-tight text-[#f7fbf8] transition-colors hover:border-[#25d366] hover:text-[#25d366] lg:flex"
            >
              <span>Tiếng Việt</span>
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
