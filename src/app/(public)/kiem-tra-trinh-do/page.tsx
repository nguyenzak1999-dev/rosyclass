"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { PenTool, ArrowRight, User, Phone, Mail, CheckCircle2, ChevronRight, Trophy, RefreshCcw } from "lucide-react"
import Link from "next/link"

import { submitPlacementTestLead } from "./actions"

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

  const handleStartTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Create lead before starting test
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
    <div className="flex flex-col w-full min-h-screen pb-20 bg-sky-wash">
      {/* Header (hidden in test mode for better focus) */}
      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            className="pt-16 pb-20 bg-brand-blue-gradient overflow-hidden"
          >
            <div className="max-w-[1200px] px-4 sm:px-8 mx-auto relative z-10 text-center text-pure-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-[14px] font-medium mb-6"
              >
                <PenTool className="w-4 h-4 mr-2" /> Đánh giá năng lực
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
              >
                Kiểm tra trình độ miễn phí
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-2xl mx-auto text-white/90 text-[18px] leading-relaxed"
              >
                Làm bài test 15 phút để biết chính xác trình độ hiện tại của bạn và nhận tư vấn lộ trình học tập tối ưu từ các chuyên gia.
              </motion.p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className={`relative z-20 ${step === "form" ? "py-20 -mt-10" : "py-10 pt-24"}`}>
        <div className="max-w-[800px] px-4 sm:px-8 mx-auto">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: REGISTRATION FORM */}
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="bg-pure-white rounded-[32px] p-8 md:p-12 border border-stone/10 shadow-2xl shadow-black/5"
              >
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-midnight-ink tracking-tight mb-2">Đăng ký ngay</h2>
                  <p className="text-stone text-[15px]">Vui lòng điền thông tin bên dưới để bắt đầu bài kiểm tra.</p>
                </div>

                <form className="space-y-6" onSubmit={handleStartTest}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[14px] font-medium text-midnight-ink flex items-center">
                        <User className="w-4 h-4 mr-2 text-stone" /> Họ và tên
                      </label>
                      <Input required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="Nhập họ tên của bạn" className="h-14 rounded-2xl bg-cloud-veil border-transparent focus:border-signal-blue focus:bg-white transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[14px] font-medium text-midnight-ink flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-stone" /> Số điện thoại
                      </label>
                      <Input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Nhập số điện thoại" className="h-14 rounded-2xl bg-cloud-veil border-transparent focus:border-signal-blue focus:bg-white transition-colors" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[14px] font-medium text-midnight-ink flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-stone" /> Email (Không bắt buộc)
                    </label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Nhập địa chỉ email" className="h-14 rounded-2xl bg-cloud-veil border-transparent focus:border-signal-blue focus:bg-white transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[14px] font-medium text-midnight-ink mb-2 block">
                      Khóa học bạn quan tâm
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Trẻ Em', 'Thiếu Niên', 'IELTS', 'Giao Tiếp'].map((course, idx) => (
                        <label key={idx} className="relative cursor-pointer">
                          <input type="radio" name="course" value={course} checked={formData.courseInterest === course} onChange={(e) => setFormData({...formData, courseInterest: e.target.value})} className="peer sr-only" />
                          <div className="p-3 text-center text-[14px] font-medium rounded-xl border border-stone/20 text-stone peer-checked:border-signal-blue peer-checked:bg-signal-blue/5 peer-checked:text-signal-blue hover:border-stone/40 transition-all">
                            {course}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-full bg-signal-blue hover:bg-midnight-ink text-pure-white text-[16px] font-medium shadow-lg shadow-signal-blue/20 transition-all hover:-translate-y-1">
                      {isSubmitting ? "Đang xử lý..." : "Bắt đầu bài kiểm tra"} <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <p className="text-center text-[13px] text-stone mt-4">
                      Bằng việc đăng ký, bạn đồng ý với <Link href="/chinh-sach-bao-mat" className="text-signal-blue hover:underline">Chính sách bảo mật</Link> của chúng tôi.
                    </p>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 2: TEST UI */}
            {step === "test" && (
              <motion.div
                key="test"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="bg-pure-white rounded-[32px] p-8 md:p-12 border border-stone/10 shadow-2xl shadow-black/5"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="text-[14px] font-bold text-stone bg-cloud-veil px-4 py-1.5 rounded-full">
                    Câu hỏi {currentQuestion + 1} / {testQuestions.length}
                  </div>
                  <div className="text-[14px] font-medium text-signal-blue">
                    {testQuestions[currentQuestion].type}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-cloud-veil rounded-full mb-10 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-signal-blue to-amethyst"
                    initial={{ width: `${(currentQuestion / testQuestions.length) * 100}%` }}
                    animate={{ width: `${((currentQuestion + 1) / testQuestions.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-midnight-ink leading-tight mb-8">
                  {testQuestions[currentQuestion].question}
                </h3>

                <div className="space-y-4">
                  {testQuestions[currentQuestion].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group ${
                        selectedOption === idx 
                          ? 'border-signal-blue bg-signal-blue/5 shadow-md shadow-signal-blue/10' 
                          : 'border-stone/10 hover:border-stone/30 hover:bg-cloud-veil/50'
                      }`}
                    >
                      <span className={`text-[16px] font-medium ${selectedOption === idx ? 'text-signal-blue' : 'text-midnight-ink'}`}>
                        {String.fromCharCode(65 + idx)}. {opt}
                      </span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedOption === idx ? 'border-signal-blue bg-signal-blue text-white' : 'border-stone/30'
                      }`}>
                        {selectedOption === idx && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-stone/10 flex justify-end">
                  <Button 
                    onClick={handleNextQuestion}
                    disabled={selectedOption === null}
                    className="h-14 px-8 rounded-full bg-midnight-ink hover:bg-pressed-charcoal text-pure-white text-[16px] font-medium shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentQuestion === testQuestions.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo'} 
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: RESULT UI */}
            {step === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
                className="bg-pure-white rounded-[32px] p-8 md:p-12 border border-stone/10 shadow-2xl shadow-black/5 text-center overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-signal-blue/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-tangerine/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
                
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.3, duration: 0.6 }}
                    className="w-24 h-24 bg-gradient-to-br from-signal-blue to-amethyst rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-signal-blue/30 text-white"
                  >
                    <Trophy className="w-12 h-12" />
                  </motion.div>
                  
                  <h2 className="text-3xl font-bold text-midnight-ink tracking-tight mb-4">Hoàn thành bài kiểm tra!</h2>
                  <p className="text-stone text-[16px] mb-8">
                    Cảm ơn bạn đã tham gia đánh giá năng lực. Dưới đây là kết quả sơ bộ của bạn.
                  </p>
                  
                  <div className="bg-cloud-veil rounded-3xl p-8 mb-10 max-w-[400px] mx-auto">
                    <div className="text-[64px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-signal-blue to-amethyst leading-none mb-2">
                      {calculateScore()}/{testQuestions.length}
                    </div>
                    <div className="text-[16px] font-medium text-midnight-ink uppercase tracking-wider">
                      Câu trả lời đúng
                    </div>
                  </div>

                  <div className="space-y-4 max-w-[400px] mx-auto">
                    <Button 
                      className="w-full h-14 rounded-full bg-signal-blue hover:bg-midnight-ink text-pure-white text-[16px] font-medium shadow-lg shadow-signal-blue/20 transition-all hover:-translate-y-1"
                    >
                      Nhận tư vấn lộ trình học
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setStep("form")
                        setCurrentQuestion(0)
                        setAnswers([])
                        setSelectedOption(null)
                      }}
                      className="w-full h-14 rounded-full bg-pure-white border-stone/20 text-midnight-ink font-medium transition-colors hover:bg-cloud-veil"
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" /> Làm lại từ đầu
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
