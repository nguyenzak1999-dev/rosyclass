"use client"

import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Check,
  ChevronLeft,
  ChevronRight,
  Gift,
  GraduationCap,
  Mail,
  Phone,
  Sparkles,
  Target,
  User,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Confetti,
  KidButton,
  KidChoice,
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
import { submitRegistrationForm } from "./actions"

const COURSE_OPTIONS = [
  { value: "Tiếng Anh Trẻ Em (4-7 tuổi)", label: "Tiếng Anh Trẻ Em (4-7 tuổi)" },
  { value: "Tiếng Anh Thiếu Nhi (8-11 tuổi)", label: "Tiếng Anh Thiếu Nhi (8-11 tuổi)" },
  { value: "Tiếng Anh Thiếu Niên (12-16 tuổi)", label: "Tiếng Anh Thiếu Niên (12-16 tuổi)" },
  { value: "Tiếng Anh Giao Tiếp", label: "Tiếng Anh Giao Tiếp" },
  { value: "Luyện thi IELTS", label: "Luyện thi IELTS" },
  { value: "Luyện thi TOEIC", label: "Luyện thi TOEIC" },
  { value: "Học 1-1 (Cá nhân)", label: "Học 1-1 (Cá nhân)" },
]

const LEVEL_OPTIONS = [
  { value: "Mất gốc / Chưa biết gì", label: "Mất gốc / Chưa biết gì" },
  { value: "Sơ cấp (A1)", label: "Sơ cấp (A1)" },
  { value: "Cơ bản (A2)", label: "Cơ bản (A2)" },
  { value: "Trung cấp (B1)", label: "Trung cấp (B1)" },
  { value: "Trên trung cấp (B2+)", label: "Trên trung cấp (B2+)" },
  { value: "Chưa biết / Cần kiểm tra", label: "Chưa biết / Cần kiểm tra" },
]

const HEAR_ABOUT_OPTIONS = [
  "Facebook / Instagram",
  "Google Search",
  "Bạn bè / Người thân giới thiệu",
  "Tờ rơi / Băng rôn",
  "Zalo",
  "Khác",
]

const GOAL_OPTIONS = [
  "Giao tiếp tự tin hàng ngày",
  "Luyện thi IELTS / TOEIC",
  "Chuẩn bị du học",
  "Hỗ trợ công việc",
  "Phát triển bản thân",
  "Học cho trẻ em",
]

const BENEFITS = [
  {
    Icon: Target,
    title: "Lộ trình cá nhân hóa",
    desc: "Kiểm tra trình độ miễn phí và thiết kế chương trình riêng cho bạn.",
  },
  {
    Icon: GraduationCap,
    title: "Giáo viên bản ngữ & chuyên nghiệp",
    desc: "100% giáo viên có chứng chỉ quốc tế, giàu kinh nghiệm giảng dạy.",
  },
  {
    Icon: ChartNoAxesColumnIncreasing,
    title: "Theo dõi tiến độ minh bạch",
    desc: "Phụ huynh và học viên dễ dàng nắm kết quả qua hệ thống trực tuyến.",
  },
  {
    Icon: Gift,
    title: "Học thử miễn phí",
    desc: "Trải nghiệm 1 buổi học thử hoàn toàn không mất phí.",
  },
]

