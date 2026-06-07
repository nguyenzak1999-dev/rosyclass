"use client"

import { type SiteSettings } from "@/lib/site-settings"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

export interface HeroSlide {
  id: string
  title: string | null
  subtitle: string | null
  image: string
  buttonText: string | null
  buttonUrl: string | null
}

export function HeroSection({ settings, slides = [] }: { settings?: SiteSettings; slides?: HeroSlide[] }) {
  const heroTitle = settings?.heroTitle?.trim() || "Giao tiếp"
  const heroHighlight = settings?.heroHighlight?.trim() || "tự tin"
  const heroDescription =
    settings?.heroDescription?.trim() ||
    "Phương pháp học đơn giản, đáng tin cậy, phản xạ tự nhiên, dành cho mọi học viên."
  const heroImageUrl = settings?.heroImageUrl?.trim() || "/english-center-hero.png"
  const secondaryText = settings?.heroButton2Text?.trim()
  const secondaryLink = settings?.heroButton2Link?.trim() || "/khoa-hoc"
  const footnote = settings?.heroFootnote?.trim() || "* Yêu cầu làm bài kiểm tra xếp lớp."
  const chatGroupTitle = settings?.heroChatGroupTitle?.trim() || "Lớp học giao tiếp"
  const chatGroupMeta = settings?.heroChatGroupMeta?.trim() || "& 4 others"
  const chatJoinText = settings?.heroChatJoinText?.trim() || "Tham gia"
  const chatIncomingMessage = settings?.heroChatIncomingMessage?.trim() || "Vẫn học lịch cũ đúng không bạn?"
  const chatIncomingTime = settings?.heroChatIncomingTime?.trim() || "11:53"
  const chatOutgoingAuthor = settings?.heroChatOutgoingAuthor?.trim() || "Cô Ngọc"
  const chatOutgoingMessage =
    settings?.heroChatOutgoingMessage?.trim() || "Sẵn sàng nhé! Hẹn gặp lại mọi người ở lớp. ✨"
  const chatOutgoingTime = settings?.heroChatOutgoingTime?.trim() || "11:59"
  const chatReactions = settings?.heroChatReactions?.trim() || "👍 ❤️ 🤓"
  const heroSlides = useMemo(
    () =>
      slides.length > 0
        ? slides
        : [
            {
              id: "fallback",
              title: `${heroTitle}\n${heroHighlight}`,
              subtitle: heroDescription,
              image: heroImageUrl,
              buttonText: settings?.heroButton1Text?.trim() || "Đăng ký học thử",
              buttonUrl: settings?.heroButton1Link?.trim() || "/dang-ky",
            },
          ],
    [heroDescription, heroHighlight, heroImageUrl, heroTitle, settings?.heroButton1Link, settings?.heroButton1Text, slides]
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const slideCount = heroSlides.length
  const currentSlide = heroSlides[currentIndex] || heroSlides[0]
  const slideTitle = currentSlide?.title?.trim() || `${heroTitle}\n${heroHighlight}`
  const slideDescription = currentSlide?.subtitle?.trim() || heroDescription
  const slideImage = currentSlide?.image?.trim() || heroImageUrl
  const primaryText = currentSlide?.buttonText?.trim() || settings?.heroButton1Text?.trim() || "Đăng ký học thử"
  const primaryLink = currentSlide?.buttonUrl?.trim() || settings?.heroButton1Link?.trim() || "/dang-ky"
  const titleLines = slideTitle.split("\n")

  const goToNext = () => setCurrentIndex((index) => (index + 1) % slideCount)
  const goToPrev = () => setCurrentIndex((index) => (index - 1 + slideCount) % slideCount)

  return (
    <div className="w-full bg-[#fcf5eb]">
      <section className="pt-[32px] md:pt-[40px] pb-10 px-4 md:px-12 mx-auto w-full">
        <div
          className="relative w-full rounded-[25px] overflow-hidden min-h-[600px] md:min-h-[700px] bg-[#111b21] flex items-center shadow-lg"
        >

          {/* Background Image */}
          <div className="absolute inset-0 z-0 bg-[#111b21]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slideImage}
              alt={slideTitle.replace(/\s+/g, " ")}
              className="h-full w-full object-cover"
              decoding="async"
              fetchPriority="high"
              loading="eager"
            />
            {/* Gradient overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent"></div>
          </div>

          <div className="relative z-10 w-full max-w-[1200px] mx-auto h-full flex flex-col md:flex-row items-center justify-between px-8 md:px-12 lg:px-4 py-12 md:py-20">
            <div className="w-full md:w-[50%] space-y-6 relative z-20">
              <h1 className="text-[50px] md:text-[80px] font-medium text-white leading-[1.1] tracking-tight">
                {titleLines.map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {line}
                    {index < titleLines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </h1>
              <p className="text-[18px] md:text-[22px] font-normal text-white/90 leading-[1.4] max-w-[480px]">
                {slideDescription}
              </p>
              <div className="pt-4 flex flex-col items-start gap-3">
                <Link
                  href={primaryLink}
                  className="inline-flex items-center justify-center rounded-[50px] bg-[#25d366] px-[24px] py-[10px] text-[15px] font-medium whitespace-nowrap text-[#111b21] shadow-sm"
                >
                  {primaryText}
                </Link>
                {secondaryText ? (
                  <Link
                    href={secondaryLink}
                    className="inline-flex items-center justify-center rounded-[50px] border-[1.5px] border-white/80 bg-transparent px-[24px] py-[10px] text-[15px] font-medium whitespace-nowrap text-white"
                  >
                    {secondaryText}
                  </Link>
                ) : null}
                {footnote ? <p className="text-[12px] text-white/70">{footnote}</p> : null}
              </div>
            </div>

            {/* Right Content (Floating Chat Bubbles) */}
            <div className="w-[50%] absolute right-0 top-0 bottom-0 pointer-events-none hidden lg:block z-10">

              {/* WhatsApp Group Bubble */}
              <div className="absolute" style={{ top: '15%', right: '15%', zIndex: 0 }}>
                <div className="bg-white rounded-[24px] p-3 pr-4 flex items-center justify-between shadow-xl border border-gray-100 text-[#111b21] min-w-[320px] w-max">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#e9edef] rounded-full flex items-center justify-center shrink-0 text-[#54656f]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div>
                      <p className="font-medium text-[15px] leading-tight">{chatGroupTitle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-400 border-[1.5px] border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-red-400 border-[1.5px] border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-yellow-400 border-[1.5px] border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-[#f0f2f5] border-[1.5px] border-white text-[10px] flex items-center justify-center font-medium text-[#54656f]">+4</div>
                        </div>
                        <span className="text-[12px] text-[#54656f]">{chatGroupMeta}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-3 bg-[#25d366] text-white rounded-full px-4 py-2 shrink-0 whitespace-nowrap font-medium text-[13px] inline-flex items-center justify-center leading-normal shadow-sm">
                    <span>{chatJoinText}</span>
                  </div>
                </div>
              </div>

              {/* Incoming Chat Bubble */}
              <div className="absolute" style={{ top: '35%', right: '35%', zIndex: 0 }}>
                <div className="bg-[#d9fdd3] rounded-[16px] rounded-tr-[4px] py-2 px-3 shadow-lg text-[#111b21] w-max max-w-[280px]">
                  <p className="text-[15px] leading-snug">{chatIncomingMessage}</p>
                  <div className="flex justify-end items-center gap-1 mt-0.5">
                    <span className="text-[11px] text-[#54656f]">{chatIncomingTime}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#53bdeb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
              </div>

              {/* Outgoing Chat Bubble with attached Reactions */}
              <div className="absolute" style={{ top: '55%', right: '15%', zIndex: 0 }}>
                <div className="relative bg-white rounded-[16px] rounded-tl-[4px] py-2 px-3 shadow-lg text-[#111b21] w-max max-w-[280px]">
                  <p className="font-normal text-[#027eb5] text-[13px] mb-0.5">{chatOutgoingAuthor}</p>
                  <p className="text-[15px] leading-snug">{chatOutgoingMessage}</p>
                  <div className="flex justify-end items-center mt-1">
                    <span className="text-[11px] text-[#54656f]">{chatOutgoingTime}</span>
                  </div>
                  
                  {/* Reactions */}
                  <div className="absolute -bottom-3 right-4 z-10">
                    <div className="flex gap-1 bg-white shadow-sm rounded-full px-1.5 py-0.5 border border-gray-100">
                      {chatReactions.split(/\s+/).filter(Boolean).map((reaction) => (
                        <span className="text-[12px]" key={reaction}>{reaction}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {heroSlides.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goToPrev}
                className="absolute left-4 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur md:flex"
                aria-label="Slide trước"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-4 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur md:flex"
                aria-label="Slide sau"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
                {heroSlides.map((slide, index) => (
                  <button
                    type="button"
                    key={slide.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2.5 rounded-full ${
                      index === currentIndex ? "w-8 bg-white" : "w-2.5 bg-white/50"
                    }`}
                    aria-label={`Chuyển tới slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </div>
  )
}
