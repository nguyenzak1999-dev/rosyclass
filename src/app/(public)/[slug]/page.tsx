import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PageBlocks } from "@/components/page-builder/block-renderer"
import { getSiteSettings } from "@/lib/get-site-settings"
import { getPublishedCustomPage, loadDataForBlocks } from "@/lib/page-builder/pages"
import { createPageMetadata } from "@/lib/seo"

export const revalidate = 300

type CustomPageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: CustomPageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getPublishedCustomPage(slug)

  if (!page) {
    return {
      title: "Không tìm thấy trang",
      robots: { index: false, follow: false },
    }
  }

  const site = await getSiteSettings()
  return createPageMetadata({
    title: page.seoTitle || page.title,
    description: page.seoDescription || site.seoDescription,
    path: `/${page.slug}`,
    site,
  })
}

export default async function CustomPage({ params }: CustomPageProps) {
  const { slug } = await params
  const page = await getPublishedCustomPage(slug)
  if (!page) notFound()

  const data = await loadDataForBlocks(page.blocks)

  return <PageBlocks blocks={page.blocks} data={data} className="pb-10" />
}
