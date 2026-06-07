"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { submitContactForm } from "./actions"

export function ContactClient({ settings }: { settings: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const form = e.target as HTMLFormElement
    const data = {
      fullName: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value || undefined,
      courseInterest: (form.elements.namedItem("course") as HTMLSelectElement).value || undefined,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value || undefined,
    }

    const result = await submitContactForm(data)
    setIsSubmitting(false)

    if (result.success) {
      setIsSuccess(true)
      toast.success("Gửi thông tin thành công! Chúng tôi sẽ liên hệ lại sớm nhất.")
      setTimeout(() => {
        setIsSuccess(false)
        form.reset()
      }, 3000)
    } else {
      toast.error(result.error || "Có lỗi xảy ra, vui lòng thử lại.")
    }
  }

  return (
    <div className="pb-24">
      {/* Hero Header */}
      <section className="bg-[#fcf5eb] py-16 md:py-24 border-b border-[#e9edef]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h1 className="text-[40px] md:text-[56px] font-medium text-[#111b21] tracking-tight mb-6 leading-tight">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-[18px] text-[#54656f] leading-relaxed">
              Hãy để lại thông tin, đội ngũ tư vấn của {settings.siteName} sẽ liên hệ lại với bạn trong thời gian sớm nhất để hỗ trợ lộ trình học phù hợp.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left: Contact Info */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <h3 className="text-[32px] font-medium text-[#111b21] mb-8 tracking-tight">Thông tin liên hệ</h3>
              
              <div className="space-y-4">
                {settings.address && (
                  <div className="flex flex-col p-6 rounded-[32px] bg-white border border-[#e9edef] shadow-sm hover:border-[#25d366]/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-[#25d366]" />
                      <h4 className="font-medium text-[#111b21] text-[18px]">Địa chỉ</h4>
                    </div>
                    <p className="text-[#54656f] pl-7 text-[16px]">{settings.address}</p>
                  </div>
                )}

                {settings.phone && (
                  <div className="flex flex-col p-6 rounded-[32px] bg-white border border-[#e9edef] shadow-sm hover:border-[#25d366]/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-5 h-5 text-[#25d366]" />
                      <h4 className="font-medium text-[#111b21] text-[18px]">Hotline tư vấn</h4>
                    </div>
                    <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="text-[#54656f] pl-7 hover:text-[#25d366] transition-colors inline-block text-[16px]">{settings.phone}</a>
                  </div>
                )}

                {settings.email && (
                  <div className="flex flex-col p-6 rounded-[32px] bg-white border border-[#e9edef] shadow-sm hover:border-[#25d366]/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-5 h-5 text-[#25d366]" />
                      <h4 className="font-medium text-[#111b21] text-[18px]">Email hỗ trợ</h4>
                    </div>
                    <a href={`mailto:${settings.email}`} className="text-[#54656f] pl-7 hover:text-[#25d366] transition-colors inline-block text-[16px]">{settings.email}</a>
                  </div>
                )}

                {settings.workingHours && (
                  <div className="flex flex-col p-6 rounded-[32px] bg-white border border-[#e9edef] shadow-sm hover:border-[#25d366]/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-[#25d366]" />
                      <h4 className="font-medium text-[#111b21] text-[18px]">Giờ làm việc</h4>
                    </div>
                    <p className="text-[#54656f] pl-7 whitespace-pre-line text-[16px]">{settings.workingHours}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-md border border-[#e9edef] relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#d9fdd3] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                
                <h3 className="text-[28px] font-medium text-[#111b21] mb-6 tracking-tight relative z-10">Gửi lời nhắn cho chúng tôi</h3>
                
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-12 h-[450px]"
                  >
                    <div className="w-20 h-20 bg-[#d9fdd3] rounded-full flex items-center justify-center mb-6 shadow-sm">
                      <CheckCircle2 className="w-10 h-10 text-[#25d366]" />
                    </div>
                    <h4 className="text-[24px] font-medium text-[#111b21] mb-2">Đã gửi thành công!</h4>
                    <p className="text-[#54656f]">Cảm ơn bạn đã quan tâm. Đội ngũ tư vấn sẽ liên hệ lại qua số điện thoại bạn cung cấp.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-[15px] font-medium text-[#111b21]">Họ và tên *</label>
                        <input id="name" placeholder="Ví dụ: Nguyễn Văn A" required className="w-full h-[56px] px-[16px] rounded-[16px] bg-[#f0f2f5] border border-transparent outline-none focus:bg-white focus:border-[#25d366] focus:ring-2 focus:ring-[#d9fdd3] transition-all text-[#111b21]" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="block text-[15px] font-medium text-[#111b21]">Số điện thoại *</label>
                        <input id="phone" type="tel" placeholder="09xxxx..." required className="w-full h-[56px] px-[16px] rounded-[16px] bg-[#f0f2f5] border border-transparent outline-none focus:bg-white focus:border-[#25d366] focus:ring-2 focus:ring-[#d9fdd3] transition-all text-[#111b21]" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-[15px] font-medium text-[#111b21]">Email</label>
                      <input id="email" type="email" placeholder="example@email.com" className="w-full h-[56px] px-[16px] rounded-[16px] bg-[#f0f2f5] border border-transparent outline-none focus:bg-white focus:border-[#25d366] focus:ring-2 focus:ring-[#d9fdd3] transition-all text-[#111b21]" />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="course" className="block text-[15px] font-medium text-[#111b21]">Chương trình quan tâm</label>
                      <div className="relative">
                        <select id="course" className="w-full h-[56px] px-[16px] rounded-[16px] bg-[#f0f2f5] border border-transparent outline-none focus:bg-white focus:border-[#25d366] focus:ring-2 focus:ring-[#d9fdd3] transition-all text-[#111b21] appearance-none">
                          <option value="" disabled selected>Chọn chương trình...</option>
                          <option value="kids">Tiếng Anh Trẻ Em (4-11 tuổi)</option>
                          <option value="teens">Tiếng Anh Thiếu Niên (12-16 tuổi)</option>
                          <option value="ielts">Luyện thi IELTS</option>
                          <option value="communication">Tiếng Anh Giao Tiếp</option>
                          <option value="other">Chương trình khác / Cần tư vấn thêm</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-[16px] text-[#54656f]">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="block text-[15px] font-medium text-[#111b21]">Lời nhắn (Tùy chọn)</label>
                      <textarea 
                        id="message" 
                        placeholder="Bạn có câu hỏi hoặc yêu cầu đặc biệt nào không?" 
                        className="w-full min-h-[120px] p-[16px] rounded-[16px] bg-[#f0f2f5] border border-transparent outline-none focus:bg-white focus:border-[#25d366] focus:ring-2 focus:ring-[#d9fdd3] transition-all text-[#111b21] resize-y" 
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="group relative overflow-hidden w-full bg-[#25d366] text-[#111b21] hover:text-white rounded-[50px] px-[24px] h-14 font-medium text-[16px] flex items-center justify-center shadow-sm border-0 transition-colors duration-300 disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-[#111b21] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                      <span className="relative z-10 flex items-center">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          Gửi yêu cầu tư vấn
                        </>
                      )}
                      </span>
                    </Button>
                    <p className="text-[13px] text-[#54656f] text-center">
                      Thông tin của bạn sẽ được bảo mật tuyệt đối theo <a href="/chinh-sach-bao-mat" className="text-[#25d366] hover:underline">Chính sách bảo mật</a> của chúng tôi.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {settings.googleMapEmbedUrl && (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-8 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-[24px] overflow-hidden shadow-sm h-[400px] md:h-[500px] border border-[#e9edef] bg-[#f0f2f5] relative"
          >
            <iframe
              src={settings.googleMapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 transition-all duration-700"
            />
          </motion.div>
        </section>
      )}
    </div>
  )
}
