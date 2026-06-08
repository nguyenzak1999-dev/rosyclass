"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
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
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
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

const inputCls =
  "w-full h-14 px-4 rounded-2xl bg-[#f0f2f5] border border-transparent outline-none focus:bg-white focus:border-[#25d366] focus:ring-2 focus:ring-[#d9fdd3] transition-all text-[#111b21] text-[15px] placeholder:text-[#aaa]"

const selectCls =
  "w-full h-14 px-4 rounded-2xl bg-[#f0f2f5] border border-transparent outline-none focus:bg-white focus:border-[#25d366] focus:ring-2 focus:ring-[#d9fdd3] transition-all text-[#111b21] text-[15px] appearance-none"

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

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="bg-[#fcf5eb] py-16 md:py-24 border-b border-[#e9edef]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-white border border-[#e9edef] rounded-full px-4 py-2 mb-6 text-[14px] font-medium text-[#25d366] shadow-sm">
              <Sparkles className="w-4 h-4" />
              Đăng ký ngay — Tư vấn miễn phí
            </div>
            <h1 className="text-[40px] md:text-[56px] font-medium text-[#111b21] tracking-tight mb-6 leading-tight">
              Đăng ký học thử
            </h1>
            <p className="text-[18px] text-[#54656f] leading-relaxed">
              Điền thông tin bên dưới — đội ngũ tư vấn của RosyClass sẽ liên hệ để sắp xếp buổi học thử và xây dựng lộ trình phù hợp nhất cho bạn.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

            {/* Left info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <h2 className="text-[28px] font-medium text-[#111b21] tracking-tight">Tại sao chọn RosyClass?</h2>

              {BENEFITS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex gap-4 p-5 bg-white rounded-[24px] border border-[#e9edef] shadow-sm hover:border-[#25d366]/40 transition-colors"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f8ee] text-[#25d366]">
                    <item.Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium text-[#111b21] mb-1">{item.title}</p>
                    <p className="text-[14px] text-[#54656f]">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Right form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-[32px] shadow-md border border-[#e9edef] p-8 md:p-10 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#d9fdd3] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center text-center py-16 relative z-10"
                    >
                      <div className="w-24 h-24 bg-[#d9fdd3] rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <CheckCircle2 className="w-12 h-12 text-[#25d366]" />
                      </div>
                      <h3 className="text-[28px] font-medium text-[#111b21] mb-3">Đăng ký thành công!</h3>
                      <p className="text-[#54656f] max-w-sm leading-relaxed">
                        Cảm ơn bạn đã đăng ký. Đội ngũ tư vấn sẽ liên hệ lại trong vòng <strong>24 giờ</strong> để sắp xếp buổi học thử.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="form" className="relative z-10">
                      {/* Step indicator */}
                      <div className="mb-8">
                        <h3 className="text-[24px] font-medium text-[#111b21] mb-5">Điền thông tin đăng ký</h3>
                        <div className="flex items-center gap-0">
                          {steps.map((label, i) => (
                            <div key={i} className="flex items-center flex-1">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all duration-300 ${
                                    i < step
                                      ? "bg-[#25d366] text-white"
                                      : i === step
                                      ? "bg-[#111b21] text-white"
                                      : "bg-[#f0f2f5] text-[#aaa]"
                                  }`}
                                >
                                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                </div>
                                <span className={`text-[11px] mt-1 whitespace-nowrap font-medium ${i === step ? "text-[#111b21]" : "text-[#aaa]"}`}>
                                  {label}
                                </span>
                              </div>
                              {i < steps.length - 1 && (
                                <div className={`h-[2px] flex-1 mx-1 mb-4 rounded transition-all duration-300 ${i < step ? "bg-[#25d366]" : "bg-[#e9edef]"}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {step === 0 && (
                          <motion.div
                            key="step0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-5"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div className="space-y-2">
                                <label className="block text-[14px] font-medium text-[#111b21]">
                                  <User className="inline w-4 h-4 mr-1 text-[#25d366]" />
                                  Họ và tên học viên <span className="text-red-500">*</span>
                                </label>
                                <input
                                  className={inputCls}
                                  placeholder="Nguyễn Văn A"
                                  value={formData.studentName}
                                  onChange={(e) => update("studentName", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-[14px] font-medium text-[#111b21]">
                                  <Phone className="inline w-4 h-4 mr-1 text-[#25d366]" />
                                  Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="tel"
                                  className={inputCls}
                                  placeholder="09xx xxx xxx"
                                  value={formData.phone}
                                  onChange={(e) => update("phone", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[14px] font-medium text-[#111b21]">
                                <Mail className="inline w-4 h-4 mr-1 text-[#25d366]" />
                                Email (tùy chọn)
                              </label>
                              <input
                                type="email"
                                className={inputCls}
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={(e) => update("email", e.target.value)}
                              />
                            </div>
                          </motion.div>
                        )}

                        {step === 1 && (
                          <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-5"
                          >
                            <div className="space-y-2">
                              <label className="block text-[14px] font-medium text-[#111b21]">
                                <BookOpen className="inline w-4 h-4 mr-1 text-[#25d366]" />
                                Chương trình quan tâm
                              </label>
                              <div className="relative">
                                <select
                                  className={selectCls}
                                  value={formData.courseInterest}
                                  onChange={(e) => update("courseInterest", e.target.value)}
                                >
                                  <option value="">-- Chọn chương trình --</option>
                                  {courseList.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#54656f]">
                                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[14px] font-medium text-[#111b21]">Trình độ hiện tại</label>
                              <div className="relative">
                                <select
                                  className={selectCls}
                                  value={formData.currentLevel}
                                  onChange={(e) => update("currentLevel", e.target.value)}
                                >
                                  <option value="">-- Chọn trình độ --</option>
                                  {LEVEL_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#54656f]">
                                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[14px] font-medium text-[#111b21]">Mục tiêu học tập</label>
                              <div className="grid grid-cols-2 gap-2">
                                {GOAL_OPTIONS.map((g) => (
                                  <button
                                    type="button"
                                    key={g}
                                    onClick={() => update("learningGoal", formData.learningGoal === g ? "" : g)}
                                    className={`text-left px-3 py-2.5 rounded-xl border text-[13px] transition-all ${
                                      formData.learningGoal === g
                                        ? "border-[#25d366] bg-[#d9fdd3] text-[#111b21] font-medium"
                                        : "border-[#e9edef] bg-[#f0f2f5] text-[#54656f] hover:border-[#25d366]/50"
                                    }`}
                                  >
                                    {g}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {step === 2 && (
                          <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-5"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div className="space-y-2">
                                <label className="block text-[14px] font-medium text-[#111b21]">Tên phụ huynh (nếu có)</label>
                                <input
                                  className={inputCls}
                                  placeholder="Nguyễn Thị B"
                                  value={formData.parentName}
                                  onChange={(e) => update("parentName", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-[14px] font-medium text-[#111b21]">SĐT phụ huynh</label>
                                <input
                                  type="tel"
                                  className={inputCls}
                                  placeholder="09xx xxx xxx"
                                  value={formData.parentPhone}
                                  onChange={(e) => update("parentPhone", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[14px] font-medium text-[#111b21]">Bạn biết đến RosyClass qua đâu?</label>
                              <div className="grid grid-cols-2 gap-2">
                                {HEAR_ABOUT_OPTIONS.map((o) => (
                                  <button
                                    type="button"
                                    key={o}
                                    onClick={() => update("hearAboutUs", formData.hearAboutUs === o ? "" : o)}
                                    className={`text-left px-3 py-2.5 rounded-xl border text-[13px] transition-all ${
                                      formData.hearAboutUs === o
                                        ? "border-[#25d366] bg-[#d9fdd3] text-[#111b21] font-medium"
                                        : "border-[#e9edef] bg-[#f0f2f5] text-[#54656f] hover:border-[#25d366]/50"
                                    }`}
                                  >
                                    {o}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[14px] font-medium text-[#111b21]">Ghi chú thêm (tùy chọn)</label>
                              <textarea
                                className="w-full min-h-[100px] p-4 rounded-2xl bg-[#f0f2f5] border border-transparent outline-none focus:bg-white focus:border-[#25d366] focus:ring-2 focus:ring-[#d9fdd3] transition-all text-[#111b21] text-[15px] resize-y placeholder:text-[#aaa]"
                                placeholder="Thời gian có thể học, yêu cầu đặc biệt..."
                                value={formData.notes}
                                onChange={(e) => update("notes", e.target.value)}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Navigation buttons */}
                      <div className="flex items-center justify-between mt-8 gap-4">
                        {step > 0 ? (
                          <Button
                            type="button"
                            onClick={() => setStep((s) => s - 1)}
                            className="flex items-center gap-2 bg-[#f0f2f5] text-[#111b21] hover:bg-[#e9edef] rounded-[50px] px-6 h-12 border-0 font-medium"
                          >
                            <ChevronLeft className="w-4 h-4" /> Quay lại
                          </Button>
                        ) : (
                          <div />
                        )}

                        {step < steps.length - 1 ? (
                          <Button
                            type="button"
                            onClick={handleNext}
                            className="group relative overflow-hidden flex items-center gap-2 bg-[#25d366] text-[#111b21] hover:text-white rounded-[50px] px-6 h-12 border-0 font-medium transition-colors duration-300"
                          >
                            <div className="absolute inset-0 bg-[#111b21] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                            <span className="relative z-10 flex items-center gap-2">
                              Tiếp theo <ChevronRight className="w-4 h-4" />
                            </span>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="group relative overflow-hidden flex items-center gap-2 bg-[#25d366] text-[#111b21] hover:text-white rounded-[50px] px-8 h-12 border-0 font-medium transition-colors duration-300 disabled:opacity-50"
                          >
                            <div className="absolute inset-0 bg-[#111b21] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                            <span className="relative z-10 flex items-center gap-2">
                              {isSubmitting ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                  </svg>
                                  Đang gửi...
                                </>
                              ) : (
                                <>Gửi đăng ký</>
                              )}
                            </span>
                          </Button>
                        )}
                      </div>

                      <p className="text-[12px] text-[#54656f] text-center mt-4">
                        Thông tin của bạn được bảo mật theo{" "}
                        <a href="/chinh-sach-bao-mat" className="text-[#25d366] hover:underline">Chính sách bảo mật</a>.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
