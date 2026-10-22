import type { Metadata } from "next"
import { type SiteSettings } from "@/lib/site-settings"

export const DEFAULT_SITE_URL = "https://rosyclass.edu.vn"

export function getSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || DEFAULT_SITE_URL
  const withProtocol = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`

  return withProtocol.replace(/\/+$/, "")
}

export function absoluteUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return getSiteUrl()

  try {
    return new URL(pathOrUrl).toString()
  } catch {
    const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`
    return `${getSiteUrl()}${path}`
  }
}

export function trimSeoText(value: string | null | undefined, maxLength: number) {
  const normalized = (value || "").replace(/\s+/g, " ").trim()

  if (normalized.length <= maxLength) return normalized

  return `${normalized.slice(0, maxLength - 1).trim()}…`
}

export function createPageMetadata({
  title,
  description,
  path,
  image,
  site,
  type = "website",
  publishedTime,
  modifiedTime,
}: {
  title: string
  description: string
  path: string
  image?: string | null
  site?: SiteSettings
  type?: "website" | "article"
  publishedTime?: string
  modifiedTime?: string
}): Metadata {
  const url = absoluteUrl(path)
  const siteName = site?.siteName || "RosyClass"
  const seoTitle = trimSeoText(title, 70)
  const seoDescription = trimSeoText(description, 160)
  const imageUrl = image || site?.ogImage || site?.heroImageUrl || "/demo/og-rosyclass.png"
  const ogImage = absoluteUrl(imageUrl)

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      locale: "vi_VN",
      url,
      siteName,
      title: seoTitle,
      description: seoDescription,
      images: [{ url: ogImage, width: 1200, height: 630, alt: seoTitle }],
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [ogImage],
    },
  }
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
