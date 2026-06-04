import Link from "next/link"
import { Award, HeartHandshake, Star } from "lucide-react"

export type FeaturedTeacher = {
  id: string
  fullName: string
  avatar: string | null
  bio: string
  specialties: string
  certificates: string
}

const fallbackTeachers: FeaturedTeacher[] = [
  {
    id: "teacher-speaking",
    fullName: "Ms. Emily",
    avatar: "/hero_slider_2.png",
    bio: "Tập trung sửa phát âm, phản xạ câu và sự tự tin khi giao tiếp.",
    specialties: "Giao tiếp, trẻ em",
    certificates: "TESOL",
  },
  {
    id: "teacher-ielts",
    fullName: "Mr. David",
    avatar: "/hero_slider_3.png",
    bio: "Giúp học viên xây nền IELTS theo từng kỹ năng và mục tiêu điểm số.",
    specialties: "IELTS, học thuật",
    certificates: "IELTS 8.0",
  },
  {
    id: "teacher-kids",
    fullName: "Ms. Anna",
    avatar: "/english-center-hero.png",
    bio: "Thiết kế lớp học nhiều tương tác để trẻ nhớ bài tự nhiên.",
    specialties: "Kids, Starter",
    certificates: "CELTA",
  },
]

export function FeaturedTeachersSection({ teachers }: { teachers: FeaturedTeacher[] }) {
  const visibleTeachers = teachers.length > 0 ? teachers : fallbackTeachers

  return (
    <section className="reveal-section bg-[#fcf5eb] py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <div className="mb-12 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-3 text-[14px] font-semibold uppercase tracking-[0.12em] text-[#008069]">
              Giáo viên RosyClass
            </p>
            <h2 className="max-w-[660px] text-[34px] font-medium leading-[1.1] tracking-tight text-[#111b21] md:text-[48px]">
              Người đồng hành quyết định chất lượng từng buổi học.
            </h2>
          </div>
          <Link
            href="/giao-vien"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-[#111b21] shadow-sm transition-colors hover:bg-[#25d366]"
          >
            Gặp gỡ đội ngũ
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {visibleTeachers.slice(0, 3).map((teacher) => (
            <article
              key={teacher.id}
              className="group overflow-hidden rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,27,33,0.05)]"
            >
              <div className="relative aspect-[4/4.6] overflow-hidden bg-[#f0f2f5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={teacher.avatar || "/hero_slider_2.png"}
                  alt={teacher.fullName}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-[13px] font-semibold text-[#008069]">
                  {teacher.specialties}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-[24px] font-semibold tracking-tight text-[#111b21]">
                  {teacher.fullName}
                </h3>
                <p className="mt-3 min-h-[72px] text-[15px] leading-relaxed text-[#54656f]">
                  {teacher.bio}
                </p>
                <div className="mt-5 grid gap-3 border-t border-[#e9edef] pt-5 text-[14px] text-[#54656f]">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#25d366]" />
                    <span>{teacher.certificates || "Chứng chỉ giảng dạy quốc tế"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-[#25d366]" />
                    <span>Lớp nhỏ, sửa lỗi trực tiếp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-[#25d366]" />
                    <span>Theo sát mục tiêu từng học viên</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
