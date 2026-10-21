import { prisma } from "@/lib/prisma"
import { absoluteUrl, createPageMetadata, JsonLd, trimSeoText } from "@/lib/seo"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { cache } from "react"
import { formatBlogContent, stripBlogHtml } from "@/lib/blog-content"
import { KidButton, Sparkle, Star, WaveDivider } from "@/components/kids"

const getPublishedPost = cache(async (slug: string) => {
  return prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
  })
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPost(slug)

  if (!post) {
    return {
      title: "Không tìm thấy bài viết",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  return createPageMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || trimSeoText(stripBlogHtml(post.content), 155),
    path: `/goc-hoc-tap/${post.slug}`,
    image: post.thumbnail,
    type: "article",
    publishedTime: (post.publishedAt || post.createdAt).toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
  })
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const post = await getPublishedPost(slug)

  if (!post) notFound()

  return (
    <div className="flex min-h-screen w-full flex-col pb-20">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt || trimSeoText(stripBlogHtml(post.content), 155),
          image: post.thumbnail ? [absoluteUrl(post.thumbnail)] : undefined,
          datePublished: (post.publishedAt || post.createdAt).toISOString(),
          dateModified: post.updatedAt.toISOString(),
          inLanguage: "vi-VN",
          mainEntityOfPage: absoluteUrl(`/goc-hoc-tap/${post.slug}`),
          publisher: {
            "@type": "EducationalOrganization",
            name: "RosyClass",
            url: absoluteUrl("/"),
          },
        }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-kid-sky-soft">
        <div aria-hidden="true" className="kid-dots pointer-events-none absolute inset-0 opacity-70" />
        <Star className="kid-float pointer-events-none absolute top-8 left-[6%] hidden h-10 w-10 rotate-12 sm:block" />
        <Sparkle className="kid-spin-slow pointer-events-none absolute top-12 right-[8%] h-7 w-7 fill-kid-rose" />
        <div className={`kid-rise relative mx-auto max-w-[860px] px-4 pt-10 text-center sm:px-8 md:pt-14 ${post.thumbnail ? "pb-28 md:pb-36" : "pb-20 md:pb-24"}`}>
          <Link
            href="/goc-hoc-tap"
            className="kid-pop kid-border-2 kid-focus mb-8 inline-flex items-center rounded-full bg-white px-4 py-1.5 font-kid-display text-[15px] font-bold text-kid-ink shadow-[0_3px_0_0_var(--color-kid-ink)]"
          >
            <ChevronLeft className="mr-1 h-4 w-4" strokeWidth={3} aria-hidden="true" /> Quay lại Góc học tập
          </Link>
          <h1 className="mb-6 text-[32px] leading-[1.12] font-extrabold break-words text-kid-ink md:text-[50px]">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-[15px] text-kid-ink-soft">
            <span className="kid-border-2 inline-flex items-center rounded-full bg-kid-sun-soft px-3 py-1 font-semibold text-kid-ink">
              <Calendar className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {format(new Date(post.publishedAt || post.createdAt), "dd MMMM, yyyy", { locale: vi })}
            </span>
          </div>
        </div>
        <WaveDivider className="absolute inset-x-0 -bottom-px text-kid-cream" />
      </section>

      {/* Thumbnail */}
      {post.thumbnail && (
        <div className="relative z-10 mx-auto -mt-20 mb-6 w-full max-w-[920px] px-4 sm:px-8 md:-mt-28">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.thumbnail}
            alt={post.title}
            className="kid-border kid-shadow-lg h-[240px] w-full -rotate-1 rounded-kid-lg object-cover sm:h-[340px] md:h-[420px]"
          />
        </div>
      )}

      {/* Content */}
      <section className="py-8">
        <div className="mx-auto max-w-[820px] px-4 sm:px-8">
          {post.excerpt && (
            <p className="kid-border kid-shadow-sm relative mb-10 rounded-kid bg-kid-sun-soft p-6 font-kid-display text-[19px] leading-relaxed font-semibold text-kid-ink md:text-[21px]">
              <Sparkle className="absolute -top-3 -left-3 h-7 w-7 fill-kid-rose" />
              {post.excerpt}
            </p>
          )}
          <article className="kid-border kid-shadow rounded-kid-lg bg-white px-5 py-8 sm:px-8 md:px-12 md:py-12">
            <div
              className="kid-prose"
              dangerouslySetInnerHTML={{ __html: formatBlogContent(post.content) }}
            />
          </article>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <KidButton href="/goc-hoc-tap" tone="white">
              <ChevronLeft className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
              Quay lại Góc học tập
            </KidButton>
            <KidButton href="/kiem-tra-trinh-do" tone="sun">
              Kiểm tra trình độ
            </KidButton>
          </div>
        </div>
      </section>
    </div>
  )
}
