"use client"

import { motion, useReducedMotion } from "motion/react"
import { ArrowRight, BookOpen, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { courseLevelLabel } from "@/lib/course-levels"
import { EmptyState, KidButton, PageHero, inkTextOn, toneAt, toneClasses } from "@/components/kids"

// Nghiêng nhẹ xen kẽ cho cảm giác "dán sticker"
const tilts = ["md:-rotate-1", "md:rotate-1", "md:rotate-[0.5deg]", "md:-rotate-[0.5deg]"]

export interface CourseCardData {
  id: string
  slug: string
  name: string
  level: string
  description: string | null
  targetAudience: string | null
  learningOutcomes: string | null
}

export default function CoursesClient({ courses }: { courses: CourseCardData[] }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHero
        tone="sky"
        eyebrow="Chương trình đào tạo"
        eyebrowIcon={<BookOpen className="h-4 w-4" aria-hidden="true" />}
        title="Chương trình học cho bé"
        highlight="cho bé"
        description="Mỗi bé có một điểm xuất phát và nhịp học riêng. RosyClass có các chương trình tiếng Anh cho bé từ mầm non (3–5 tuổi) đến tiểu học (lớp 1–5) — ba mẹ cùng khám phá chương trình phù hợp với con nhé."
      />

      <section className="pt-10 pb-24 md:pt-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
          {courses.length === 0 ? (
            <EmptyState
              title="Các khóa học đang được cập nhật"
              description="Ba mẹ liên hệ RosyClass để được tư vấn lộ trình phù hợp cho bé."
              action={
                <KidButton href="/lien-he" tone="rose" className="text-kid-ink">
                  Liên hệ tư vấn
                </KidButton>
              }
            />
          ) : (
            <div className="grid gap-8 md:grid-cols-2 md:gap-10">
              {courses.map((course, idx) => {
                const tone = toneAt(idx)
                const features: string[] = course.learningOutcomes
                  ? course.learningOutcomes.split("\n").filter((f) => f.trim() !== "")
                  : []

                return (
                  <motion.article
                    initial={reduceMotion ? false : { opacity: 0, y: 30, rotate: idx % 2 ? 2 : -2 }}
                    whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ type: "spring", stiffness: 160, damping: 18, delay: (idx % 2) * 0.08 }}
                    key={course.id}
                    className={cn("h-full", tilts[idx % tilts.length])}
                  >
                    <div className="kid-border kid-shadow kid-pop group flex h-full flex-col overflow-hidden rounded-kid-lg bg-white">
                      <div className={cn("relative overflow-hidden border-b-[3px] border-kid-ink p-7 md:p-8", toneClasses[tone].soft)}>
                        <div aria-hidden="true" className="kid-dots absolute inset-0 opacity-60" />
                        <span
                          aria-hidden="true"
                          className={cn(
                            "kid-border absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-90",
                            toneClasses[toneAt(idx + 2)].solid
                          )}
                        />
                        <div className="relative">
                          <span className="kid-border-2 mb-4 inline-flex rounded-full bg-white px-3.5 py-1 font-kid-display text-[14px] font-bold text-kid-ink">
                            {course.targetAudience || courseLevelLabel(course.level)}
                          </span>
                          <h2 className="pr-10 text-[28px] leading-tight font-extrabold text-kid-ink md:text-[32px]">{course.name}</h2>
                        </div>
                      </div>

                      <div className="flex flex-grow flex-col p-7 md:p-8">
                        {course.description ? (
                          <p className="mb-6 text-[16px] leading-relaxed text-kid-ink-soft">{course.description}</p>
                        ) : null}

                        {features.length > 0 ? (
                          <ul className="mb-8 space-y-3">
                            {features.map((feat, i) => (
                              <li key={i} className="flex items-start gap-3 text-[16px] font-semibold text-kid-ink">
                                <span
                                  aria-hidden="true"
                                  className={cn(
                                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-kid-ink",
                                    toneClasses[tone].solid
                                  )}
                                >
                                  <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                                </span>
                                <span className="leading-snug">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}

                        <KidButton href={`/khoa-hoc/${course.slug}`} tone={tone} size="lg" className={cn("mt-auto w-full", inkTextOn(tone))}>
                          Xem chi tiết
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </KidButton>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
