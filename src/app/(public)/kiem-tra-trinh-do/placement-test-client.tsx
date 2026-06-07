"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Mail, PenTool, Phone, Trophy, User } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { submitPlacementTestLead } from "./actions"

export type PlacementQuestionView = {
  id: string
  type: string
  question: string
  options: string[]
  correctIndex: number
}

export default function PlacementTestClient({ questions }: { questions: PlacementQuestionView[] }) {
  const [step, setStep] = useState<"form" | "test" | "result">("form")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    courseInterest: "Trẻ Em",
  })

  const hasQuestions = questions.length > 0
  const activeQuestion = questions[currentQuestion]

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
    await submitPlacementTestLead({
      ...formData,
      leadId: leadId || undefined,
      score,
      totalQuestions: questions.length,
    })
    setStep("result")
  }

  const resetTest = () => {
    setStep("form")
    setCurrentQuestion(0)
    setAnswers([])
    setSelectedOption(null)
    setLeadId(null)
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#fcf5eb] pb-20">
      {step === "form" && (
        <section className="overflow-hidden pt-24 pb-16">
          <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center text-[#111b21] sm:px-8">
            <div className="mb-6 inline-flex items-center rounded-full border border-[#e9edef] bg-white px-4 py-1.5 text-[13px] font-medium text-[#54656f] shadow-sm">
              <PenTool className="mr-2 h-4 w-4 text-[#25d366]" /> Đánh giá năng lực
            </div>
            <h1 className="mb-6 text-[40px] leading-tight font-medium tracking-tight md:text-[56px]">
              Kiểm tra trình độ miễn phí
            </h1>
            <p className="mx-auto max-w-2xl text-[18px] leading-relaxed text-[#54656f]">
              Làm bài test ngắn để biết trình độ hiện tại và nhận tư vấn lộ trình học phù hợp từ RosyClass.
            </p>
          </div>
        </section>
      )}

      <section className={`relative z-20 ${step === "form" ? "py-10" : "pt-24 pb-10"}`}>
        <div className="mx-auto max-w-[800px] px-4 sm:px-8">
          {step === "form" && (
            <div className="rounded-[24px] border border-[#e9edef] bg-white p-8 shadow-sm md:p-12">
              <div className="mb-10 text-center">
                <h2 className="mb-2 text-[28px] font-medium tracking-tight text-[#111b21]">Đăng ký ngay</h2>
                <p className="text-[15px] text-[#54656f]">
                  Vui lòng điền thông tin bên dưới để bắt đầu bài kiểm tra.
                </p>
              </div>

              {!hasQuestions ? (
                <div className="rounded-2xl border border-dashed border-[#e9edef] bg-[#f0f2f5] px-6 py-10 text-center">
                  <p className="text-[16px] font-medium text-[#111b21]">Chưa có bộ câu hỏi đang xuất bản.</p>
                  <p className="mt-2 text-[14px] text-[#54656f]">
                    Vui lòng quay lại sau khi trung tâm cập nhật câu hỏi trong CMS.
                  </p>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleStartTest}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="flex items-center text-[14px] font-medium text-[#111b21]">
                        <User className="mr-2 h-4 w-4 text-[#54656f]" /> Họ và tên
                      </label>
                      <input
                        required
                        value={formData.fullName}
                        onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                        placeholder="Nhập họ tên của bạn"
                        className="h-[56px] w-full rounded-2xl border border-transparent bg-[#f0f2f5] px-[16px] text-[#111b21] outline-none transition-all focus:border-[#25d366] focus:bg-white focus:ring-2 focus:ring-[#d9fdd3]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-[14px] font-medium text-[#111b21]">
                        <Phone className="mr-2 h-4 w-4 text-[#54656f]" /> Số điện thoại
                      </label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                        placeholder="Nhập số điện thoại"
                        className="h-[56px] w-full rounded-2xl border border-transparent bg-[#f0f2f5] px-[16px] text-[#111b21] outline-none transition-all focus:border-[#25d366] focus:bg-white focus:ring-2 focus:ring-[#d9fdd3]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-[14px] font-medium text-[#111b21]">
                      <Mail className="mr-2 h-4 w-4 text-[#54656f]" /> Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                      placeholder="Nhập địa chỉ email"
                      className="h-[56px] w-full rounded-2xl border border-transparent bg-[#f0f2f5] px-[16px] text-[#111b21] outline-none transition-all focus:border-[#25d366] focus:bg-white focus:ring-2 focus:ring-[#d9fdd3]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[14px] font-medium text-[#111b21]">Khóa học bạn quan tâm</label>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {["Trẻ Em", "Thiếu Niên", "IELTS", "Giao Tiếp"].map((course) => (
                        <label key={course} className="relative cursor-pointer">
                          <input
                            type="radio"
                            name="course"
                            value={course}
                            checked={formData.courseInterest === course}
                            onChange={(event) => setFormData({ ...formData, courseInterest: event.target.value })}
                            className="peer sr-only"
                          />
                          <div className="rounded-xl border border-[#e9edef] p-3 text-center text-[14px] font-medium text-[#54656f] transition-all hover:border-[#25d366]/50 peer-checked:border-[#25d366] peer-checked:bg-[#d9fdd3]/50 peer-checked:text-[#111b21]">
                            {course}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button type="submit" disabled={isSubmitting} className="h-14 w-full rounded-[50px] border-0 bg-[#25d366] text-[16px] font-medium text-[#111b21] shadow-sm hover:bg-[#111b21] hover:text-white">
                      {isSubmitting ? "Đang xử lý..." : "Bắt đầu bài kiểm tra"}
                    </Button>
                    <p className="mt-4 text-center text-[13px] text-[#54656f]">
                      Bằng việc đăng ký, bạn đồng ý với{" "}
                      <Link href="/chinh-sach-bao-mat" className="text-[#25d366] hover:underline">
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
            <div className="rounded-[24px] border border-[#e9edef] bg-white p-8 shadow-sm md:p-12">
              <div className="mb-8 flex items-center justify-between">
                <div className="rounded-full bg-[#f0f2f5] px-4 py-1.5 text-[14px] font-medium text-[#111b21]">
                  Câu hỏi {currentQuestion + 1} / {questions.length}
                </div>
                <div className="text-[14px] font-medium text-[#25d366]">{activeQuestion.type}</div>
              </div>

              <div className="relative mb-10 h-2 w-full overflow-hidden rounded-full bg-[#f0f2f5]">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-[#25d366]"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>

              <h3 className="mb-8 text-2xl leading-tight font-medium text-[#111b21] md:text-[28px]">
                {activeQuestion.question}
              </h3>

              <div className="space-y-4">
                {activeQuestion.options.map((option, index) => (
                  <button
                    key={`${activeQuestion.id}-${index}`}
                    type="button"
                    onClick={() => setSelectedOption(index)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition-colors ${
                      selectedOption === index
                        ? "border-[#25d366] bg-[#d9fdd3]/20 shadow-sm"
                        : "border-[#e9edef] hover:border-[#25d366]/50 hover:bg-[#f0f2f5]/50"
                    }`}
                  >
                    <span className={`text-[16px] font-medium ${selectedOption === index ? "text-[#111b21]" : "text-[#54656f]"}`}>
                      {String.fromCharCode(65 + index)}. {option}
                    </span>
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${selectedOption === index ? "border-[#25d366] bg-[#25d366] text-white" : "border-[#e9edef]"}`}>
                      {selectedOption === index && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-10 flex justify-end border-t border-[#e9edef] pt-8">
                <Button
                  onClick={handleNextQuestion}
                  disabled={selectedOption === null}
                  className="h-14 rounded-[50px] border-0 bg-[#25d366] px-[24px] text-[16px] font-medium text-[#111b21] shadow-sm hover:bg-[#111b21] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {currentQuestion === questions.length - 1 ? "Hoàn thành" : "Câu tiếp theo"}
                </Button>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="relative overflow-hidden rounded-[24px] border border-[#e9edef] bg-white p-8 text-center shadow-sm md:p-12">
              <div className="relative z-10">
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#25d366] text-white shadow-sm">
                  <Trophy className="h-12 w-12" />
                </div>
                <h2 className="mb-4 text-[28px] font-medium tracking-tight text-[#111b21]">Hoàn thành bài kiểm tra!</h2>
                <p className="mb-8 text-[16px] text-[#54656f]">
                  Cảm ơn bạn đã tham gia đánh giá năng lực. Dưới đây là kết quả sơ bộ của bạn.
                </p>
                <div className="mx-auto mb-10 max-w-[400px] rounded-3xl border border-[#e9edef] bg-[#f0f2f5] p-8">
                  <div className="mb-2 text-[64px] leading-none font-medium text-[#111b21]">
                    {calculateScore()}/{questions.length}
                  </div>
                  <div className="mt-2 text-[14px] font-medium tracking-wider text-[#54656f] uppercase">
                    Câu trả lời đúng
                  </div>
                </div>

                <div className="mx-auto max-w-[400px] space-y-4">
                  <Link href="/lien-he" className="flex h-14 w-full items-center justify-center rounded-[50px] bg-[#25d366] px-[24px] text-[16px] font-medium text-[#111b21] shadow-sm transition-colors hover:bg-[#111b21] hover:text-white">
                    Nhận tư vấn lộ trình học
                  </Link>
                  <Button variant="outline" onClick={resetTest} className="h-14 w-full rounded-[50px] border border-[#111b21] bg-white font-medium text-[#111b21] hover:bg-[#f0f2f5]">
                    Làm lại từ đầu
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
