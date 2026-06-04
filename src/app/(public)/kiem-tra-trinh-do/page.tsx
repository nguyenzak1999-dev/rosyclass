"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { PenTool, User, Phone, Mail, CheckCircle2, Trophy } from "lucide-react"
import Link from "next/link"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

import { submitPlacementTestLead } from "./actions"

gsap.registerPlugin(useGSAP)

const testQuestions = [
  {
    id: 1,
    type: "Ngữ pháp",
    question: "Choose the correct answer: 'I _____ to the store yesterday.'",
    options: ["go", "goes", "went", "gone"],
    correct: 2
  },
  {
    id: 2,
    type: "Ngữ pháp",
    question: "Which sentence is grammatically correct?",
    options: [
      "She don't like apples.",
      "She doesn't likes apples.",
      "She doesn't like apples.",
      "She not like apples."
    ],
    correct: 2
  },
  {
    id: 3,
    type: "Từ vựng",
    question: "What is the closest synonym of 'Enormous'?",
    options: ["Tiny", "Huge", "Angry", "Happy"],
    correct: 1
  },
  {
    id: 4,
    type: "Đọc hiểu",
    question: "If 'It is raining cats and dogs', it means:",
    options: [
      "Animals are falling from the sky",
      "It is raining very heavily",
      "Cats and dogs are fighting",
      "The weather is perfect"
    ],
    correct: 1
  }
]

