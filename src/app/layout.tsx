import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { getSiteSettings } from "@/lib/get-site-settings"
import { StyleProvider } from "@/components/style-provider"
import { FontResourceHints } from "@/components/font-resource-hints"
import { absoluteUrl, getSiteUrl, JsonLd } from "@/lib/seo"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  const siteUrl = getSiteUrl()
  const title = s.seoTitle || s.siteName
  const description = s.seoDescription
  const ogImage = absoluteUrl(s.ogImage || s.heroImageUrl || "/demo/og-rosyclass.png")

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${s.siteName}`,
    },
    description,
    applicationName: s.siteName,
    authors: [{ name: s.siteName, url: siteUrl }],
    creator: s.siteName,
    publisher: s.siteName,
    category: "education",
    keywords: [
      "RosyClass",
      "trung tâm tiếng Anh",
      "học tiếng Anh",
      "tiếng Anh giao tiếp",
      "IELTS",
      "tiếng Anh trẻ em",
      "kiểm tra trình độ tiếng Anh",
    ],
    alternates: {
      canonical: siteUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: s.faviconUrl || "/favicon.ico",
      apple: s.faviconUrl || "/apple-touch-icon.png",
    },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: siteUrl,
      siteName: s.siteName,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteUrl = getSiteUrl()

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <FontResourceHints />
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "@id": `${siteUrl}/#organization`,
              name: "RosyClass",
              url: siteUrl,
              logo: absoluteUrl("/demo/og-rosyclass.png"),
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${siteUrl}/#website`,
              url: siteUrl,
              name: "RosyClass",
              inLanguage: "vi-VN",
              publisher: {
                "@id": `${siteUrl}/#organization`,
              },
            },
          ]}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <StyleProvider />
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
