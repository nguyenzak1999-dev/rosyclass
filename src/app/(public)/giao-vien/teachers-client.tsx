"use client"

import { useRef } from "react"
import { Users, Star as StarIcon, Award, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"
import { EmptyState, KidButton, PageHero, RosyMascot, toneAt, toneClasses } from "@/components/kids"

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Ảnh giáo viên như ảnh polaroid dán nghiêng
const tilts = ["-rotate-2", "rotate-2", "-rotate-1", "rotate-1"]

export interface TeacherCardData {
  id: string
  fullName: string
  avatar: string | null
  bio: string
  specialties: string
  certificates: string
}

export default function TeachersClient({ teachers }: { teachers: TeacherCardData[] }) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".teacher-card", {
        opacity: 0,
        y: 50,
        scale: 0.9,
        stagger: 0.1,
        duration: 0.7,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".teachers-grid",
          start: "top 85%",
        },
        clearProps: "all",
      })
    })
    return () => mm.revert()
  }, { scope: container })

  return (
    <div ref={container} className="flex min-h-screen w-full flex-col pb-24">
      <PageHero
        tone="grape"
        eyebrow="Đội ngũ giảng viên"
        eyebrowIcon={<Users className="h-4 w-4" aria-hidden="true" />}
        title="Giáo viên bản ngữ xuất sắc"
        highlight="xuất sắc"
        description="Tự hào sở hữu 100% đội ngũ giáo viên bản ngữ có bằng cấp quốc tế, tâm huyết và giàu kinh nghiệm giảng dạy tại Việt Nam."
      />

      <section className="pt-10 md:pt-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
          {teachers.length === 0 ? (
            <EmptyState title="Đội ngũ giáo viên đang được cập nhật" />
          ) : (
            <div className="teachers-grid grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {teachers.map((teacher, idx) => {
                const tone = toneAt(idx)
                const certifications: string[] = teacher.certificates
                  ? teacher.certificates.split(",").map((c: string) => c.trim())
                  : []

                return (
                  <article key={teacher.id} className="teacher-card">
                    <div className="kid-border kid-shadow kid-pop group flex h-full flex-col rounded-kid bg-white p-4">
                      <div className={cn("relative", tilts[idx % tilts.length])}>
                        <span
                          aria-hidden="true"
                          className="absolute -top-3 left-1/2 z-10 h-6 w-16 -translate-x-1/2 -rotate-3 rounded-md border-2 border-kid-ink/30 bg-kid-sun-soft/90"
                        />
                        <div className={cn("kid-border relative aspect-[4/5] overflow-hidden rounded-[20px]", toneClasses[tone].soft)}>
                          {teacher.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={teacher.avatar}
                              alt={teacher.fullName}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-3 px-5 text-center text-[14px] text-kid-ink-soft">
                              <RosyMascot mood="happy" className="h-20 w-20" />
                              Chưa có ảnh giáo viên trong CMS
                            </div>
                          )}
                          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            <p className="kid-border-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[13px] font-bold text-kid-ink">
                              <Heart className="h-4 w-4 fill-kid-rose text-kid-rose" aria-hidden="true" /> Yêu thương học viên
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col px-2 pt-5 pb-2">
                        <h2 className="text-[22px] leading-tight font-extrabold text-kid-ink">{teacher.fullName}</h2>
                        <p className={cn("kid-border-2 mt-2 inline-flex self-start rounded-full px-3 py-0.5 text-[14px] font-bold text-kid-ink", toneClasses[tone].soft)}>
                          {teacher.specialties || "Teacher"}
                        </p>

                        <div className="mt-4 space-y-3 border-t-[3px] border-dashed border-kid-ink/15 pt-4">
                          <div className="flex items-start gap-2">
                            <StarIcon className="mt-0.5 h-4 w-4 shrink-0 fill-kid-sun text-kid-ink" aria-hidden="true" />
                            <span className="text-[14px] leading-snug text-kid-ink-soft">{teacher.bio || "Nhiều năm kinh nghiệm"}</span>
                          </div>
                          {certifications.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Award className="mt-0.5 h-4 w-4 shrink-0 text-kid-ink" aria-hidden="true" />
                              <span className="text-[14px] leading-snug text-kid-ink-soft">{certifications.join(" • ")}</span>
                            </div>
                          )}
                        </div>

                        <Link
                          href={`/giao-vien/${teacher.id}`}
                          className="kid-focus mt-5 inline-flex items-center gap-1.5 self-start rounded-full font-kid-display text-[16px] font-bold text-kid-ink underline decoration-kid-sun decoration-[3px] underline-offset-4 hover:decoration-kid-rose"
                        >
                          Xem hồ sơ
                          <span className="sr-only"> {teacher.fullName}</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-16 flex justify-center">
            <KidButton href="/dang-ky" tone="rose" size="lg" className="text-kid-ink">
              Đăng ký học thử
            </KidButton>
          </div>
        </div>
      </section>
    </div>
  )
}
