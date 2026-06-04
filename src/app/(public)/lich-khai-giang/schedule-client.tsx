"use client"

import { useState, useRef } from "react"
import { Calendar, MapPin, User, Clock, X, CheckCircle2 } from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { toast } from "sonner"
import { submitClassRegistration } from "./actions"

gsap.registerPlugin(ScrollTrigger, useGSAP)

type ClassData = {
  id: string
  name: string
  level: string
  startDate: string
  schedule: string
  branch: string
  teacher: string
  status: string
  spotsLeft: number
}

const levels = [
  { id: "all", label: "Tất cả" },
  { id: "kids", label: "Trẻ em" },
  { id: "teens", label: "Thiếu niên" },
  { id: "ielts", label: "IELTS" },
  { id: "communication", label: "Giao tiếp" },
]

type RegisterModalProps = {
  cls: ClassData | null
  onClose: () => void
}

function RegisterModal({ cls, onClose }: RegisterModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({ fullName: "", phone: "", email: "" })

  if (!cls) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const result = await submitClassRegistration({
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || undefined,
      className: cls.name,
      classId: cls.id,
    })

    setIsSubmitting(false)

    if (result.success) {
      setIsSuccess(true)
      toast.success("Đăng ký thành công! Chúng tôi sẽ liên hệ xác nhận sớm nhất.")
    } else {
      toast.error(result.error || "Có lỗi xảy ra, vui lòng thử lại.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#111b21]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[28px] p-8 md:p-10 w-full max-w-[500px] shadow-2xl overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#d9fdd3] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none opacity-70" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#f0f2f5] flex items-center justify-center text-[#54656f] hover:bg-[#e9edef] transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center text-center py-8 relative z-10">
            <div className="w-20 h-20 bg-[#d9fdd3] rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-[#25d366]" />
            </div>
            <h3 className="text-[24px] font-medium text-[#111b21] mb-2">Đã gửi thành công!</h3>
            <p className="text-[#54656f] text-[15px] mb-6">
              Chúng tôi sẽ liên hệ để xác nhận chỗ đăng ký vào lớp{" "}
              <span className="font-medium text-[#111b21]">{cls.name}</span>.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-[50px] bg-[#25d366] text-[#111b21] font-medium hover:bg-[#128c7e] hover:text-white transition-colors"
            >
              Đóng
            </button>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="mb-6">
              <span className="text-[12px] font-medium text-[#25d366] uppercase tracking-widest">Đăng ký lớp học</span>
              <h3 className="text-[22px] font-medium text-[#111b21] mt-1 leading-snug">{cls.name}</h3>
              <p className="text-[14px] text-[#54656f] mt-1">
                {cls.schedule} · {cls.branch}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-[#111b21]">Họ và tên *</label>
                <input
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full h-[52px] px-[16px] rounded-[14px] bg-[#f0f2f5] border border-transparent outline-none focus:bg-white focus:border-[#25d366] focus:ring-2 focus:ring-[#d9fdd3] transition-all text-[#111b21] text-[15px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-[#111b21]">Số điện thoại *</label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09xxxx..."
                  className="w-full h-[52px] px-[16px] rounded-[14px] bg-[#f0f2f5] border border-transparent outline-none focus:bg-white focus:border-[#25d366] focus:ring-2 focus:ring-[#d9fdd3] transition-all text-[#111b21] text-[15px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-[#111b21]">Email (không bắt buộc)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className="w-full h-[52px] px-[16px] rounded-[14px] bg-[#f0f2f5] border border-transparent outline-none focus:bg-white focus:border-[#25d366] focus:ring-2 focus:ring-[#d9fdd3] transition-all text-[#111b21] text-[15px]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative overflow-hidden w-full bg-[#25d366] text-[#111b21] rounded-[50px] h-14 font-medium text-[16px] flex items-center justify-center shadow-sm transition-colors duration-300 disabled:opacity-50 mt-2"
              >
                <div className="absolute inset-0 bg-[#111b21] translate-y-full group-hover:translate-y-0 group-hover:text-white transition-transform duration-300 ease-out z-0" />
                <span className="relative z-10 group-hover:text-white transition-colors">
                  {isSubmitting ? "Đang gửi..." : "Xác nhận đăng ký"}
                </span>
              </button>

              <p className="text-[12px] text-[#54656f] text-center">
                Thông tin của bạn được bảo mật và chỉ dùng để liên hệ tư vấn.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export function ScheduleClient({ initialClasses }: { initialClasses: ClassData[] }) {
  const [activeLevel, setActiveLevel] = useState("all")
  const [registeringClass, setRegisteringClass] = useState<ClassData | null>(null)
  const container = useRef<HTMLDivElement>(null)

  const filteredClasses = initialClasses.filter(c =>
    activeLevel === "all" ? true : c.level === activeLevel
  )

  // Format date: YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-")
    return `${day}/${month}/${year}`
  }

  useGSAP(() => {
    // Hero Header animation
    const tl = gsap.timeline();
    tl.from(".hero-badge", { opacity: 0, scale: 0.5, rotation: -10, duration: 0.6, ease: "back.out(2)" })
      .from(".hero-title", { opacity: 0, y: 50, duration: 0.8, ease: "elastic.out(1, 0.75)" }, "-=0.4")
      .from(".hero-desc", { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" }, "-=0.6");

    // Filters animation
    gsap.from(".filter-btn", {
      opacity: 0,
      scale: 0.8,
      y: 30,
      stagger: 0.1,
      duration: 0.6,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: ".filters-container",
        start: "top 90%",
      },
      clearProps: "all"
    });
  }, { scope: container });

  useGSAP(() => {
    // Classes Grid animation when filters change
    gsap.from(".class-card", {
      opacity: 0,
      y: 40,
      scale: 0.9,
      stagger: 0.1,
      duration: 0.6,
      ease: "back.out(1.5)",
      clearProps: "all"
    });
  }, { scope: container, dependencies: [activeLevel] });

  return (
    <>
      {/* Registration Modal */}
      {registeringClass && (
        <RegisterModal
          cls={registeringClass}
          onClose={() => setRegisteringClass(null)}
        />
      )}

      <div ref={container} className="flex flex-col w-full min-h-screen pb-20">
        {/* Hero Header */}
        <section className="pt-24 pb-16 bg-[#fcf5eb] overflow-hidden">
          <div className="max-w-[1200px] px-4 sm:px-8 mx-auto relative z-10 text-center">
            <div className="hero-badge inline-flex items-center rounded-full bg-white border border-[#e9edef] px-4 py-1.5 text-[13px] text-[#54656f] font-medium mb-6 shadow-sm">
              <Calendar className="w-4 h-4 mr-2 text-[#25d366]" /> Kế hoạch học tập
            </div>
            <h1 className="hero-title text-[40px] md:text-[56px] font-medium tracking-tight text-[#111b21] mb-6 leading-tight">
              Lịch khai giảng
            </h1>
            <p className="hero-desc max-w-2xl mx-auto text-[#54656f] text-[18px] leading-relaxed">
              Cập nhật lịch mở lớp mới nhất. Đăng ký sớm để nhận ưu đãi và giữ chỗ vì số lượng học viên mỗi lớp có hạn.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-24">
          <div className="max-w-[1200px] px-4 sm:px-8 mx-auto">

            {/* Filters */}
            <div className="filters-container flex flex-wrap gap-3 mb-12 justify-center items-center">
              {levels.map(level => (
                <button
                  key={level.id}
                  onClick={() => setActiveLevel(level.id)}
                  className={`filter-btn px-5 py-2.5 rounded-full text-[15px] font-medium transition-all duration-300 border ${
                    activeLevel === level.id
                      ? "bg-[#25d366] text-white border-transparent shadow-md shadow-[#25d366]/20"
                      : "bg-white text-[#54656f] border-[#e9edef] hover:border-[#25d366] hover:text-[#25d366]"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>

            {/* Classes Grid */}
            <div className="classes-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="class-card bg-white rounded-[24px] p-6 border border-[#e9edef] shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative overflow-hidden hover:-translate-y-2"
                  >
                    {cls.status === "full" && (
                      <div className="absolute top-[22px] right-[-38px] w-[150px] text-center bg-[#ef4444] text-white text-[11px] font-bold py-[5px] rotate-45 z-10 shadow-md tracking-[0.2em] uppercase">
                        ĐÃ ĐẦY
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-5">
                      <div className="inline-flex items-center rounded-full bg-[#f0f2f5] px-3 py-1 text-[12px] text-[#54656f] font-medium">
                        {levels.find(l => l.id === cls.level)?.label}
                      </div>
                    </div>

                    <h3 className="text-[22px] font-medium text-[#111b21] mb-5 group-hover:text-[#25d366] transition-colors leading-snug">
                      {cls.name}
                    </h3>

                    <div className="space-y-3.5 mb-8 flex-1">
                      <div className="flex items-center text-[15px] text-[#54656f]">
                        <Calendar className="w-4 h-4 mr-3 text-[#25d366] shrink-0" />
                        Khai giảng: <span className="font-medium text-[#111b21] ml-1">{formatDate(cls.startDate)}</span>
                      </div>
                      <div className="flex items-center text-[15px] text-[#54656f]">
                        <Clock className="w-4 h-4 mr-3 text-[#25d366] shrink-0" />
                        Lịch học: <span className="font-medium text-[#111b21] ml-1">{cls.schedule}</span>
                      </div>
                      <div className="flex items-center text-[15px] text-[#54656f]">
                        <MapPin className="w-4 h-4 mr-3 text-[#25d366] shrink-0" />
                        Cơ sở: <span className="font-medium text-[#111b21] ml-1">{cls.branch}</span>
                      </div>
                      <div className="flex items-center text-[15px] text-[#54656f]">
                        <User className="w-4 h-4 mr-3 text-[#25d366] shrink-0" />
                        Giáo viên: <span className="font-medium text-[#111b21] ml-1">{cls.teacher}</span>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-[#e9edef] mt-auto flex items-center justify-between">
                      {cls.status === "opening" ? (
                        <span className="text-[13px] font-medium text-[#25d366] bg-[#25d366]/10 px-3 py-1.5 rounded-full">
                          Còn {cls.spotsLeft} chỗ
                        </span>
                      ) : (
                        <span className="text-[13px] font-medium text-[#ef4444] bg-[#ef4444]/10 px-3 py-1.5 rounded-full">
                          Hết chỗ
                        </span>
                      )}

                      <button
                        disabled={cls.status === "full"}
                        onClick={() => cls.status !== "full" && setRegisteringClass(cls)}
                        className={`inline-flex items-center justify-center text-[15px] font-medium transition-colors ${
                          cls.status === "full"
                            ? "text-[#54656f] opacity-40 cursor-not-allowed"
                            : "text-[#111b21] hover:text-[#25d366] cursor-pointer"
                        }`}
                      >
                        Đăng ký ngay
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center bg-white rounded-[24px] border border-[#e9edef]">
                  <p className="text-[#54656f] text-[16px]">Không có lớp học nào đang mở cho cấp độ này.</p>
                  <button
                    onClick={() => setActiveLevel("all")}
                    className="mt-6 px-6 py-2.5 rounded-full bg-[#f0f2f5] text-[#111b21] font-medium hover:bg-[#e9edef] transition-colors"
                  >
                    Xem tất cả các lớp
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