export function RegisterClient({ courses }: { courses: { id: string; name: string; level: string }[] }) {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    studentName: "",
    phone: "",
    email: "",
    courseInterest: "",
    currentLevel: "",
    learningGoal: "",
    parentName: "",
    parentPhone: "",
    hearAboutUs: "",
    notes: "",
  })
  const reduceMotion = useReducedMotion()

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const steps = ["Thông tin cá nhân", "Chương trình học", "Phụ huynh & Khác"]

  const handleNext = () => {
    if (step === 0 && (!formData.studentName || !formData.phone)) {
      toast.error("Vui lòng điền họ tên và số điện thoại!")
      return
    }
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const handleSubmit = async () => {
    if (!formData.studentName || !formData.phone) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!")
      return
    }
    setIsSubmitting(true)
    const result = await submitRegistrationForm(formData)
    setIsSubmitting(false)
    if (result.success) {
      setIsSuccess(true)
      toast.success("Đăng ký thành công! Chúng tôi sẽ liên hệ bạn sớm nhất.")
    } else {
      toast.error(result.error || "Có lỗi xảy ra, vui lòng thử lại.")
    }
  }

  const courseList = courses.length > 0
    ? courses.map((c) => ({ value: c.name, label: c.name }))
    : COURSE_OPTIONS

  const slide = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 } }

  return (
    <div className="pb-24">
      <PageHero
        tone="rose"
        align="left"
        eyebrow="Đăng ký ngay — Tư vấn miễn phí"
        eyebrowIcon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
        title="Đăng ký học thử"
        highlight="học thử"
        description="Điền thông tin bên dưới — đội ngũ tư vấn của RosyClass sẽ liên hệ để sắp xếp buổi học thử và xây dựng lộ trình phù hợp nhất cho bạn."
        aside={
          <div className="hidden justify-center lg:flex">
            <RosyMascot mood="wow" className="kid-float h-56 w-56" />
          </div>
        }
      />

      <section className="pt-10 md:pt-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-5">
            {/* Right form (lên trước trên mobile để phụ huynh điền ngay) */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:order-2 lg:col-span-3"
            >
              <div className="kid-border kid-shadow-lg relative overflow-hidden rounded-kid-lg bg-white p-6 sm:p-8 md:p-10">
                <span aria-hidden="true" className="kid-dots pointer-events-none absolute inset-x-0 top-0 h-32 bg-kid-sun-soft" />

                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      role="status"
                      className="relative z-10 flex flex-col items-center justify-center py-14 text-center"
                    >
                      <Confetti />
                      <RosyMascot mood="happy" className="kid-float mb-6 h-32 w-32" />
                      <h2 className="mb-3 text-[32px] font-extrabold text-kid-ink">Đăng ký thành công!</h2>
                      <p className="max-w-sm leading-relaxed text-kid-ink-soft">
                        Cảm ơn bạn đã đăng ký. Đội ngũ tư vấn sẽ liên hệ lại trong vòng <strong className="text-kid-ink">24 giờ</strong> để sắp xếp buổi học thử.
                      </p>
                      <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <KidButton href="/kiem-tra-trinh-do" tone="sun">
                          Kiểm tra trình độ
                        </KidButton>
                        <KidButton href="/khoa-hoc" tone="white">
                          Khóa học
                        </KidButton>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="form" className="relative z-10">
                      {/* Step indicator */}
                      <div className="mb-8">
                        <h2 className="mb-6 text-[26px] font-extrabold text-kid-ink md:text-[30px]">Điền thông tin đăng ký</h2>
                        <ol className="flex items-start" aria-label="Các bước đăng ký">
                          {steps.map((label, i) => {
                            const tone = toneAt(i * 2)
                            const done = i < step
                            const current = i === step
                            return (
                              <li key={i} className="flex flex-1 items-start" aria-current={current ? "step" : undefined}>
                                <div className="flex min-w-0 flex-col items-center gap-1.5">
                                  <span
                                    className={cn(
                                      "kid-border flex h-11 w-11 items-center justify-center rounded-full font-kid-display text-[18px] font-extrabold transition-all duration-300",
                                      done ? readableSolid("mint") : current ? cn(readableSolid(tone), "kid-shadow-sm scale-110 -rotate-6") : "bg-white text-kid-ink-soft"
                                    )}
                                  >
                                    {done ? <Check className="h-5 w-5" strokeWidth={3.5} aria-hidden="true" /> : i + 1}
                                  </span>
                                  <span
                                    className={cn(
                                      "max-w-[90px] text-center text-[12px] leading-tight font-bold sm:max-w-none sm:text-[13px]",
                                      current ? "text-kid-ink" : "text-kid-ink-soft"
                                    )}
                                  >
                                    {label}
                                  </span>
                                </div>
                                {i < steps.length - 1 && (
                                  <span
                                    aria-hidden="true"
                                    className={cn(
                                      "mx-1 mt-5 h-[5px] flex-1 rounded-full border-2 border-kid-ink transition-colors duration-300",
                                      i < step ? "bg-kid-mint" : "bg-white"
                                    )}
                                  />
                                )}
                              </li>
                            )
                          })}
                        </ol>
                      </div>

                      <AnimatePresence mode="wait">
                        {step === 0 && (
                          <motion.div key="step0" {...slide} transition={{ duration: 0.25 }} className="space-y-5">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                              <KidField>
                                <KidLabel htmlFor="reg-studentName" required icon={<User className="h-4 w-4 text-kid-rose" />}>
                                  Họ và tên học viên
                                </KidLabel>
                                <KidInput
                                  id="reg-studentName"
                                  autoComplete="name"
                                  aria-required="true"
                                  placeholder="Nguyễn Văn A"
                                  value={formData.studentName}
                                  onChange={(e) => update("studentName", e.target.value)}
                                />
                              </KidField>
                              <KidField>
                                <KidLabel htmlFor="reg-phone" required icon={<Phone className="h-4 w-4 text-kid-rose" />}>
                                  Số điện thoại
                                </KidLabel>
                                <KidInput
                                  id="reg-phone"
                                  type="tel"
                                  autoComplete="tel"
                                  aria-required="true"
                                  placeholder="09xx xxx xxx"
                                  value={formData.phone}
                                  onChange={(e) => update("phone", e.target.value)}
                                />
                              </KidField>
                            </div>
                            <KidField>
                              <KidLabel htmlFor="reg-email" icon={<Mail className="h-4 w-4 text-kid-rose" />}>
                                Email (tùy chọn)
                              </KidLabel>
                              <KidInput
                                id="reg-email"
                                type="email"
                                autoComplete="email"
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={(e) => update("email", e.target.value)}
                              />
                            </KidField>
                          </motion.div>
                        )}

                        {step === 1 && (
                          <motion.div key="step1" {...slide} transition={{ duration: 0.25 }} className="space-y-5">
                            <KidField>
                              <KidLabel htmlFor="reg-course" icon={<BookOpen className="h-4 w-4 text-kid-rose" />}>
                                Chương trình quan tâm
                              </KidLabel>
                              <KidSelect
                                id="reg-course"
                                value={formData.courseInterest}
                                onChange={(e) => update("courseInterest", e.target.value)}
                              >
                                <option value="">-- Chọn chương trình --</option>
                                {courseList.map((c) => (
                                  <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                              </KidSelect>
                            </KidField>
                            <KidField>
                              <KidLabel htmlFor="reg-level">Trình độ hiện tại</KidLabel>
                              <KidSelect
                                id="reg-level"
                                value={formData.currentLevel}
                                onChange={(e) => update("currentLevel", e.target.value)}
                              >
                                <option value="">-- Chọn trình độ --</option>
                                {LEVEL_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                              </KidSelect>
                            </KidField>
                            <fieldset className="space-y-2.5">
                              <legend className="mb-2.5 font-kid-display text-[16px] font-bold text-kid-ink">Mục tiêu học tập</legend>
                              <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
                                {GOAL_OPTIONS.map((g, i) => (
                                  <KidChoice
                                    key={g}
                                    tone={toneAt(i)}
                                    selected={formData.learningGoal === g}
                                    onClick={() => update("learningGoal", formData.learningGoal === g ? "" : g)}
                                  >
                                    {g}
                                  </KidChoice>
                                ))}
                              </div>
                            </fieldset>
                          </motion.div>
                        )}

                        {step === 2 && (
                          <motion.div key="step2" {...slide} transition={{ duration: 0.25 }} className="space-y-5">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                              <KidField>
                                <KidLabel htmlFor="reg-parentName">Tên phụ huynh (nếu có)</KidLabel>
                                <KidInput
                                  id="reg-parentName"
                                  placeholder="Nguyễn Thị B"
                                  value={formData.parentName}
                                  onChange={(e) => update("parentName", e.target.value)}
                                />
                              </KidField>
                              <KidField>
                                <KidLabel htmlFor="reg-parentPhone">SĐT phụ huynh</KidLabel>
                                <KidInput
                                  id="reg-parentPhone"
                                  type="tel"
                                  placeholder="09xx xxx xxx"
                                  value={formData.parentPhone}
                                  onChange={(e) => update("parentPhone", e.target.value)}
                                />
                              </KidField>
                            </div>
                            <fieldset>
                              <legend className="mb-2.5 font-kid-display text-[16px] font-bold text-kid-ink">Bạn biết đến RosyClass qua đâu?</legend>
                              <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
                                {HEAR_ABOUT_OPTIONS.map((o, i) => (
                                  <KidChoice
                                    key={o}
                                    tone={toneAt(i + 2)}
                                    selected={formData.hearAboutUs === o}
                                    onClick={() => update("hearAboutUs", formData.hearAboutUs === o ? "" : o)}
                                  >
                                    {o}
                                  </KidChoice>
                                ))}
                              </div>
                            </fieldset>
                            <KidField>
                              <KidLabel htmlFor="reg-notes">Ghi chú thêm (tùy chọn)</KidLabel>
                              <KidTextarea
                                id="reg-notes"
                                className="min-h-[100px]"
                                placeholder="Thời gian có thể học, yêu cầu đặc biệt..."
                                value={formData.notes}
                                onChange={(e) => update("notes", e.target.value)}
                              />
                            </KidField>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Navigation buttons */}
                      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                        {step > 0 ? (
                          <KidButton type="button" tone="white" onClick={() => setStep((s) => s - 1)}>
                            <ChevronLeft className="h-5 w-5" strokeWidth={3} aria-hidden="true" /> Quay lại
                          </KidButton>
                        ) : (
                          <div />
                        )}

                        {step < steps.length - 1 ? (
                          <KidButton type="button" tone="sun" onClick={handleNext}>
                            Tiếp theo <ChevronRight className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
                          </KidButton>
                        ) : (
                          <KidButton type="button" tone="rose" className="text-kid-ink" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                                Đang gửi...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-5 w-5" aria-hidden="true" />
                                Gửi đăng ký
                              </>
                            )}
                          </KidButton>
                        )}
                      </div>

                      <p className="mt-5 text-center text-[13px] text-kid-ink-soft">
                        Thông tin của bạn được bảo mật theo{" "}
                        <Link href="/chinh-sach-bao-mat" className="font-bold text-kid-ink underline decoration-kid-sun decoration-2 underline-offset-2">
                          Chính sách bảo mật
                        </Link>.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Left info */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="space-y-5 lg:order-1 lg:col-span-2"
            >
              <h2 className="relative text-[28px] font-extrabold text-kid-ink md:text-[32px]">
                Tại sao chọn RosyClass?
                <Star className="ml-2 inline-block h-8 w-8 -translate-y-1 rotate-12" />
              </h2>

              {BENEFITS.map((item, i) => {
                const tone = toneAt(i + 1)
                return (
                  <div
                    key={i}
                    className={cn(
                      "kid-border kid-shadow-sm kid-pop flex gap-4 rounded-kid p-5",
                      toneClasses[tone].soft,
                      i % 2 ? "rotate-[0.8deg]" : "-rotate-[0.8deg]"
                    )}
                  >
                    <span aria-hidden="true" className={cn("kid-border-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", readableSolid(tone))}>
                      <item.Icon className="h-6 w-6" strokeWidth={2.5} />
                    </span>
                    <div>
                      <h3 className="mb-1 text-[18px] font-extrabold text-kid-ink">{item.title}</h3>
                      <p className="text-[15px] leading-relaxed text-kid-ink-soft">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
