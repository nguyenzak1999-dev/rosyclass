"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { BookOpen, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

const styleMap = [
  { color: "bg-tangerine", gradient: "from-tangerine to-mustard" },
  { color: "bg-signal-blue", gradient: "from-signal-blue to-cornflower" },
  { color: "bg-amethyst", gradient: "from-amethyst to-signal-blue" },
  { color: "bg-mustard", gradient: "from-mustard to-tangerine" }
]

export default function CoursesClient({ courses }: { courses: any[] }) {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header */}
      <section className="pt-16 pb-20 bg-sky-gradient overflow-hidden">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center rounded-full bg-pure-white/80 backdrop-blur-md border border-stone/20 px-4 py-1.5 text-[14px] text-midnight-ink font-medium mb-6"
          >
            <BookOpen className="w-4 h-4 mr-2 text-signal-blue" /> Chương trình đào tạo
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-midnight-ink mb-6"
          >
            Lộ trình học tập cá nhân hóa
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-stone text-[18px] leading-relaxed"
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
                  className="group bg-pure-white rounded-[32px] overflow-hidden border border-stone/10 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className={`p-10 text-white bg-gradient-to-br ${style.gradient} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
                    <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[12px] font-bold uppercase tracking-wider mb-4">
                      {course.targetAudience || course.level}
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight mb-2 relative z-10">{course.name}</h2>
                  </div>
                  
                  <div className="p-10">
                    <p className="text-stone text-[16px] leading-relaxed mb-8">
                      {course.description}
                    </p>
                    
                    <div className="space-y-4 mb-10">
                      {features.map((feat: string, i: number) => (
                        <div key={i} className="flex items-center text-midnight-ink font-medium">
                          <CheckCircle className="w-5 h-5 mr-3 text-signal-blue" />
                          {feat}
                        </div>
                      ))}
                    </div>
                    
                    <Link href="/kiem-tra-trinh-do">
                      <Button className="w-full h-14 rounded-full bg-cloud-veil hover:bg-stone/20 text-midnight-ink font-medium shadow-none transition-colors group-hover:bg-midnight-ink group-hover:text-pure-white">
                        Đăng ký học thử <ArrowRight className="w-4 h-4 ml-2" />
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
