"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, BookOpen, Calendar } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { EmptyState, PageHero, RosyMascot, toneAt, toneClasses } from "@/components/kids"

export interface BlogCardData {
  id: string
  slug: string
  title: string
  excerpt: string | null
  thumbnail: string | null
  publishedAt: Date | string | null
  createdAt: Date | string
}

export default function BlogClient({ posts }: { posts: BlogCardData[] }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex min-h-screen w-full flex-col pb-24">
      <PageHero
        tone="mint"
        eyebrow="Kiến thức bổ ích"
        eyebrowIcon={<BookOpen className="h-4 w-4" aria-hidden="true" />}
        title="Góc học tập RosyClass"
        highlight="Góc học tập"
        description="Mẹo hay, trò chơi và kinh nghiệm giúp ba mẹ cùng bé học tiếng Anh vui vẻ mỗi ngày, từ mầm non đến tiểu học."
      />

      <section className="pt-10 md:pt-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
          {posts.length === 0 ? (
            <EmptyState title="Chưa có bài viết nào được xuất bản." mood="think" />
          ) : (
            <div className="grid gap-10 md:grid-cols-2">
              {posts.map((post, idx) => {
                const tone = toneAt(idx + 2)
                const href = `/goc-hoc-tap/${post.slug}`
                return (
                  <motion.article
                    initial={reduceMotion ? false : { opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ type: "spring", stiffness: 160, damping: 18, delay: (idx % 2) * 0.08 }}
                    key={post.id}
                  >
                    <div className="kid-border kid-shadow kid-pop group relative flex h-full flex-col gap-5 rounded-kid-lg bg-white p-5 sm:flex-row md:flex-col lg:flex-row">
                      <div
                        className={cn(
                          "kid-border relative aspect-[4/3] shrink-0 overflow-hidden rounded-kid sm:w-2/5 md:w-full lg:w-2/5",
                          toneClasses[tone].soft,
                          idx % 2 === 0 ? "-rotate-2" : "rotate-2"
                        )}
                      >
                        {post.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-[13px] text-kid-ink-soft">
                            <RosyMascot mood="happy" className="h-16 w-16" />
                            Chưa có ảnh bài viết trong CMS
                          </div>
                        )}
                        <span className="kid-border-2 absolute top-3 left-3 rounded-full bg-kid-sun px-3 py-0.5 font-kid-display text-[13px] font-bold text-kid-ink">
                          Tin tức
                        </span>
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
                        <div className="mb-3 flex items-center text-[14px] font-semibold text-kid-ink-soft">
                          <Calendar className="mr-1.5 h-4 w-4" aria-hidden="true" />
                          {format(new Date(post.publishedAt || post.createdAt), "dd MMM, yyyy", { locale: vi })}
                        </div>
                        <h2 className="mb-3 text-[22px] leading-snug font-extrabold text-kid-ink">
                          {/* Link phủ cả thẻ để bấm ở đâu cũng mở bài */}
                          <Link href={href} className="kid-focus rounded-md after:absolute after:inset-0 after:rounded-kid-lg after:content-['']">
                            {post.title}
                          </Link>
                        </h2>
                        {post.excerpt ? (
                          <p className="mb-4 line-clamp-2 text-[15px] leading-relaxed text-kid-ink-soft">{post.excerpt}</p>
                        ) : null}
                        <span
                          aria-hidden="true"
                          className="mt-auto inline-flex items-center gap-1.5 self-start font-kid-display text-[16px] font-bold text-kid-ink underline decoration-kid-sun decoration-[3px] underline-offset-4 group-hover:decoration-kid-rose"
                        >
                          Đọc tiếp
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
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
