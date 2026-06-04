"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { BookOpen, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

const styleMap = [
  { color: "bg-[#25d366]", light: "bg-[#d9fdd3]" },
  { color: "bg-[#027eb5]", light: "bg-[#e2f5fd]" },
  { color: "bg-[#f5a623]", light: "bg-[#fff1c0]" },
  { color: "bg-[#8b5cf6]", light: "bg-[#ede9fe]" }
]

export default function CoursesClient({ courses }: { courses: any[] }) {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header */}
      <section className="pt-24 pb-16 bg-[#fcf5eb] overflow-hidden">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center rounded-full bg-white border border-[#e9edef] px-4 py-1.5 text-[13px] text-[#54656f] font-medium mb-6 shadow-sm"
          >
            <BookOpen className="w-4 h-4 mr-2 text-[#25d366]" /> Chương trình đào tạo
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[40px] md:text-[56px] font-medium tracking-tight text-[#111b21] mb-6 leading-tight"
          >
            Lộ trình học tập cá nhân hóa
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-[#54656f] text-[18px] leading-relaxed"
          >
            Tại RosyClass, chúng tôi tin rằng mỗi học viên đều có một xuất phát điểm và mục tiêu khác nhau. Khám phá các khóa học phù hợp nhất với bạn.
          </motion.p>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-24">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {courses.map((course, idx) => {
              const style = styleMap[idx % styleMap.length];
              const features = course.learningOutcomes ? course.learningOutcomes.split('\n').filter((f: string) => f.trim() !== '') : [];

              return (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  key={idx}
                  className="group bg-white rounded-[24px] overflow-hidden border border-[#e9edef] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  <div className={`p-8 ${style.light} relative overflow-hidden flex-shrink-0`}>
                    <span className={`inline-block px-3 py-1 bg-white rounded-full text-[12px] font-bold uppercase tracking-wider mb-4 ${style.color.replace('bg-', 'text-')}`}>
                      {course.targetAudience || course.level}
                    </span>
                    <h2 className="text-[28px] font-medium tracking-tight text-[#111b21] mb-2">{course.name}</h2>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-grow">
                    <p className="text-[#54656f] text-[15px] leading-relaxed mb-8 flex-grow">
                      {course.description}
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      {features.map((feat: string, i: number) => (
                        <div key={i} className="flex items-start text-[#111b21] text-[15px] font-medium">
                          <CheckCircle className="w-5 h-5 mr-3 text-[#25d366] shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Link href="/kiem-tra-trinh-do" className="mt-auto">
                      <Button className="group relative overflow-hidden w-full bg-[#25d366] text-[#111b21] hover:text-white rounded-[50px] px-[24px] py-[10px] h-auto font-medium text-[15px] flex items-center justify-center shadow-sm border-0 transition-colors duration-300">
                        <div className="absolute inset-0 bg-[#111b21] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                        <span className="relative z-10">Đăng ký học thử</span>
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
