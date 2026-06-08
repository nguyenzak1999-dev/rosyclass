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
    <div className="flex flex-col w-full min-h-screen pb-20">
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
      <section className="pt-24 pb-16 bg-sunset-gradient">
        <div className="max-w-[800px] px-4 sm:px-8 mx-auto text-center">
          <Link href="/goc-hoc-tap" className="inline-flex items-center text-stone hover:text-midnight-ink text-[14px] font-medium mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại Góc học tập
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-midnight-ink mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center text-stone text-[14px] gap-4">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5" />
              {format(new Date(post.publishedAt || post.createdAt), "dd MMMM, yyyy", { locale: vi })}
            </span>
          </div>
        </div>
      </section>

      {/* Thumbnail */}
      {post.thumbnail && (
        <div className="max-w-[900px] px-4 sm:px-8 mx-auto w-full -mt-8 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-[400px] object-cover rounded-[32px] shadow-xl"
          />
        </div>
      )}

      {/* Content */}
      <section className="py-8">
        <div className="max-w-[800px] px-4 sm:px-8 mx-auto">
          {post.excerpt && (
            <p className="text-[18px] text-stone leading-relaxed mb-10 p-6 bg-cloud-veil rounded-2xl border-l-4 border-signal-blue">
              {post.excerpt}
            </p>
          )}
          <div
            className="max-w-none text-midnight-ink [&_a]:font-medium [&_a]:text-signal-blue [&_a]:underline [&_blockquote]:my-6 [&_blockquote]:rounded-2xl [&_blockquote]:bg-cloud-veil [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:italic [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-stone [&_figure]:my-8 [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-2xl [&_h3]:font-semibold [&_img]:mx-auto [&_img]:max-h-[560px] [&_img]:rounded-[24px] [&_img]:object-cover [&_li]:my-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-5 [&_p]:text-[16px] [&_p]:leading-relaxed [&_p]:text-stone [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: formatBlogContent(post.content) }}
          />
        </div>
      </section>
    </div>
  )
}
