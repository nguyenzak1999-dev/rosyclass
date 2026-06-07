import { PublicNavbar } from "@/components/navigation/public-navbar"
import { getSiteSettings } from "@/lib/get-site-settings"
import { absoluteUrl, getSiteUrl, JsonLd } from "@/lib/seo"
import { PublicFooter } from "./components/PublicFooter"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const s = await getSiteSettings()
  const siteUrl = getSiteUrl()
  const sameAs = [s.facebook, s.youtube, s.zalo, s.tiktok].filter(Boolean)

  return (
    <div className="theme-client flex flex-col min-h-screen font-sans bg-background relative">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "@id": `${siteUrl}/#organization`,
          name: s.siteName,
          url: siteUrl,
          logo: absoluteUrl(s.logoUrl || s.faviconUrl || "/english-center-hero.png"),
          image: absoluteUrl(s.ogImage || s.heroImageUrl || "/english-center-hero.png"),
          description: s.seoDescription,
          telephone: s.phone,
          email: s.email,
          address: s.address,
          openingHours: s.workingHours,
          sameAs,
        }}
      />
      <PublicNavbar siteName={s.siteName} logoUrl={s.logoUrl} />
      
      <main className="flex-1 pt-[80px]">{children}</main>

      <PublicFooter settings={s} />
    </div>
  )
}
