import Image from "next/image"

export function TestimonialsSection() {
  return (
    <section className="reveal-section py-24 px-4 bg-white">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[32px] md:text-[48px] font-medium text-[#1c1e21] tracking-tight">Học viên nói gì về chúng tôi?</h2>
        </div>
        <div className="space-y-6 flex flex-col items-center">
          
          {/* Review 1 - Left */}
          <div className="w-full max-w-[600px] self-start flex gap-3">
             <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative shrink-0 mt-2">
                <Image src="/hero_slider_2.png" alt="Avatar" fill className="object-cover" />
             </div>
             <div className="bg-[#f0f2f5] rounded-[16px] rounded-tl-sm p-4 relative text-[#111b21] shadow-sm">
               <p className="font-medium text-[#027eb5] text-[14px] mb-1">Mai Phương</p>
               <p className="text-[16px] leading-relaxed">Từ một người ngại nói tiếng Anh, mình đã tự tin thuyết trình trước công ty chỉ sau 3 tháng học tại RosyClass. Giáo viên cực kỳ tận tâm! ✨</p>
               <div className="flex justify-end items-center mt-1">
                  <span className="text-[11px] text-[#54656f]">10:24</span>
               </div>
             </div>
          </div>

          {/* Review 2 - Right */}
          <div className="w-full max-w-[600px] self-end flex justify-end gap-3">
             <div className="bg-[#d9fdd3] rounded-[16px] rounded-tr-sm p-4 relative text-[#111b21] shadow-sm">
               <p className="font-medium text-[#027eb5] text-[14px] mb-1">Tuấn Anh (IELTS 7.5)</p>
               <p className="text-[16px] leading-relaxed">Môi trường học rất tuyệt, các bạn cùng lớp hòa đồng và lộ trình cá nhân hóa giúp mình tiết kiệm rất nhiều thời gian ôn luyện.</p>
               <div className="flex justify-end items-center gap-1 mt-1">
                  <span className="text-[11px] text-[#54656f]">11:53</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#53bdeb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
               </div>
             </div>
          </div>

          {/* Review 3 - Left */}
          <div className="w-full max-w-[600px] self-start flex gap-3">
             <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative shrink-0 mt-2">
                <Image src="/hero_slider_3.png" alt="Avatar" fill className="object-cover" />
             </div>
             <div className="bg-[#f0f2f5] rounded-[16px] rounded-tl-sm p-4 relative text-[#111b21] shadow-sm">
               <p className="font-medium text-[#027eb5] text-[14px] mb-1">Hương Giang</p>
               <p className="text-[16px] leading-relaxed">Mình rất thích tính năng đánh giá hàng tuần, nó giúp mình biết được mình đang yếu điểm nào để khắc phục ngay. 10 điểm cho chất lượng!</p>
               <div className="flex justify-end items-center mt-1">
                  <span className="text-[11px] text-[#54656f]">14:05</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
