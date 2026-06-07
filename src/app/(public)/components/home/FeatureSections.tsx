import Link from "next/link"
import Image from "next/image"
import { SiteSettings } from "@/lib/site-settings"

export function FeatureSections({ settings }: { settings?: SiteSettings }) {
  const features = settings?.features || []

  return (
    <div className="space-y-[160px] py-[80px]">
      {features.map((feature, index) => {
        const isReverse = index % 2 !== 0;
        return (
          <section key={index} className={`reveal-section max-w-[1200px] mx-auto px-4 flex flex-col ${isReverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center justify-between gap-12 md:gap-20`}>
            <div className="w-full md:w-[45%] aspect-[4/3] rounded-[32px] overflow-hidden relative border-0">
              <Image src={feature.image || "/hero_slider_2.png"} alt={feature.title} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
            </div>
            <div className="w-full md:w-[45%] space-y-6">
              <h2 className="text-[32px] md:text-[48px] font-medium text-[#1c1e21] leading-[1.1] tracking-tight">
                {feature.title}
              </h2>
              <p className="text-[18px] text-[#1c1e21] font-normal leading-[1.4]">
                {feature.description}
              </p>
              {feature.buttonText && feature.buttonLink && (
                <Link href={feature.buttonLink} className="group inline-flex items-center gap-3 mt-4">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#e9edef] bg-transparent text-[#111b21] group-hover:border-[#25d366] group-hover:bg-[#25d366] group-hover:text-white transition-all duration-300">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </span>
                  <span className="font-semibold text-[#111b21] text-[18px] group-hover:text-[#25d366] transition-colors">{feature.buttonText}</span>
                </Link>
              )}
            </div>
          </section>
        );
      })}
    </div>
  )
}
