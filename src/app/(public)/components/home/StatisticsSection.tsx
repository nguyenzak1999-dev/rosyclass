import { SiteSettings } from "@/lib/site-settings"

export function StatisticsSection({ settings }: { settings?: SiteSettings }) {
  const statistics = settings?.statistics || []

  if (statistics.length === 0) return null;

  return (
    <section className="reveal-section py-16 border-y border-gray-100 bg-white">
      <div className="max-w-[1000px] mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {statistics.map((stat, index) => (
            <div key={index} className="space-y-2">
              <h3 className="text-[40px] md:text-[56px] font-medium text-[#25d366]">{stat.number}</h3>
              <p className="text-[16px] text-[#54656f]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
