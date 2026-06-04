"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export function ContactClient({ settings }: { settings: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      toast.success("Gửi thông tin thành công! Chúng tôi sẽ liên hệ lại sớm nhất.")
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsSuccess(false)
        const form = e.target as HTMLFormElement
        form.reset()
      }, 3000)
    }, 1500)
  }

  return (
    <div className="pb-24">
      {/* Hero Header */}
      <section className="bg-white py-16 md:py-24 border-b border-stone/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-midnight-ink tracking-tight mb-6">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-lg text-stone leading-relaxed">
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
              className="space-y-12"
            >
              <div>
                <h3 className="text-2xl font-semibold text-midnight-ink mb-8 tracking-tight">Thông tin liên hệ</h3>
                
                <div className="space-y-6">
                  {settings.address && (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-stone/10 shadow-subtle hover:border-mint/30 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-mint/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-mint" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-midnight-ink text-lg">Địa chỉ</h4>
                        <p className="text-stone mt-1 leading-relaxed">{settings.address}</p>
                      </div>
                    </div>
                  )}

                  {settings.phone && (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-stone/10 shadow-subtle hover:border-mint/30 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-mint/10 flex items-center justify-center shrink-0">
                        <Phone className="w-6 h-6 text-mint" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-midnight-ink text-lg">Hotline tư vấn</h4>
                        <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="text-stone mt-1 hover:text-mint transition-colors inline-block">{settings.phone}</a>
                      </div>
                    </div>
                  )}

                  {settings.email && (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-stone/10 shadow-subtle hover:border-mint/30 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-mint/10 flex items-center justify-center shrink-0">
                        <Mail className="w-6 h-6 text-mint" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-midnight-ink text-lg">Email hỗ trợ</h4>
                        <a href={`mailto:${settings.email}`} className="text-stone mt-1 hover:text-mint transition-colors inline-block">{settings.email}</a>
                      </div>
                    </div>
                  )}

                  {settings.workingHours && (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-stone/10 shadow-subtle hover:border-mint/30 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-mint/10 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-mint" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-midnight-ink text-lg">Giờ làm việc</h4>
                        <p className="text-stone mt-1 leading-relaxed whitespace-pre-line">{settings.workingHours}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social links could go here if needed */}
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-subtle border border-stone/10 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-mint/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                
                <h3 className="text-2xl font-semibold text-midnight-ink mb-6 tracking-tight relative z-10">Gửi lời nhắn cho chúng tôi</h3>
                
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-12 h-[450px]"
                  >
                    <div className="w-20 h-20 bg-mint/10 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-mint" />
                    </div>
                    <h4 className="text-2xl font-bold text-midnight-ink mb-2">Đã gửi thành công!</h4>
                    <p className="text-stone">Cảm ơn bạn đã quan tâm. Đội ngũ tư vấn sẽ liên hệ lại qua số điện thoại bạn cung cấp.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Họ và tên *</Label>
                        <Input id="name" placeholder="Ví dụ: Nguyễn Văn A" required className="h-12 bg-cloud-veil/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại *</Label>
                        <Input id="phone" type="tel" placeholder="09xxxx..." required className="h-12 bg-cloud-veil/50" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="example@email.com" className="h-12 bg-cloud-veil/50" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course">Chương trình quan tâm</Label>
                      <Select>
                        <SelectTrigger className="h-12 bg-cloud-veil/50">
                          <SelectValue placeholder="Chọn chương trình..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kids">Tiếng Anh Trẻ Em (4-11 tuổi)</SelectItem>
                          <SelectItem value="teens">Tiếng Anh Thiếu Niên (12-16 tuổi)</SelectItem>
                          <SelectItem value="ielts">Luyện thi IELTS</SelectItem>
                          <SelectItem value="communication">Tiếng Anh Giao Tiếp</SelectItem>
                          <SelectItem value="other">Chương trình khác / Cần tư vấn thêm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Lời nhắn (Tùy chọn)</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Bạn có câu hỏi hoặc yêu cầu đặc biệt nào không?" 
                        className="min-h-[120px] bg-cloud-veil/50 resize-y" 
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-14 text-base font-semibold rounded-xl bg-midnight-ink hover:bg-midnight-ink/90 group"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang gửi...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Gửi yêu cầu tư vấn
                          <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                    <p className="text-[13px] text-stone text-center">
                      Thông tin của bạn sẽ được bảo mật tuyệt đối theo <a href="/chinh-sach-bao-mat" className="text-mint hover:underline">Chính sách bảo mật</a> của chúng tôi.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-[2rem] overflow-hidden shadow-subtle h-[400px] md:h-[500px] border border-stone/10 bg-cloud-veil relative"
        >
          {/* Mock iframe - In production replace with real Google Maps embed link */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.9265586616093!2d105.81665487600762!3d21.03562448061483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab0d127a01e7%3A0xab069cd4eaa76ff2!2zMjg1IMSQ4buZaSBD4bqlbiwgVsK0bmcgV2nhdUIsIEJhIMSQw6xuaCwgSMOgIE7hu5lpLCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-700"
          ></iframe>
        </motion.div>
      </section>
    </div>
  )
}
