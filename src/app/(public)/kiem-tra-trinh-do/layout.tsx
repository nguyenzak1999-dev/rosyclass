import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Kiểm tra trình độ miễn phí",
  description: "Làm bài kiểm tra trình độ tiếng Anh miễn phí tại RosyClass để nhận tư vấn lộ trình học phù hợp.",
  path: "/kiem-tra-trinh-do",
})

export default function PlacementTestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
