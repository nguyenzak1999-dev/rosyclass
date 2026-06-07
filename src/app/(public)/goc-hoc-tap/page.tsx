import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { absoluteUrl, createPageMetadata, JsonLd } from "@/lib/seo"
import BlogClient from "./blog-client"

export const metadata: Metadata = createPageMetadata({
  title: "Góc học tập",
  description: "Bài viết, kinh nghiệm học tiếng Anh, mẹo luyện giao tiếp và định hướng lộ trình học từ RosyClass.",
  path: "/goc-hoc-tap",
})

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED"
    },
    orderBy: {
      publishedAt: "desc"
    }
  })

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Góc học tập RosyClass",
          url: absoluteUrl("/goc-hoc-tap"),
          blogPost: posts.map((post) => ({
            "@type": "BlogPosting",
            headline: post.title,
            url: absoluteUrl(`/goc-hoc-tap/${post.slug}`),
            datePublished: (post.publishedAt || post.createdAt).toISOString(),
            dateModified: post.updatedAt.toISOString(),
          })),
        }}
      />
      <BlogClient posts={posts} />
    </>
  )
}
