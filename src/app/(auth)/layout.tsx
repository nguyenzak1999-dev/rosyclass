import type { Metadata } from "next"

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
