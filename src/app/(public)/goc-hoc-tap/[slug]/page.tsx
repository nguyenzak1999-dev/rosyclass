import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar, ChevronLeft } from "lucide-react"
import Link from "next/link"

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true }
  })
  return posts.map((p) => ({ slug: p.slug }))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const post = await prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" }
  })

  if (!post) notFound()

  return (
    <div className="flex flex-col w-full min-h-screen pb-20">
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
            className="prose prose-lg max-w-none text-midnight-ink"
            style={{ lineHeight: '1.8' }}
          >
            {post.content.split('\n').map((line, i) => (
              <p key={i} className="mb-4 text-[16px] text-stone leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
