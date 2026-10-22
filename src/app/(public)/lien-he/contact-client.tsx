"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { MapPin, Phone, Mail, Clock, MessageCircleHeart, Send } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Confetti,
  KidButton,
  KidField,
  KidInput,
  KidLabel,
  KidSelect,
  KidTextarea,
  PageHero,
  RosyMascot,
  Star,
  readableSolid,
  toneAt,
  toneClasses,
} from "@/components/kids"
import type { SiteSettings } from "@/lib/site-settings"
import { submitContactForm } from "./actions"

export function ContactClient({ settings }: { settings: SiteSettings }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)
  const reduceMotion = useReducedMotion()

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
      toast.success("Gửi thông tin thành công! RosyClass sẽ liên hệ lại ba mẹ sớm nhất.")
      setTimeout(() => {
        setIsSuccess(false)
        form.reset()
      }, 3000)
    } else {
      toast.error(result.error || "Có lỗi xảy ra, vui lòng thử lại.")
    }
  }

  const infoCards = [
    settings.address && {
      key: "address",
      Icon: MapPin,
      title: "Địa chỉ",
      content: <p className="text-[16px] text-kid-ink-soft">{settings.address}</p>,
    },
    settings.phone && {
      key: "phone",
      Icon: Phone,
      title: "Hotline tư vấn",
      content: (
        <a
          href={`tel:${settings.phone.replace(/\s/g, "")}`}
          className="kid-focus rounded font-kid-display text-[20px] font-bold text-kid-ink underline decoration-kid-sun decoration-[3px] underline-offset-4 hover:decoration-kid-rose"
        >
          {settings.phone}
        </a>
      ),
    },
    settings.email && {
      key: "email",
      Icon: Mail,
      title: "Email hỗ trợ",
      content: (
        <a
          href={`mailto:${settings.email}`}
          className="kid-focus rounded text-[16px] font-bold break-all text-kid-ink underline decoration-kid-sun decoration-[3px] underline-offset-4 hover:decoration-kid-rose"
        >
          {settings.email}
        </a>
      ),
    },
    settings.workingHours && {
      key: "hours",
      Icon: Clock,
      title: "Giờ làm việc",
      content: <p className="text-[16px] whitespace-pre-line text-kid-ink-soft">{settings.workingHours}</p>,
    },
  ].filter(Boolean) as { key: string; Icon: typeof MapPin; title: string; content: React.ReactNode }[]

  return (
    <div className="pb-24">
      <PageHero
        tone="sky"
        align="left"
        eyebrow="Liên hệ"
        eyebrowIcon={<MessageCircleHeart className="h-4 w-4" aria-hidden="true" />}
        title="Liên hệ với chúng tôi"
        highlight="chúng tôi"
        description={`Ba mẹ hãy để lại thông tin, đội ngũ tư vấn của ${settings.siteName} sẽ liên hệ lại sớm nhất để giải đáp thắc mắc và gợi ý lộ trình học phù hợp cho bé.`}
        aside={
          <div className="hidden justify-center lg:flex">
            <RosyMascot mood="happy" className="kid-float h-56 w-56" />
          </div>
        }
      />

      {/* Main Content */}
      <section className="pt-10 md:pt-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            {/* Left: Contact Info */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="mb-7 text-[30px] font-extrabold text-kid-ink md:text-[34px]">Thông tin liên hệ</h2>

              <div className="space-y-4">
                {infoCards.map((card, i) => {
                  const tone = toneAt(i + 1)
                  return (
                    <div
                      key={card.key}
                      className={cn(
                        "kid-border kid-shadow-sm flex items-start gap-4 rounded-kid p-5",
                        toneClasses[tone].soft,
                        i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn("kid-border-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", readableSolid(tone))}
                      >
                        <card.Icon className="h-5 w-5" strokeWidth={2.5} />
                      </span>
                      <div className="min-w-0">
                        <h3 className="mb-1 text-[18px] font-extrabold text-kid-ink">{card.title}</h3>
                        {card.content}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="kid-border kid-shadow-lg relative overflow-hidden rounded-kid-lg bg-white p-6 sm:p-8 md:p-10">
                <span aria-hidden="true" className="kid-dots pointer-events-none absolute inset-x-0 top-0 h-28 bg-kid-rose-soft" />
                <Star className="pointer-events-none absolute top-5 right-5 h-10 w-10 rotate-12" />

                <h2 className="relative z-10 mb-6 pr-12 text-[26px] font-extrabold text-kid-ink md:text-[30px]">
                  Gửi lời nhắn cho chúng tôi
                </h2>

                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    role="status"
                    className="relative z-10 flex min-h-[420px] flex-col items-center justify-center py-12 text-center"
                  >
                    <Confetti />
                    <RosyMascot mood="happy" className="kid-float mb-5 h-28 w-28" />
                    <h3 className="mb-2 text-[28px] font-extrabold text-kid-ink">Đã gửi thành công!</h3>
                    <p className="max-w-sm text-kid-ink-soft">
                      Cảm ơn ba mẹ đã quan tâm. Đội ngũ tư vấn sẽ liên hệ lại qua số điện thoại ba mẹ đã cung cấp.
                    </p>
                  </motion.div>
                ) : (
                  <form ref={formRef} onSubmit={handleSubmit} className="relative z-10 space-y-5">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <KidField>
                        <KidLabel htmlFor="name" required>
                          Họ và tên ba / mẹ
                        </KidLabel>
                        <KidInput id="name" autoComplete="name" placeholder="Ví dụ: Nguyễn Thị Hoa" required />
                      </KidField>
                      <KidField>
                        <KidLabel htmlFor="phone" required>
                          Số điện thoại
                        </KidLabel>
                        <KidInput id="phone" type="tel" autoComplete="tel" placeholder="09xxxx..." required />
                      </KidField>
                    </div>

                    <KidField>
                      <KidLabel htmlFor="email">Email</KidLabel>
                      <KidInput id="email" type="email" autoComplete="email" placeholder="example@email.com" />
                    </KidField>

                    <KidField>
                      <KidLabel htmlFor="course">Chương trình quan tâm</KidLabel>
                      <KidSelect id="course" defaultValue="">
                        <option value="" disabled>
                          Chọn chương trình...
                        </option>
                        <option value="Tiếng Anh Mầm non (3–5 tuổi)">Tiếng Anh Mầm non (3–5 tuổi)</option>
                        <option value="Tiếng Anh Tiểu học lớp 1–2">Tiếng Anh Tiểu học lớp 1–2</option>
                        <option value="Tiếng Anh Tiểu học lớp 3–5">Tiếng Anh Tiểu học lớp 3–5</option>
                        <option value="Cambridge Starters – Movers – Flyers">Cambridge Starters – Movers – Flyers</option>
                        <option value="Kèm 1–1 cho bé">Kèm 1–1 cho bé</option>
                        <option value="Chưa rõ / Cần tư vấn thêm">Chưa rõ / Cần tư vấn thêm</option>
                      </KidSelect>
                    </KidField>

                    <KidField>
                      <KidLabel htmlFor="message">Lời nhắn (Tùy chọn)</KidLabel>
                      <KidTextarea id="message" placeholder="Bé năm nay mấy tuổi, đang học lớp mấy? Ba mẹ có câu hỏi gì cho RosyClass không?" />
                    </KidField>

                    <KidButton type="submit" disabled={isSubmitting} tone="rose" size="lg" className="w-full text-kid-ink h-auto min-h-14 py-3 whitespace-normal leading-tight">
                      {isSubmitting ? (
                        <>
                          <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" aria-hidden="true" />
                          Gửi yêu cầu tư vấn
                        </>
                      )}
                    </KidButton>
                    <p className="text-center text-[13px] text-kid-ink-soft">
                      Thông tin của ba mẹ và bé được bảo mật theo{" "}
                      <Link href="/chinh-sach-bao-mat" className="font-bold text-kid-ink underline decoration-kid-sun decoration-2 underline-offset-2">
                        Chính sách bảo mật
                      </Link>{" "}
                      của chúng tôi.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {settings.googleMapEmbedUrl && (
        <section className="mx-auto mt-16 max-w-[1200px] px-4 sm:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <span aria-hidden="true" className="kid-border absolute inset-0 translate-x-2 translate-y-3 rotate-1 rounded-kid-lg bg-kid-mint" />
            <div className="kid-border relative h-[360px] overflow-hidden rounded-kid-lg bg-kid-sky-soft md:h-[480px]">
              <iframe
                src={settings.googleMapEmbedUrl}
                title={`Bản đồ ${settings.siteName}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </div>
          </motion.div>
        </section>
      )}
    </div>
  )
}
