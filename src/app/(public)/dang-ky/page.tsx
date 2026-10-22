import { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"
import { getPublishedCourses } from "./actions"
import { RegisterClient } from "./register-client"

export const metadata: Metadata = createPageMetadata({
  title: "Đăng ký học thử",
  description: "Ba mẹ đăng ký cho bé học thử miễn phí tại RosyClass — tiếng Anh cho trẻ mầm non và tiểu học. Đội ngũ tư vấn sẽ liên hệ để gợi ý lộ trình phù hợp với bé.",
  path: "/dang-ky",
})

export default async function RegisterPage() {
  const courses = await getPublishedCourses()
  return <RegisterClient courses={courses} />
}
