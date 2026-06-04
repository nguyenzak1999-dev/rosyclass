import { prisma } from "@/lib/prisma"
import BlogClient from "./blog-client"

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED"
    },
    orderBy: {
      publishedAt: "desc"
    }
  })

  return <BlogClient posts={posts} />
}
