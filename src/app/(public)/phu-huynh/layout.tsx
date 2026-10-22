import type { Metadata } from "next"

// Cổng phụ huynh: dữ liệu riêng của từng gia đình, không cho máy tìm kiếm lập chỉ mục
export const metadata: Metadata = {
  title: "Cổng phụ huynh",
  robots: { index: false, follow: false, nocache: true },
  referrer: "same-origin",
}

export const dynamic = "force-dynamic"

export default function ParentPortalLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-16 sm:px-6">{children}</div>
}
