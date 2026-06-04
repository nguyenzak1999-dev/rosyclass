import Link from "next/link"
import { ChevronDown, Download, MessageCircle, Music2, PlayCircle } from "lucide-react"
import { PublicNavbar } from "@/components/navigation/public-navbar"
import { getSiteSettings } from "@/lib/get-site-settings"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const s = await getSiteSettings()
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
        ...(s.phone ? [{ label: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` }] : []),
        ...(s.email ? [{ label: s.email, href: `mailto:${s.email}` }] : []),
        ...(s.workingHours ? [{ label: s.workingHours, href: "/lien-he" }] : []),
      ],
    },
  ]

  return (
    <div className="theme-client flex flex-col min-h-screen font-sans bg-background relative">
      <PublicNavbar siteName={s.siteName} logoUrl={s.logoUrl} />
      
      <main className="flex-1 pt-[80px]">{children}</main>

      <footer className="mt-0 bg-[#111b21] text-[#f7fbf8]">
        <div className="mx-auto max-w-[1206px] px-6 pb-10 pt-20 sm:px-8 lg:pb-12 lg:pt-28">
          <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
            <div className="flex flex-col items-start gap-8 lg:min-h-[220px] lg:justify-between">
              <Link href="/" className="flex items-center gap-3">
                {s.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.logoUrl} alt={s.siteName} className="h-10 max-w-[190px] object-contain brightness-0 invert" />
                ) : (
                  <>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#f7fbf8] text-[22px] font-semibold leading-none text-[#f7fbf8]">
                      {s.siteName.charAt(0)}
                    </div>
                    <span className="inline-block text-[28px] font-semibold tracking-tight text-[#f7fbf8]">{s.siteName}</span>
                  </>
                )}
              </Link>

              <Link
                href="/kiem-tra-trinh-do"
                className="inline-flex min-h-[60px] items-center gap-4 rounded-full bg-[#25d366] px-8 text-[18px] font-medium tracking-tight text-[#06140b] transition-colors hover:bg-[#d9fdd3]"
              >
                <span>Đăng ký test</span>
                <Download className="h-5 w-5" strokeWidth={2.2} />
              </Link>
            </div>

            <nav className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
              {footerColumns.map((column) => (
                <div key={column.eyebrow}>
                  <h3 className="mb-8 text-[13px] font-semibold tracking-tight text-[#f7fbf8]/70">{column.eyebrow}</h3>
                  <ul className="space-y-6">
                    {column.links.map((link) => (
                      <li key={`${column.eyebrow}-${link.label}`}>
                        <Link
                          href={link.href}
                          className="group inline-flex items-center gap-3 text-[20px] font-medium leading-tight tracking-tight text-[#f7fbf8] transition-colors hover:text-[#25d366]"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#1f2b31] transition-colors group-hover:bg-[#25d366]" />
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-20 border-t border-[#d9fdd3]/20 pt-9">
            {s.address && (
              <p className="mb-8 max-w-[560px] text-[15px] leading-6 tracking-tight text-[#f7fbf8]/70">
                {s.address}
              </p>
            )}

            <div className="grid gap-8 lg:grid-cols-[1fr_auto_260px] lg:items-center">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[14px] font-medium leading-tight tracking-tight text-[#f7fbf8]">
                <span className="max-w-[180px] text-[#f7fbf8]">{s.copyright}</span>
                <Link href="/chinh-sach-bao-mat" className="transition-colors hover:text-[#25d366]">
                  Chính sách bảo mật
                </Link>
                <Link href="/khoa-hoc" className="transition-colors hover:text-[#25d366]">
                  Sitemap
                </Link>
              </div>

              <div className="flex items-center gap-4 text-[#f7fbf8]">
                {s.facebook ? (
                  <Link href={s.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#f7fbf8] text-[22px] font-semibold transition-colors hover:border-[#25d366] hover:text-[#25d366]">
                    f
                  </Link>
                ) : (
                  <span aria-label="Facebook" className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#f7fbf8] text-[22px] font-semibold">
                    f
                  </span>
                )}
                {s.youtube ? (
                  <Link href={s.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#f7fbf8] transition-colors hover:border-[#25d366] hover:text-[#25d366]">
                    <PlayCircle className="h-5 w-5" />
                  </Link>
                ) : (
                  <span aria-label="YouTube" className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#f7fbf8]">
                    <PlayCircle className="h-5 w-5" />
                  </span>
                )}
                {s.zalo ? (
                  <Link href={s.zalo} target="_blank" rel="noopener noreferrer" aria-label="Zalo" className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#f7fbf8] transition-colors hover:border-[#25d366] hover:text-[#25d366]">
                    <MessageCircle className="h-5 w-5" />
                  </Link>
                ) : (
                  <span aria-label="Zalo" className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#f7fbf8]">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                )}
                {s.tiktok ? (
                  <Link href={s.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#f7fbf8] transition-colors hover:border-[#25d366] hover:text-[#25d366]">
                    <Music2 className="h-5 w-5" />
                  </Link>
                ) : (
                  <span aria-label="TikTok" className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#f7fbf8]">
                    <Music2 className="h-5 w-5" />
                  </span>
                )}
              </div>

              <button
                type="button"
                className="flex h-[66px] w-full items-center justify-between rounded-full border-2 border-[#f7fbf8] px-8 text-left text-[18px] font-semibold tracking-tight text-[#f7fbf8] transition-colors hover:border-[#25d366] hover:text-[#25d366]"
              >
                <span>Tiếng Việt</span>
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
