import { PublicNavbar } from "@/components/navigation/public-navbar"
import { getSiteSettings } from "@/lib/get-site-settings"
import { PublicFooter } from "./components/PublicFooter"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const s = await getSiteSettings()

  return (
    <div className="theme-client flex flex-col min-h-screen font-sans bg-background relative">
      <PublicNavbar siteName={s.siteName} logoUrl={s.logoUrl} />
      
      <main className="flex-1 pt-[80px]">{children}</main>

      <PublicFooter settings={s} />
    </div>
  )
}
