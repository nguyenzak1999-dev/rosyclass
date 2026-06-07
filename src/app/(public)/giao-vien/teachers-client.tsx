"use client"

import { useRef } from "react"
import { Users, Star, Award, Heart } from "lucide-react"
import Link from "next/link"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function TeachersClient({ teachers }: { teachers: any[] }) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Hero Header animation
    const tl = gsap.timeline();
    tl.from(".hero-badge", { opacity: 0, scale: 0.5, rotation: 10, duration: 0.6, ease: "back.out(2)" })
      .from(".hero-title", { opacity: 0, y: 50, duration: 0.8, ease: "elastic.out(1, 0.75)" }, "-=0.4")
      .from(".hero-desc", { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" }, "-=0.6");

    // Teacher cards animation
    gsap.from(".teacher-card", {
      opacity: 0,
      y: 50,
      scale: 0.9,
      rotationY: 15,
      stagger: 0.1,
      duration: 0.7,
      ease: "back.out(1.5)",
      scrollTrigger: {
        trigger: ".teachers-grid",
        start: "top 85%",
      },
      clearProps: "all"
    });
  }, { scope: container });

  return (
    <div ref={container} className="flex flex-col w-full min-h-screen pb-20">
      <section className="pt-24 pb-16 bg-[#fcf5eb] overflow-hidden">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto relative z-10 text-center">
          <div className="hero-badge inline-flex items-center rounded-full bg-white border border-[#e9edef] px-4 py-1.5 text-[13px] text-[#54656f] font-medium mb-6 shadow-sm">
            <Users className="w-4 h-4 mr-2 text-[#25d366]" /> Đội ngũ giảng viên
          </div>
          <h1 className="hero-title text-[40px] md:text-[56px] font-medium tracking-tight text-[#111b21] mb-6 leading-tight">
            Giáo viên bản ngữ xuất sắc
          </h1>
          <p className="hero-desc max-w-2xl mx-auto text-[#54656f] text-[18px] leading-relaxed">
            Tự hào sở hữu 100% đội ngũ giáo viên bản ngữ có bằng cấp quốc tế, tâm huyết và giàu kinh nghiệm giảng dạy tại Việt Nam.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto">
          <div className="teachers-grid grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachers.map((teacher, idx) => {
              const certifications = teacher.certificates ? teacher.certificates.split(',').map((c: string) => c.trim()) : [];
              
              return (
                <div
                  key={idx}
                  className="teacher-card group bg-white rounded-[24px] overflow-hidden border border-[#e9edef] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="aspect-[4/5] relative overflow-hidden bg-[#f0f2f5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {teacher.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={teacher.avatar}
                        alt={teacher.fullName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#f0f2f5] px-5 text-center text-[#54656f]">
                        Chưa có ảnh giáo viên trong CMS
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111b21]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <p className="text-white text-[13px] font-medium"><Heart className="w-4 h-4 inline mr-1 text-[#25d366] fill-current" /> Yêu thương học viên</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-[22px] font-medium text-[#111b21] tracking-tight mb-1">{teacher.fullName}</h3>
                    <p className="text-[#25d366] font-medium text-[15px] mb-4">{teacher.specialties || 'Teacher'}</p>
                    
                    <div className="space-y-3 pt-4 border-t border-[#e9edef]">
                      <div className="flex items-start">
                        <Star className="w-4 h-4 mr-2 mt-0.5 text-[#25d366] shrink-0" />
                        <span className="text-[#54656f] text-[14px] leading-tight">{teacher.bio || "Nhiều năm kinh nghiệm"}</span>
                      </div>
                      {certifications.length > 0 && (
                        <div className="flex items-start">
                          <Award className="w-4 h-4 mr-2 mt-0.5 text-[#25d366] shrink-0" />
                          <span className="text-[#54656f] text-[14px] leading-tight">{certifications.join(" • ")}</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/giao-vien/${teacher.id}`} className="mt-5 inline-flex text-[14px] font-medium text-[#111b21] hover:text-[#25d366]">
                      Xem hồ sơ
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
