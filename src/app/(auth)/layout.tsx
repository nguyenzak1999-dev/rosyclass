import type { Metadata } from "next"

// Trang đăng nhập không cache
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Đăng nhập quản trị",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-dvh bg-kid-cream text-kid-ink">{children}</div>
}
