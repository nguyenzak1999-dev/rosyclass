import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Chính sách bảo mật",
  description: "Chính sách bảo mật thông tin cá nhân của phụ huynh và các bé khi đăng ký và học tại RosyClass.",
  path: "/chinh-sach-bao-mat",
})

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
