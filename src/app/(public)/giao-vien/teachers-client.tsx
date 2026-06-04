"use client"

import { motion } from "framer-motion"
import { Users, Star, Award, Heart } from "lucide-react"

export default function TeachersClient({ teachers }: { teachers: any[] }) {
  return (
    <div className="flex flex-col w-full min-h-screen pb-20">
      <section className="pt-16 pb-20 bg-lilac-gradient overflow-hidden">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center rounded-full bg-pure-white/80 backdrop-blur-md border border-stone/20 px-4 py-1.5 text-[14px] text-midnight-ink font-medium mb-6"
          >
            <Users className="w-4 h-4 mr-2 text-amethyst" /> Đội ngũ giảng viên
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-midnight-ink mb-6"
          >
            Giáo viên bản ngữ xuất sắc
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-stone text-[18px] leading-relaxed"
          >
            Tự hào sở hữu 100% đội ngũ giáo viên bản ngữ có bằng cấp quốc tế, tâm huyết và giàu kinh nghiệm giảng dạy tại Việt Nam.
          </motion.p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachers.map((teacher, idx) => {
              const certifications = teacher.certificates ? teacher.certificates.split(',').map((c: string) => c.trim()) : [];
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  key={idx}
                  className="group bg-pure-white rounded-[32px] overflow-hidden border border-stone/10 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-[4/5] relative overflow-hidden bg-cloud-veil">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={teacher.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"} 
                      alt={teacher.fullName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <p className="text-white text-sm font-medium"><Heart className="w-4 h-4 inline mr-1 text-tangerine fill-current" /> Yêu thương học viên</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-midnight-ink tracking-tight mb-1">{teacher.fullName}</h3>
                    <p className="text-signal-blue font-medium text-[15px] mb-4">{teacher.specialties || 'Teacher'}</p>
                    
                    <div className="space-y-3 pt-4 border-t border-stone/10">
                      <div className="flex items-start">
                        <Star className="w-4 h-4 mr-2 mt-0.5 text-mustard fill-current shrink-0" />
                        <span className="text-stone text-[14px] leading-tight">{teacher.bio || "Nhiều năm kinh nghiệm"}</span>
                      </div>
                      {certifications.length > 0 && (
                        <div className="flex items-start">
                          <Award className="w-4 h-4 mr-2 mt-0.5 text-amethyst shrink-0" />
                          <span className="text-stone text-[14px] leading-tight">{certifications.join(" • ")}</span>
                        </div>
                      )}
                    </div>
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
