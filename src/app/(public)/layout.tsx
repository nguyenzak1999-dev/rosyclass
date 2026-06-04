import Link from "next/link"
import { PhoneCall, MapPin, Mail, Globe, PlayCircle, MessageCircle, Music2 } from "lucide-react"
import { PublicNavbar } from "@/components/navigation/public-navbar"
import { getSiteSettings } from "@/lib/get-site-settings"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const s = await getSiteSettings()

  return (
    <div className="flex flex-col min-h-screen font-sans bg-sky-wash relative">
      <PublicNavbar siteName={s.siteName} logoUrl={s.logoUrl} />
      
      <main className="flex-1 pt-24">{children}</main>

      <footer className="bg-sky-wash text-stone py-20 mt-16 border-t border-black/5">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              {s.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.logoUrl} alt={s.siteName} className="h-10 object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-midnight-ink flex items-center justify-center text-white font-bold text-lg">
                    {s.siteName.charAt(0)}
                  </div>
                  <span className="font-bold inline-block text-midnight-ink text-xl tracking-tight">{s.siteName}</span>
                </>
              )}
            </div>
            <p className="text-[14px] text-stone leading-relaxed tracking-tight">
              {s.tagline}
            </p>
            {s.workingHours && (
              <p className="text-[13px] text-fog">{s.workingHours}</p>
            )}
          </div>

          {/* Khóa học */}
          <div>
            <h4 className="text-midnight-ink font-semibold mb-6 text-[16px] tracking-tight">Khóa học</h4>
            <ul className="space-y-4 text-[14px] tracking-tight">
              <li><Link href="/khoa-hoc?level=kids" className="hover:text-midnight-ink transition-colors">Tiếng Anh Trẻ Em</Link></li>
              <li><Link href="/khoa-hoc?level=teens" className="hover:text-midnight-ink transition-colors">Tiếng Anh Thiếu Niên</Link></li>
              <li><Link href="/khoa-hoc?level=ielts" className="hover:text-midnight-ink transition-colors">Luyện thi IELTS</Link></li>
              <li><Link href="/khoa-hoc?level=communication" className="hover:text-midnight-ink transition-colors">Tiếng Anh Giao Tiếp</Link></li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h4 className="text-midnight-ink font-semibold mb-6 text-[16px] tracking-tight">Hỗ trợ</h4>
            <ul className="space-y-4 text-[14px] tracking-tight">
              <li><Link href="/khoa-hoc" className="hover:text-midnight-ink transition-colors">Lịch khai giảng</Link></li>
              <li><Link href="/kiem-tra-trinh-do" className="hover:text-midnight-ink transition-colors">Kiểm tra trình độ</Link></li>
              <li><Link href="/hoi-dap" className="hover:text-midnight-ink transition-colors">Hỏi đáp (FAQ)</Link></li>
              <li><Link href="/chinh-sach-bao-mat" className="hover:text-midnight-ink transition-colors">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h4 className="text-midnight-ink font-semibold mb-6 text-[16px] tracking-tight">Liên hệ</h4>
            <ul className="space-y-4 text-[14px] tracking-tight">
              {s.address && (
                <li className="flex items-start">
                  <MapPin className="w-4 h-4 mr-3 mt-0.5 shrink-0" />
                  <span>{s.address}</span>
                </li>
              )}
              {s.phone && (
                <li className="flex items-center">
                  <PhoneCall className="w-4 h-4 mr-3 shrink-0" />
                  <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="hover:text-midnight-ink transition-colors">{s.phone}</a>
                </li>
              )}
              {s.email && (
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-3 shrink-0" />
                  <a href={`mailto:${s.email}`} className="hover:text-midnight-ink transition-colors">{s.email}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 mt-16 pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[14px] text-fog tracking-tight">{s.copyright}</p>
          <div className="flex space-x-6">
            {s.facebook && (
              <Link href={s.facebook} target="_blank" rel="noopener noreferrer" className="text-fog hover:text-midnight-ink transition-colors">
                <Globe className="w-5 h-5" />
              </Link>
            )}
            {s.youtube && (
              <Link href={s.youtube} target="_blank" rel="noopener noreferrer" className="text-fog hover:text-midnight-ink transition-colors">
                <PlayCircle className="w-5 h-5" />
              </Link>
            )}
            {s.zalo && (
              <Link href={s.zalo} target="_blank" rel="noopener noreferrer" className="text-fog hover:text-midnight-ink transition-colors">
                <MessageCircle className="w-5 h-5" />
              </Link>
            )}
            {s.tiktok && (
              <Link href={s.tiktok} target="_blank" rel="noopener noreferrer" className="text-fog hover:text-midnight-ink transition-colors">
                <Music2 className="w-5 h-5" />
              </Link>
            )}
            {/* Hiển thị icons mặc định nếu chưa điền */}
            {!s.facebook && !s.youtube && !s.zalo && !s.tiktok && (
              <>
                <span className="text-fog"><Globe className="w-5 h-5" /></span>
                <span className="text-fog"><PlayCircle className="w-5 h-5" /></span>
                <span className="text-fog"><MessageCircle className="w-5 h-5" /></span>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
