import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { getSiteSettings } from "@/lib/get-site-settings"
import { StyleProvider } from "@/components/style-provider"

const inter = Inter({ subsets: ["latin"] })

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()

  return {
    title: {
      default: s.seoTitle || s.siteName,
      template: `%s | ${s.siteName}`,
    },
    description: s.seoDescription,
    icons: {
      icon: s.faviconUrl || "/favicon.ico",
      apple: s.faviconUrl || "/apple-touch-icon.png",
    },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: s.siteName,
      title: s.seoTitle || s.siteName,
      description: s.seoDescription,
      images: s.ogImage
        ? [{ url: s.ogImage, width: 1200, height: 630, alt: s.siteName }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: s.seoTitle || s.siteName,
      description: s.seoDescription,
      images: s.ogImage ? [s.ogImage] : [],
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
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