export default function PlacementTestPage() {
  const [step, setStep] = useState<"form" | "test" | "result">("form")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    courseInterest: "Trẻ Em"
  })

  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (step === "form") {
      const tl = gsap.timeline();
      tl.from(".hero-badge", { opacity: 0, scale: 0.5, duration: 0.6, ease: "back.out(2)" })
        .from(".hero-title", { opacity: 0, y: 30, duration: 0.6, ease: "power3.out" }, "-=0.4")
        .from(".hero-desc", { opacity: 0, y: 30, duration: 0.6, ease: "power3.out" }, "-=0.4")
        .from(".step-container", { opacity: 0, y: 40, duration: 0.6, ease: "power3.out" }, "-=0.4");
    } else if (step === "result") {
      const tl = gsap.timeline();
      tl.from(".step-container", { opacity: 0, scale: 0.95, duration: 0.6, ease: "back.out(1.5)" })
        .from(".result-icon", { scale: 0, rotation: -180, duration: 0.8, ease: "elastic.out(1, 0.5)" }, "-=0.2");
    } else {
      gsap.fromTo(".step-container", 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", clearProps: "all" }
      );
    }
  }, { scope: container, dependencies: [step] });

  useGSAP(() => {
    if (step === "test") {
      gsap.to(".progress-fill", { 
        width: `${((currentQuestion + 1) / testQuestions.length) * 100}%`, 
        duration: 0.5, 
        ease: "power2.out" 
      });
      gsap.fromTo(".question-content",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out", clearProps: "all" }
      );
    }
  }, { scope: container, dependencies: [currentQuestion, step] });

  const handleStartTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await submitPlacementTestLead({
      ...formData,
    })
    setIsSubmitting(false)
    setStep("test")
  }

  const handleNextQuestion = () => {
    if (selectedOption === null) return
    
    const newAnswers = [...answers, selectedOption]
    setAnswers(newAnswers)
    setSelectedOption(null)
    
    if (currentQuestion < testQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      setStep("result")
    }
  }

  const calculateScore = () => {
    let score = 0
    answers.forEach((ans, idx) => {
      if (ans === testQuestions[idx].correct) score++
    })
    return score
  }

  return (
    <div ref={container} className="flex flex-col w-full min-h-screen pb-20 bg-[#fcf5eb]">
      {/* Header (only in form step for better focus) */}
      {step === "form" && (
        <section className="pt-24 pb-16 overflow-hidden">
          <div className="max-w-[1200px] px-4 sm:px-8 mx-auto relative z-10 text-center text-[#111b21]">
            <div className="hero-badge inline-flex items-center rounded-full bg-white border border-[#e9edef] px-4 py-1.5 text-[13px] text-[#54656f] font-medium mb-6 shadow-sm">
              <PenTool className="w-4 h-4 mr-2 text-[#25d366]" /> Đánh giá năng lực
            </div>
            <h1 className="hero-title text-[40px] md:text-[56px] font-medium tracking-tight mb-6 leading-tight">
              Kiểm tra trình độ miễn phí
            </h1>
            <p className="hero-desc max-w-2xl mx-auto text-[#54656f] text-[18px] leading-relaxed">
              Làm bài test 15 phút để biết chính xác trình độ hiện tại của bạn và nhận tư vấn lộ trình học tập tối ưu từ các chuyên gia.
            </p>
          </div>
        </section>
      )}

      <section className={`relative z-20 ${step === "form" ? "py-10" : "py-10 pt-24"}`}>
        <div className="max-w-[800px] px-4 sm:px-8 mx-auto">
          
          {/* STEP 1: REGISTRATION FORM */}
          {step === "form" && (
            <div className="step-container bg-white rounded-[24px] p-8 md:p-12 border border-[#e9edef] shadow-sm">
              <div className="text-center mb-10">
                <h2 className="text-[28px] font-medium text-[#111b21] tracking-tight mb-2">Đăng ký ngay</h2>
                <p className="text-[#54656f] text-[15px]">Vui lòng điền thông tin bên dưới để bắt đầu bài kiểm tra.</p>
              </div>

              <form className="space-y-6" onSubmit={handleStartTest}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[14px] font-medium text-[#111b21] flex items-center">
                      <User className="w-4 h-4 mr-2 text-[#54656f]" /> Họ và tên
                    </label>
                    <input required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="Nhập họ tên của bạn" className="w-full h-[56px] px-[16px] rounded-2xl bg-[#f0f2f5] border border-transparent outline-none focus:border-[#25d366] focus:bg-white focus:ring-2 focus:ring-[#d9fdd3] transition-all text-[#111b21]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] font-medium text-[#111b21] flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-[#54656f]" /> Số điện thoại
                    </label>
                    <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Nhập số điện thoại" className="w-full h-[56px] px-[16px] rounded-2xl bg-[#f0f2f5] border border-transparent outline-none focus:border-[#25d366] focus:bg-white focus:ring-2 focus:ring-[#d9fdd3] transition-all text-[#111b21]" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#111b21] flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-[#54656f]" /> Email (Không bắt buộc)
                  </label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Nhập địa chỉ email" className="w-full h-[56px] px-[16px] rounded-2xl bg-[#f0f2f5] border border-transparent outline-none focus:border-[#25d366] focus:bg-white focus:ring-2 focus:ring-[#d9fdd3] transition-all text-[#111b21]" />
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#111b21] mb-2 block">
                    Khóa học bạn quan tâm
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Trẻ Em', 'Thiếu Niên', 'IELTS', 'Giao Tiếp'].map((course, idx) => (
                      <label key={idx} className="relative cursor-pointer">
                        <input type="radio" name="course" value={course} checked={formData.courseInterest === course} onChange={(e) => setFormData({...formData, courseInterest: e.target.value})} className="peer sr-only" />
                        <div className="p-3 text-center text-[14px] font-medium rounded-xl border border-[#e9edef] text-[#54656f] peer-checked:border-[#25d366] peer-checked:bg-[#d9fdd3]/50 peer-checked:text-[#111b21] hover:border-[#25d366]/50 transition-all">
                          {course}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Button type="submit" disabled={isSubmitting} className="group relative overflow-hidden w-full bg-[#25d366] text-[#111b21] hover:text-white rounded-[50px] px-[24px] h-14 font-medium text-[16px] flex items-center justify-center shadow-sm border-0 transition-colors duration-300">
                    <div className="absolute inset-0 bg-[#111b21] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                    <span className="relative z-10 flex items-center">{isSubmitting ? "Đang xử lý..." : "Bắt đầu bài kiểm tra"}</span>
                  </Button>
                  <p className="text-center text-[13px] text-[#54656f] mt-4">
                    Bằng việc đăng ký, bạn đồng ý với <Link href="/chinh-sach-bao-mat" className="text-[#25d366] hover:underline">Chính sách bảo mật</Link> của chúng tôi.
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: TEST UI */}
          {step === "test" && (
            <div className="step-container bg-white rounded-[24px] p-8 md:p-12 border border-[#e9edef] shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="text-[14px] font-medium text-[#111b21] bg-[#f0f2f5] px-4 py-1.5 rounded-full">
                  Câu hỏi {currentQuestion + 1} / {testQuestions.length}
                </div>
                <div className="text-[14px] font-medium text-[#25d366]">
                  {testQuestions[currentQuestion].type}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-[#f0f2f5] rounded-full mb-10 overflow-hidden relative">
                <div 
                  className="progress-fill absolute top-0 left-0 h-full bg-[#25d366] rounded-full"
                  style={{ width: `${(currentQuestion / testQuestions.length) * 100}%` }}
                />
              </div>

              <div className="question-content">
                <h3 className="text-2xl md:text-[28px] font-medium text-[#111b21] leading-tight mb-8">
                  {testQuestions[currentQuestion].question}
                </h3>

                <div className="space-y-4">
                  {testQuestions[currentQuestion].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${
                        selectedOption === idx 
                          ? 'border-[#25d366] bg-[#d9fdd3]/20 shadow-sm' 
                          : 'border-[#e9edef] hover:border-[#25d366]/50 hover:bg-[#f0f2f5]/50'
                      }`}
                    >
                      <span className={`text-[16px] font-medium ${selectedOption === idx ? 'text-[#111b21]' : 'text-[#54656f]'}`}>
                        {String.fromCharCode(65 + idx)}. {opt}
                      </span>
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                        selectedOption === idx ? 'border-[#25d366] bg-[#25d366] text-white' : 'border-[#e9edef]'
                      }`}>
                        {selectedOption === idx && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-[#e9edef] flex justify-end">
                <Button 
                  onClick={handleNextQuestion}
                  disabled={selectedOption === null}
                  className="group relative overflow-hidden bg-[#25d366] text-[#111b21] hover:text-white rounded-[50px] px-[24px] h-14 font-medium text-[16px] flex items-center justify-center shadow-sm border-0 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-[#111b21] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                  <span className="relative z-10 flex items-center">{currentQuestion === testQuestions.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo'}</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: RESULT UI */}
          {step === "result" && (
            <div className="step-container bg-white rounded-[24px] p-8 md:p-12 border border-[#e9edef] shadow-sm text-center overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d9fdd3] rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#e9edef] rounded-full blur-3xl -ml-20 -mb-20 opacity-60"></div>
              
              <div className="relative z-10">
                <div className="result-icon w-24 h-24 bg-[#25d366] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm text-white">
                  <Trophy className="w-12 h-12" />
                </div>
                
                <h2 className="text-[28px] font-medium text-[#111b21] tracking-tight mb-4">Hoàn thành bài kiểm tra!</h2>
                <p className="text-[#54656f] text-[16px] mb-8">
                  Cảm ơn bạn đã tham gia đánh giá năng lực. Dưới đây là kết quả sơ bộ của bạn.
                </p>
                
                <div className="bg-[#f0f2f5] rounded-3xl p-8 mb-10 max-w-[400px] mx-auto border border-[#e9edef]">
                  <div className="text-[64px] font-medium text-[#111b21] leading-none mb-2">
                    {calculateScore()}/{testQuestions.length}
                  </div>
                  <div className="text-[14px] font-medium text-[#54656f] uppercase tracking-wider mt-2">
                    Câu trả lời đúng
                  </div>
                </div>

                <div className="space-y-4 max-w-[400px] mx-auto">
                  <Link href="/lien-he" className="group relative overflow-hidden w-full bg-[#25d366] text-[#111b21] hover:text-white rounded-[50px] px-[24px] h-14 font-medium text-[16px] flex items-center justify-center shadow-sm border-0 transition-colors duration-300">
                    <div className="absolute inset-0 bg-[#111b21] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                    <span className="relative z-10 flex items-center">Nhận tư vấn lộ trình học</span>
                  </Link>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setStep("form")
                      setCurrentQuestion(0)
                      setAnswers([])
                      setSelectedOption(null)
                    }}
                    className="w-full h-14 rounded-[50px] bg-white border border-[#111b21] text-[#111b21] font-medium transition-colors hover:bg-[#f0f2f5]"
                  >
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
