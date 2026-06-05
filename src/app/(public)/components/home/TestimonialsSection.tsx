import Image from "next/image"
import { SiteSettings } from "@/lib/site-settings"

export function TestimonialsSection({ settings }: { settings?: SiteSettings }) {
  const testimonialsTitle = settings?.testimonialsTitle || "Học viên nói gì về chúng tôi?"
  const testimonials = settings?.testimonials || []

  if (testimonials.length === 0) return null;

  return (
    <section className="reveal-section py-24 px-4 bg-white">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[32px] md:text-[48px] font-medium text-[#1c1e21] tracking-tight">{testimonialsTitle}</h2>
        </div>
        <div className="space-y-6 flex flex-col items-center">
          {testimonials.map((review, index) => {
            const isRight = index % 2 !== 0;

            if (isRight) {
              return (
                <div key={index} className="w-full max-w-[600px] self-end flex justify-end gap-3">
                  <div className="bg-[#d9fdd3] rounded-[16px] rounded-tr-sm p-4 relative text-[#111b21] shadow-sm">
                    <p className="font-medium text-[#027eb5] text-[14px] mb-1">{review.name}</p>
                    <p className="text-[16px] leading-relaxed">{review.content}</p>
                    <div className="flex justify-end items-center gap-1 mt-1">
                      <span className="text-[11px] text-[#54656f]">{review.time}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#53bdeb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={index} className="w-full max-w-[600px] self-start flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative shrink-0 mt-2">
                  {review.avatar ? (
                    <Image src={review.avatar} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                  )}
                </div>
                <div className="bg-[#f0f2f5] rounded-[16px] rounded-tl-sm p-4 relative text-[#111b21] shadow-sm">
                  <p className="font-medium text-[#027eb5] text-[14px] mb-1">{review.name}</p>
                  <p className="text-[16px] leading-relaxed">{review.content}</p>
                  <div className="flex justify-end items-center mt-1">
                    <span className="text-[11px] text-[#54656f]">{review.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}
