import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { absoluteUrl, JsonLd } from "@/lib/seo"
import BlogClient from "./blog-client"
import { DesignedPage, designedPageMetadata } from "@/components/page-builder/designed-page"

export async function generateMetadata(): Promise<Metadata> {
  return designedPageMetadata("goc-hoc-tap", {
    title: "Góc học tập",
    description: "Bài viết, kinh nghiệm và mẹo giúp ba mẹ đồng hành cùng bé học tiếng Anh tại nhà — dành cho trẻ mầm non và tiểu học — từ RosyClass.",
    path: "/goc-hoc-tap",
  })
}

async function BlogPageContent() {
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

// Trang thiết kế lại được trong CMS (page builder); phần trên là nội dung chính của trang
export default function BlogPage() {
  return (
    <DesignedPage slug="goc-hoc-tap">
      <BlogPageContent />
    </DesignedPage>
  )
}
