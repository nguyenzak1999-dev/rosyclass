import { PublicNavbar } from "@/components/navigation/public-navbar"
import { getSiteSettings } from "@/lib/get-site-settings"
import { getMenuPages } from "@/lib/page-builder/pages"
import { absoluteUrl, getSiteUrl, JsonLd } from "@/lib/seo"
import { PublicFooter } from "./components/PublicFooter"

// Trang công khai cache 1 ngày (Workers KV) để Worker không phải dựng lại trang và gọi D1 mỗi lượt xem;
// admin sửa nội dung thì làm mới ngay qua revalidatePublicSite(). Khu phụ huynh tự đặt force-dynamic.
export const revalidate = 86400

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [s, menuPages] = await Promise.all([getSiteSettings(), getMenuPages()])
  const siteUrl = getSiteUrl()
  const sameAs = [s.facebook, s.youtube, s.zalo, s.tiktok].filter(Boolean)

  return (
    <div className="theme-client relative flex min-h-screen flex-col overflow-x-clip bg-kid-cream font-kid-body text-kid-ink">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "@id": `${siteUrl}/#organization`,
          name: s.siteName,
          legalName: s.legalName || undefined,
          taxID: s.taxCode || undefined,
          url: siteUrl,
          logo: absoluteUrl(s.logoUrl || s.faviconUrl || "/demo/og-rosyclass.png"),
          image: absoluteUrl(s.ogImage || s.heroImageUrl || "/demo/og-rosyclass.png"),
          description: s.seoDescription,
          telephone: s.phone,
          email: s.email,
          address: s.address,
          openingHours: s.workingHours,
          sameAs,
        }}
      />
      <PublicNavbar siteName={s.siteName} logoUrl={s.logoUrl} extraLinks={menuPages} />
      
      <main id="main-content" tabIndex={-1} className="flex-1 pt-[80px] focus:outline-none">
        {children}
      </main>

      <PublicFooter settings={s} />
    </div>
  )
}
