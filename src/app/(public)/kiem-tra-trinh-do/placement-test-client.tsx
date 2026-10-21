"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  Check,
  ClipboardList,
  GraduationCap,
  Mail,
  PenTool,
  Phone,
  RotateCcw,
  Sparkles,
  Trophy,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  Confetti,
  EmptyState,
  KidButton,
  KidField,
  KidInput,
  KidLabel,
  KidProgress,
  PageHero,
  RosyMascot,
  Sparkle,
  Star,
  readableSolid,
  toneAt,
  toneClasses,
} from "@/components/kids"
import { submitPlacementTestLead } from "./actions"
import { suggestLevel, formatScorePercent } from "@/lib/placement-test"

export type PlacementQuestionView = {
  id: string
  type: string
  question: string
  options: string[]
  correctIndex: number
}

export type SuggestedCourseView = {
  id: string
  name: string
  slug: string
  level: string
  salePrice: number | null
  tuitionFee: number
  thumbnail: string | null
}

interface PlacementTestClientProps {
  questions: PlacementQuestionView[]
  suggestedCourses: SuggestedCourseView[]
}

const COURSE_CHOICES = ["Trẻ Em", "Thiếu Niên", "IELTS", "Giao Tiếp"]

export default function PlacementTestClient({
  questions,
  suggestedCourses,
}: PlacementTestClientProps) {
  const [step, setStep] = useState<"form" | "test" | "result">("form")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Chỉ dùng cho hiển thị: khoá nút khi đang lưu kết quả câu cuối
  const [isFinishing, setIsFinishing] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    courseInterest: "Trẻ Em",
  })
  const reduceMotion = useReducedMotion()

  const hasQuestions = questions.length > 0
  const activeQuestion = questions[currentQuestion]

  // Tính gợi ý level + course dựa trên điểm hiện tại
  const currentScore = answers.reduce(
    (score, answer, index) =>
      score + (answer === questions[index]?.correctIndex ? 1 : 0),
    0
  )
  const suggestion = useMemo(() => {
    if (step !== "result" || questions.length === 0) return null
    return suggestLevel(currentScore, questions.length)
  }, [step, currentScore, questions.length])
  const recommendedCourses = useMemo(() => {
    if (!suggestion) return []
    // Map suggested level sang 1 hoặc nhiều course level
    const targetLevels = mapToCourseLevels(suggestion.level)
    return suggestedCourses
      .filter((c) => targetLevels.includes(c.level))
      .slice(0, 3)
  }, [suggestion, suggestedCourses])

  const calculateScore = (answerList = answers) =>
    answerList.reduce((score, answer, index) => score + (answer === questions[index]?.correctIndex ? 1 : 0), 0)

  const handleStartTest = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!hasQuestions) return

    setIsSubmitting(true)
    const result = await submitPlacementTestLead(formData)
    setIsSubmitting(false)

    if (result.success) {
      setLeadId(result.leadId || null)
      setStep("test")
    } else {
      toast.error(result.error || "Không thể bắt đầu bài kiểm tra.")
    }
  }

  const handleNextQuestion = async () => {
    if (selectedOption === null) return

    const nextAnswers = [...answers, selectedOption]
    setAnswers(nextAnswers)
    setSelectedOption(null)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((value) => value + 1)
      return
    }

    const score = calculateScore(nextAnswers)
    setIsFinishing(true)
    await submitPlacementTestLead({
      ...formData,
      leadId: leadId || undefined,
      score,
      totalQuestions: questions.length,
    })
    setIsFinishing(false)
    setStep("result")
  }

  const resetTest = () => {
    setStep("form")
    setCurrentQuestion(0)
    setAnswers([])
    setSelectedOption(null)
    setLeadId(null)
  }

  /**
   * Map suggested level sang array course levels để filter courses.
   * VD: B2_IELTS_FOUNDATION → ["B2", "IELTS_FOUNDATION"]
   */
  function mapToCourseLevels(level: string): string[] {
    switch (level) {
      case "STARTER":
        return ["STARTER", "KIDS"]
      case "A1":
        return ["A1", "STARTER"]
      case "A2":
        return ["A2", "A1"]
      case "B1":
        return ["B1", "A2"]
      case "B2":
      case "B2_IELTS_FOUNDATION":
        return ["B2", "IELTS_FOUNDATION"]
      case "IELTS_5_5":
        return ["IELTS_5_5", "IELTS_FOUNDATION"]
      case "IELTS_6_5":
      case "TOEIC":
        return ["IELTS_6_5", "IELTS_5_5", "TOEIC"]
      default:
        return [level]
    }
  }

  // Số sao (1–3) chỉ để hiển thị cho vui mắt
  const percent = questions.length > 0 ? (currentScore / questions.length) * 100 : 0
  const starCount = percent >= 80 ? 3 : percent >= 50 ? 2 : 1
  const isLastQuestion = currentQuestion === questions.length - 1

  return (
    <div className="flex min-h-screen w-full flex-col bg-kid-cream pb-24">
      {step === "form" && (
        <PageHero
          tone="sun"
          align="left"
          eyebrow="Đánh giá năng lực"
          eyebrowIcon={<PenTool className="h-4 w-4" aria-hidden="true" />}
          title="Kiểm tra trình độ miễn phí"
          highlight="miễn phí"
          description="Làm bài test ngắn để biết trình độ hiện tại và nhận tư vấn lộ trình học phù hợp từ RosyClass."
          aside={
            <div className="hidden justify-center lg:flex">
              <div className="relative">
                <RosyMascot mood="wow" className="kid-float h-56 w-56" />
                <Sparkle className="kid-spin-slow absolute -top-2 -left-6 h-9 w-9 fill-kid-rose" />
              </div>
            </div>
          }
        >
          {hasQuestions ? (
            <ol className="mt-1 flex flex-wrap gap-2.5" aria-label="Các bước">
              {[
                { Icon: User, label: "Điền thông tin" },
                { Icon: ClipboardList, label: `${questions.length} câu hỏi` },
                { Icon: Trophy, label: "Nhận kết quả" },
              ].map((item, i) => (
                <li
                  key={item.label}
                  className={cn(
                    "kid-border-2 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[15px] font-bold text-kid-ink",
                    i % 2 ? "rotate-1" : "-rotate-1"
                  )}
                >
                  <span aria-hidden="true" className={cn("flex h-6 w-6 items-center justify-center rounded-full border-2 border-kid-ink", readableSolid(toneAt(i * 2)))}>
                    <item.Icon className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {item.label}
                </li>
              ))}
            </ol>
          ) : null}
        </PageHero>
      )}

      <section className={cn("relative z-20", step === "form" ? "pt-6 md:pt-10" : "pt-10 md:pt-14")}>
        <div className="mx-auto max-w-[820px] px-4 sm:px-8">
          {step === "form" && (
            <div className="kid-border kid-shadow-lg relative rounded-kid-lg bg-white p-6 sm:p-8 md:p-12">
              <Star className="pointer-events-none absolute -top-6 -right-3 h-14 w-14 rotate-12" />
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-[30px] font-extrabold text-kid-ink">Đăng ký ngay</h2>
                <p className="text-[16px] text-kid-ink-soft">
                  Vui lòng điền thông tin bên dưới để bắt đầu bài kiểm tra.
                </p>
              </div>

              {!hasQuestions ? (
                <EmptyState
                  tone="sky"
                  title="Chưa có bộ câu hỏi đang xuất bản."
                  description="Vui lòng quay lại sau khi trung tâm cập nhật câu hỏi trong CMS."
                  action={
                    <KidButton href="/lien-he" tone="sun">
                      Liên hệ tư vấn
                    </KidButton>
                  }
                />
              ) : (
                <form className="space-y-6" onSubmit={handleStartTest}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <KidField>
                      <KidLabel htmlFor="pt-fullName" required icon={<User className="h-4 w-4 text-kid-rose" />}>
                        Họ và tên
                      </KidLabel>
                      <KidInput
                        id="pt-fullName"
                        required
                        autoComplete="name"
                        value={formData.fullName}
                        onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                        placeholder="Nhập họ tên của bạn"
                      />
                    </KidField>
                    <KidField>
                      <KidLabel htmlFor="pt-phone" required icon={<Phone className="h-4 w-4 text-kid-rose" />}>
                        Số điện thoại
                      </KidLabel>
                      <KidInput
                        id="pt-phone"
                        required
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                        placeholder="Nhập số điện thoại"
                      />
                    </KidField>
                  </div>

                  <KidField>
                    <KidLabel htmlFor="pt-email" icon={<Mail className="h-4 w-4 text-kid-rose" />}>
                      Email
                    </KidLabel>
                    <KidInput
                      id="pt-email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                      placeholder="Nhập địa chỉ email"
                    />
                  </KidField>

                  <fieldset>
                    <legend className="mb-3 font-kid-display text-[16px] font-bold text-kid-ink">Khóa học bạn quan tâm</legend>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {COURSE_CHOICES.map((course, i) => {
                        const tone = toneAt(i)
                        return (
                          <label key={course} className="relative cursor-pointer">
                            <input
                              type="radio"
                              name="course"
                              value={course}
                              checked={formData.courseInterest === course}
                              onChange={(event) => setFormData({ ...formData, courseInterest: event.target.value })}
                              className="peer sr-only"
                            />
                            <div
                              className={cn(
                                "kid-pop flex min-h-[64px] items-center justify-center rounded-2xl border-[3px] border-kid-ink bg-white p-3 text-center font-kid-display text-[17px] font-bold text-kid-ink shadow-[0_2px_0_0_var(--color-kid-ink)]",
                                "peer-checked:-rotate-2 peer-checked:shadow-[0_4px_0_0_var(--color-kid-ink)] peer-focus-visible:ring-4 peer-focus-visible:ring-kid-sun/70",
                                {
                                  rose: "peer-checked:bg-kid-rose-soft",
                                  sun: "peer-checked:bg-kid-sun-soft",
                                  sky: "peer-checked:bg-kid-sky-soft",
                                  mint: "peer-checked:bg-kid-mint-soft",
                                  grape: "peer-checked:bg-kid-grape-soft",
                                  orange: "peer-checked:bg-kid-orange-soft",
                                }[tone]
                              )}
                            >
                              {course}
                            </div>
                            <span
                              aria-hidden="true"
                              className="absolute -top-2 -right-2 hidden h-7 w-7 items-center justify-center rounded-full border-2 border-kid-ink bg-kid-mint text-kid-ink peer-checked:flex"
                            >
                              <Check className="h-4 w-4" strokeWidth={3.5} />
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>

                  <div className="pt-4">
                    <KidButton type="submit" disabled={isSubmitting} tone="rose" size="lg" className="w-full text-kid-ink h-auto min-h-14 py-3 whitespace-normal leading-tight">
                      {isSubmitting ? (
                        "Đang xử lý..."
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" aria-hidden="true" />
                          Bắt đầu bài kiểm tra
                        </>
                      )}
                    </KidButton>
                    <p className="mt-4 text-center text-[13px] text-kid-ink-soft">
                      Bằng việc đăng ký, bạn đồng ý với{" "}
                      <Link href="/chinh-sach-bao-mat" className="font-bold text-kid-ink underline decoration-kid-sun decoration-2 underline-offset-2">
                        Chính sách bảo mật
                      </Link>{" "}
                      của chúng tôi.
                    </p>
                  </div>
                </form>
              )}
            </div>
          )}

          {step === "test" && activeQuestion && (
            <div className="kid-border kid-shadow-lg relative overflow-hidden rounded-kid-lg bg-white">
              {/* Thanh trên: tiến độ như màn chơi game */}
              <div className="kid-dots relative border-b-[3px] border-kid-ink bg-kid-sky-soft px-5 pt-5 pb-7 sm:px-8 md:px-10">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="kid-border-2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-kid-display text-[16px] font-extrabold text-kid-ink">
                    Câu hỏi {currentQuestion + 1} / {questions.length}
                  </span>
                  {activeQuestion.type ? (
                    <span className="kid-border-2 rounded-full bg-kid-grape px-3 py-1 text-[14px] font-bold text-white">{activeQuestion.type}</span>
                  ) : null}
                </div>
                <KidProgress
                  value={currentQuestion + 1}
                  max={questions.length}
                  tone="mint"
                  label={`Câu hỏi ${currentQuestion + 1} / ${questions.length}`}
                />
              </div>

              <div className="p-5 sm:p-8 md:p-10">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeQuestion.id}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 40, rotate: 1 }}
                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, rotate: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -40, rotate: -1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  >
                    <div className="mb-7 flex items-start gap-4">
                      <RosyMascot mood="think" className="hidden h-16 w-16 shrink-0 sm:block" />
                      <h2 id="pt-question" className="pt-1 text-[24px] leading-snug font-extrabold break-words text-kid-ink md:text-[30px]">
                        {activeQuestion.question}
                      </h2>
                    </div>

                    <div role="group" aria-labelledby="pt-question" className="grid gap-4 sm:grid-cols-2">
                      {activeQuestion.options.map((option, index) => {
                        const tone = toneAt(index)
                        const selected = selectedOption === index
                        return (
                          <button
                            key={`${activeQuestion.id}-${index}`}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setSelectedOption(index)}
                            className={cn(
                              "kid-pop kid-focus flex min-h-[72px] w-full items-center gap-4 rounded-kid border-[3px] border-kid-ink p-4 text-left",
                              selected
                                ? cn(toneClasses[tone].soft, "kid-shadow -translate-y-0.5")
                                : "bg-white shadow-[0_3px_0_0_var(--color-kid-ink)] hover:bg-kid-cream"
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                "kid-border-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-kid-display text-[20px] font-extrabold transition-transform",
                                readableSolid(tone),
                                selected && "-rotate-6 scale-110"
                              )}
                            >
                              {selected ? <Check className="h-6 w-6" strokeWidth={3.5} /> : String.fromCharCode(65 + index)}
                            </span>
                            <span className="min-w-0 flex-1 text-[17px] leading-snug font-bold break-words text-kid-ink md:text-[18px]">
                              <span className="sr-only">{String.fromCharCode(65 + index)}. </span>
                              {option}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t-[3px] border-dashed border-kid-ink/15 pt-7">
                  <p className="text-[15px] font-semibold text-kid-ink-soft" aria-live="polite">
                    {selectedOption === null ? "Chọn một đáp án nhé!" : `Đã chọn: ${String.fromCharCode(65 + selectedOption)}`}
                  </p>
                  <KidButton
                    type="button"
                    tone={isLastQuestion ? "rose" : "mint"}
                    size="lg"
                    className="text-kid-ink"
                    onClick={handleNextQuestion}
                    disabled={selectedOption === null || isFinishing}
                  >
                    {isLastQuestion ? (isFinishing ? "Đang xử lý..." : "Hoàn thành") : "Câu tiếp theo"}
                    {isLastQuestion ? <Trophy className="h-5 w-5" aria-hidden="true" /> : <ArrowRight className="h-5 w-5" aria-hidden="true" />}
                  </KidButton>
                </div>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="space-y-8">
              <div className="kid-border kid-shadow-lg kid-bounce-in relative overflow-hidden rounded-kid-lg bg-kid-sun-soft px-6 pt-10 pb-10 text-center sm:px-10 md:pt-12">
                <div aria-hidden="true" className="kid-dots pointer-events-none absolute inset-0 opacity-60" />
                <Confetti />
                <div className="relative z-10">
                  <RosyMascot mood="happy" className="kid-float mx-auto mb-4 h-32 w-32 md:h-36 md:w-36" />
                  <h2 className="mb-3 text-[30px] leading-tight font-extrabold text-kid-ink md:text-[40px]">Hoàn thành bài kiểm tra!</h2>
                  <p className="mx-auto mb-8 max-w-[520px] text-[16px] text-kid-ink-soft md:text-[17px]">
                    Cảm ơn bạn đã tham gia đánh giá năng lực. Dưới đây là kết quả sơ bộ của bạn.
                  </p>

                  <div className="mb-6 flex justify-center gap-2" aria-label={`${starCount} / 3 sao`} role="img">
                    {[0, 1, 2].map((i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-12 w-12 md:h-14 md:w-14",
                          i === 1 ? "-translate-y-2" : i === 0 ? "-rotate-12" : "rotate-12",
                          i < starCount ? "fill-kid-sun" : "fill-white opacity-60"
                        )}
                      />
                    ))}
                  </div>

                  <div className="kid-border kid-shadow mx-auto inline-flex -rotate-2 flex-col items-center rounded-kid-lg bg-white px-10 py-6">
                    <div className="font-kid-display text-[64px] leading-none font-extrabold text-kid-ink md:text-[76px]">
                      {calculateScore()}/{questions.length}
                    </div>
                    <div className="mt-2 text-[15px] font-bold tracking-wide text-kid-ink-soft">
                      Câu trả lời đúng · {formatScorePercent(currentScore, questions.length)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggested Level */}
              {suggestion && (
                <div className="kid-border kid-shadow rounded-kid-lg bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="kid-border-2 flex h-14 w-14 flex-shrink-0 -rotate-6 items-center justify-center rounded-2xl bg-kid-grape text-white">
                      <Sparkles className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-bold text-kid-ink-soft">Gợi ý trình độ của bạn</p>
                      <h3 className={cn("mt-1 text-[26px] font-extrabold md:text-[30px]", suggestion.color)}>
                        {suggestion.label}
                      </h3>
                      <p className="mt-2 text-[16px] text-kid-ink-soft">{suggestion.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommended Courses */}
              {recommendedCourses.length > 0 && (
                <div>
                  <h3 className="mb-5 flex items-center gap-2 text-[24px] font-extrabold text-kid-ink">
                    <GraduationCap className="h-6 w-6" aria-hidden="true" />
                    Khóa học phù hợp với bạn
                  </h3>
                  <div className="grid gap-5 md:grid-cols-3">
                    {recommendedCourses.map((course, i) => {
                      const price = course.salePrice || course.tuitionFee
                      const tone = toneAt(i + 1)
                      return (
                        <Link
                          key={course.id}
                          href={`/khoa-hoc/${course.slug}`}
                          className={cn("kid-border kid-shadow kid-pop kid-focus group flex flex-col rounded-kid p-5", toneClasses[tone].soft)}
                        >
                          <span className="kid-border-2 mb-3 self-start rounded-full bg-white px-2.5 py-0.5 text-[12px] font-bold text-kid-ink">
                            {course.level}
                          </span>
                          <h4 className="mb-2 line-clamp-2 font-kid-display text-[18px] font-extrabold text-kid-ink">
                            {course.name}
                          </h4>
                          <p className="text-[16px] font-extrabold text-kid-ink">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                              maximumFractionDigits: 0,
                            }).format(price)}
                          </p>
                          <p className="mt-3 flex items-center gap-1 text-[14px] font-bold text-kid-ink underline decoration-kid-sun decoration-2 underline-offset-4">
                            Xem chi tiết <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                          </p>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {recommendedCourses.length === 0 && (
                <EmptyState
                  tone="sky"
                  mood="think"
                  className="py-8"
                  title="Hiện chưa có khóa học phù hợp được mở bán. Vui lòng liên hệ trung tâm để được tư vấn."
                />
              )}

              <div className="mx-auto grid max-w-[640px] gap-3 md:grid-cols-2">
                <KidButton href="/lien-he" tone="rose" size="lg" className="w-full text-kid-ink h-auto min-h-14 py-3 whitespace-normal leading-tight">
                  Nhận tư vấn lộ trình học
                </KidButton>
                <KidButton type="button" tone="white" size="lg" onClick={resetTest} className="w-full h-auto min-h-14 py-3 whitespace-normal leading-tight">
                  <RotateCcw className="h-5 w-5" aria-hidden="true" />
                  Làm lại từ đầu
                </KidButton>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
