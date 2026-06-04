import { AnimatedButton } from "@/components/ui/animated-button"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <div className="w-full bg-[#fcf5eb]">
      <section className="pt-[32px] md:pt-[40px] pb-10 px-4 md:px-12 mx-auto w-full">
        <div className="relative w-full rounded-[25px] overflow-hidden min-h-[600px] md:min-h-[700px] bg-[#111b21] flex items-center shadow-lg">

          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image src="/english-center-hero.png" alt="Học viên" fill className="object-cover" priority />
            {/* Gradient overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          </div>

          <div className="relative z-10 w-full max-w-[1200px] mx-auto h-full flex flex-col md:flex-row items-center justify-between px-8 md:px-12 lg:px-4 py-12 md:py-20">
            <div className="w-full md:w-[50%] space-y-6 relative z-20">
              <h1 className="hero-element text-[50px] md:text-[80px] font-medium text-white leading-[1.1] tracking-tight">
                Giao tiếp <br />tự tin
              </h1>
              <p className="hero-element text-[18px] md:text-[22px] font-normal text-white/90 leading-[1.4] max-w-[480px]">
                Phương pháp học đơn giản, đáng tin cậy, phản xạ tự nhiên, dành cho mọi học viên.
              </p>
              <div className="hero-element pt-4 flex flex-col items-start gap-3">
                <AnimatedButton href="/dang-ky" variant="primary" size="sm">
                  Đăng ký học thử
                </AnimatedButton>
                <p className="text-[12px] text-white/70">* Yêu cầu làm bài kiểm tra xếp lớp.</p>
              </div>
            </div>

            {/* Right Content (Floating Chat Bubbles) */}
            <div className="w-[50%] absolute right-0 top-0 bottom-0 pointer-events-none hidden lg:block z-10">

              {/* WhatsApp Group Bubble */}
              <div className="chat-bubble absolute" style={{ top: '15%', right: '15%', zIndex: 0 }}>
                <div className="bg-white rounded-[24px] p-3 pr-4 flex items-center justify-between shadow-xl border border-gray-100 text-[#111b21] min-w-[320px] w-max">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#e9edef] rounded-full flex items-center justify-center shrink-0 text-[#54656f]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div>
                      <p className="font-medium text-[15px] leading-tight">Lớp học giao tiếp</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-400 border-[1.5px] border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-red-400 border-[1.5px] border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-yellow-400 border-[1.5px] border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-[#f0f2f5] border-[1.5px] border-white text-[10px] flex items-center justify-center font-medium text-[#54656f]">+4</div>
                        </div>
                        <span className="text-[12px] text-[#54656f]">& 4 others</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-3 bg-[#25d366] text-white rounded-full px-4 py-2 shrink-0 whitespace-nowrap font-medium text-[13px] inline-flex items-center justify-center leading-normal shadow-sm">
                    <span>Tham gia</span>
                  </div>
                </div>
              </div>

              {/* Incoming Chat Bubble */}
              <div className="chat-bubble absolute" style={{ top: '35%', right: '35%', zIndex: 0 }}>
                <div className="bg-[#d9fdd3] rounded-[16px] rounded-tr-[4px] py-2 px-3 shadow-lg text-[#111b21] w-max max-w-[280px]">
                  <p className="text-[15px] leading-snug">Vẫn học lịch cũ đúng không bạn?</p>
                  <div className="flex justify-end items-center gap-1 mt-0.5">
                    <span className="text-[11px] text-[#54656f]">11:53</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#53bdeb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
              </div>

              {/* Outgoing Chat Bubble with attached Reactions */}
              <div className="chat-bubble absolute" style={{ top: '55%', right: '15%', zIndex: 0 }}>
                <div className="relative bg-white rounded-[16px] rounded-tl-[4px] py-2 px-3 shadow-lg text-[#111b21] w-max max-w-[280px]">
                  <p className="font-normal text-[#027eb5] text-[13px] mb-0.5">Cô Ngọc</p>
                  <p className="text-[15px] leading-snug">Sẵn sàng nhé! Hẹn gặp lại mọi người ở lớp. ✨</p>
                  <div className="flex justify-end items-center mt-1">
                    <span className="text-[11px] text-[#54656f]">11:59</span>
                  </div>
                  
                  {/* Reactions */}
                  <div className="absolute -bottom-3 right-4 z-10">
                    <div className="flex gap-1 bg-white shadow-sm rounded-full px-1.5 py-0.5 border border-gray-100">
                      <span className="text-[12px]">👍</span>
                      <span className="text-[12px]">❤️</span>
                      <span className="text-[12px]">🤓</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
