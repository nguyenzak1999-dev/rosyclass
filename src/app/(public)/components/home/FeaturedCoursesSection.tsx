import { AnimatedButton } from "@/components/ui/animated-button"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle } from "lucide-react"
import { SiteSettings } from "@/lib/site-settings"

const styleMap = [
  { badge: "text-[#25d366] bg-[#d9fdd3]", accent: "#25d366" },
  { badge: "text-[#027eb5] bg-[#e2f5fd]", accent: "#027eb5" },
  { badge: "text-[#8b5cf6] bg-[#ede9fe]", accent: "#8b5cf6" },
]

type FeaturedCourse = {
  id: string
  name: string
  slug: string
  description?: string | null
  thumbnail?: string | null
  level?: string
  targetAudience?: string | null
  learningOutcomes?: string | null
}

export function FeaturedCoursesSection({ 
  featuredCourses,
  settings
}: { 
  featuredCourses: FeaturedCourse[]
  settings?: SiteSettings 
}) {
  return (
    <section className="reveal-section py-24 bg-[#fcf5eb]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-20 space-y-6">
          <h2 className="text-[32px] md:text-[48px] font-medium text-[#1c1e21] tracking-tight">
            {settings?.featuredCoursesTitle || "Khóa học nổi bật"}
          </h2>
          <p className="text-[18px] md:text-[20px] text-[#54656f] max-w-[640px] mx-auto leading-relaxed">
            {settings?.featuredCoursesSubtitle || "Khám phá các lộ trình học được thiết kế riêng biệt để giúp bạn đạt được mục tiêu ngôn ngữ của mình một cách tự nhiên nhất."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {featuredCourses && featuredCourses.length > 0 ? featuredCourses.map((course, idx) => {
            const style = styleMap[idx % styleMap.length]
            const outcomes = course.learningOutcomes
              ? course.learningOutcomes.split('\n').filter(f => f.trim() !== '').slice(0, 3)
              : []
            const label = course.targetAudience || course.level || ""

            return (
              <Link href={`/khoa-hoc/${course.slug}`} key={course.id} className="group block h-full">
                <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_8px_24px_rgba(17,27,33,0.04)] hover:shadow-[0_24px_48px_rgba(17,27,33,0.12)] hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                  {/* Thumbnail */}
                  <div className="aspect-[4/3] bg-[#f0f2f5] relative overflow-hidden">
                    <Image
                      src={course.thumbnail || "/hero_slider_2.png"}
                      alt={course.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    {/* Level badge over image */}
                    {label && (
                      <span className={`absolute top-4 left-4 inline-block px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider ${style.badge}`}>
                        {label}
                      </span>
                    )}
                  </div>

                  <div className="p-8 md:p-10 flex flex-col flex-grow">
                    <h3 className="text-[24px] font-bold text-[#111b21] mb-3 leading-tight group-hover:text-[#008069] transition-colors">
                      {course.name}
                    </h3>

                    <p className="text-[16px] text-[#54656f] leading-relaxed mb-6 line-clamp-2">
                      {course.description || "Chương trình đào tạo chuẩn quốc tế giúp học viên tự tin giao tiếp."}
                    </p>

                    {/* Learning outcomes */}
                    {outcomes.length > 0 && (
                      <div className="space-y-2 mb-8">
                        {outcomes.map((feat, i) => (
                          <div key={i} className="flex items-start text-[#111b21] text-[14px]">
                            <CheckCircle className="w-4 h-4 mr-2 text-[#25d366] shrink-0 mt-0.5" />
                            <span className="leading-snug">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#fcf5eb] text-[#111b21] group-hover:bg-[#25d366] group-hover:text-white transition-all duration-300">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </span>
                        <span className="font-semibold text-[#111b21] group-hover:text-[#25d366] transition-colors">Tìm hiểu thêm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          }) : (
            // Fallback nếu chưa có khóa học nào published
            [1, 2, 3].map(i => (
              <Link href={`/khoa-hoc`} key={i} className="group block h-full">
                <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_8px_24px_rgba(17,27,33,0.04)] hover:shadow-[0_24px_48px_rgba(17,27,33,0.12)] hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                  <div className="aspect-[4/3] bg-[#f0f2f5] relative overflow-hidden">
                    <Image src={`/hero_slider_${i === 1 ? '2' : i === 2 ? '3' : '2'}.png`} alt="Course" fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  </div>
                  <div className="p-8 md:p-10 flex flex-col flex-grow">
                    <h3 className="text-[24px] font-bold text-[#111b21] mb-4 leading-tight group-hover:text-[#008069] transition-colors">
                      Giao tiếp Toàn diện {i}
                    </h3>
                    <p className="text-[17px] text-[#54656f] leading-relaxed mb-8 flex-grow">
                      Khóa học rèn luyện phản xạ nghe nói tự nhiên, áp dụng ngay vào môi trường học tập và làm việc.
                    </p>
                    <div className="mt-auto">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#fcf5eb] text-[#111b21] group-hover:bg-[#25d366] group-hover:text-white transition-all duration-300">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </span>
                        <span className="font-semibold text-[#111b21] group-hover:text-[#25d366] transition-colors">Tìm hiểu thêm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="mt-16 flex justify-center text-center">
          <AnimatedButton href="/khoa-hoc" variant="primary" size="default">
            Xem tất cả khóa học
          </AnimatedButton>
        </div>
      </div>
    </section>
  )
}
