import { Metadata } from "next"
import { getPublishedCourses } from "./actions"
import { RegisterClient } from "./register-client"
import { DesignedPage, designedPageMetadata } from "@/components/page-builder/designed-page"

export async function generateMetadata(): Promise<Metadata> {
  return designedPageMetadata("dang-ky", {
    title: "Đăng ký học thử",
    description: "Ba mẹ đăng ký cho bé học thử miễn phí tại RosyClass — tiếng Anh cho trẻ mầm non và tiểu học. Đội ngũ tư vấn sẽ liên hệ để gợi ý lộ trình phù hợp với bé.",
    path: "/dang-ky",
  })
}

async function RegisterPageContent() {
  const courses = await getPublishedCourses()
  return <RegisterClient courses={courses} />
}

// Trang thiết kế lại được trong CMS (page builder); phần trên là nội dung chính của trang
export default function RegisterPage() {
  return (
    <DesignedPage slug="dang-ky">
      <RegisterPageContent />
    </DesignedPage>
  )
}
