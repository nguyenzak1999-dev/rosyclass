import { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"
import { getPublishedCourses } from "./actions"
import { RegisterClient } from "./register-client"

export const metadata: Metadata = createPageMetadata({
  title: "Đăng ký học thử",
  description: "Đăng ký học thử miễn phí tại RosyClass. Đội ngũ tư vấn sẽ liên hệ để xây dựng lộ trình học phù hợp nhất cho bạn.",
  path: "/dang-ky",
})

export default async function RegisterPage() {
  const courses = await getPublishedCourses()
  return <RegisterClient courses={courses} />
}
