import Link from "next/link"
import { ArrowLeft, CalendarCheck, HeartHandshake, Wallet } from "lucide-react"
import { RosyMascot } from "@/components/kids/mascot"
import { getSiteSettings } from "@/lib/get-site-settings"
import { LoginForm } from "./login-form"

const HIGHLIGHTS = [
  { icon: CalendarCheck, title: "Lên lớp & điểm danh", text: "Điểm danh, nhận xét và xếp kèm bù ngay trên lớp." },
  { icon: Wallet, title: "Học phí theo tháng", text: "Tính số buổi, đối chiếu tháng trước và in phiếu thu." },
  { icon: HeartHandshake, title: "Kết nối phụ huynh", text: "Báo cáo tiến bộ, bài tập và anh chị em trong nhà." },
]

/** Chỉ nhận đường dẫn nội bộ trong khu quản trị, tránh chuyển hướng ra trang ngoài sau khi đăng nhập */
function safeNext(value: string | undefined) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//") || value.startsWith("/admin-login")) return undefined
  return value
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, settings] = await Promise.all([searchParams, getSiteSettings()])
  const siteName = settings.siteName || "RosyClass"

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] lg:grid-cols-[1.1fr_1fr] lg:grid-rows-1">
      {/* Bảng thương hiệu: màn hình lớn hiện đầy đủ, điện thoại chỉ còn dải tiêu đề */}
      <aside className="relative overflow-hidden bg-kid-ink text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-kid-rose/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-kid-grape/30 blur-3xl" aria-hidden />

        <div className="relative flex items-center gap-3 px-6 py-5 lg:hidden">
          <RosyMascot className="h-12 w-12" />
          <div>
            <p className="font-kid-display text-xl font-bold leading-tight">{siteName}</p>
            <p className="text-sm text-white/70">Khu quản trị trung tâm</p>
          </div>
        </div>

        <div className="relative hidden h-full flex-col justify-between gap-10 p-10 lg:flex xl:p-14">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-kid-rose font-kid-display text-2xl font-bold text-kid-ink">
              R
            </span>
            <span className="font-kid-display text-2xl font-bold">{siteName}</span>
          </div>

          <div className="space-y-8">
            <div className="relative max-w-lg">
              {/* eslint-disable-next-line @next/next/no-img-element -- minh hoạ SVG tĩnh */}
              <img
                src="/demo/kids-classroom.svg"
                alt=""
                className="aspect-[4/3] w-full rounded-[28px] border-4 border-white/90 object-cover shadow-[0_8px_0_0_var(--color-kid-rose)]"
              />
              <RosyMascot mood="wow" className="absolute -bottom-8 -right-6 h-28 w-28 drop-shadow-lg" />
            </div>
            <div className="max-w-lg space-y-3">
              <h2 className="font-kid-display text-3xl font-bold leading-tight xl:text-4xl text-balance">
                Mọi việc của trung tâm, gọn trong một nơi.
              </h2>
              <p className="text-white/70">Lớp học, học phí, phụ huynh và website — cho cô giáo, giáo vụ và kế toán.</p>
            </div>
            <ul className="grid max-w-lg gap-4">
              {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-kid-sun">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="block text-sm text-white/65">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/50">© {new Date().getFullYear()} {siteName} · Gia Lâm, Hà Nội</p>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-kid-cream px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-kid-ink sm:text-3xl">Đăng nhập quản trị</h1>
            <p className="text-sm text-kid-ink-soft">Dùng email và mật khẩu trung tâm đã cấp cho bạn.</p>
          </div>

          <div className="rounded-2xl border border-kid-ink/10 bg-white p-6 shadow-sm sm:p-7">
            <LoginForm next={safeNext(next)} />
          </div>

          <div className="space-y-3 text-center text-sm text-kid-ink-soft">
            <p>Quên mật khẩu? Nhờ quản trị viên trung tâm đặt lại cho bạn.</p>
            <Link href="/" className="inline-flex items-center gap-1 font-medium text-kid-ink hover:underline">
              <ArrowLeft className="h-4 w-4" /> Về trang web {siteName}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
