"use client"

import { motion } from "framer-motion"
import { Target, Heart, ShieldCheck, Trophy } from "lucide-react"

interface Stat {
  num: string
  label: string
}

export default function AboutClient({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex flex-col w-full min-h-screen pb-20">
      <section className="pt-16 pb-20 bg-buttery-gradient overflow-hidden">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center rounded-full bg-pure-white/80 backdrop-blur-md border border-stone/20 px-4 py-1.5 text-[14px] text-midnight-ink font-medium mb-6"
          >
            <Heart className="w-4 h-4 mr-2 text-mustard" /> Về RosyClass
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-midnight-ink mb-6"
          >
            Hành trình truyền cảm hứng
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-stone text-[18px] leading-relaxed"
          >
            Được thành lập với sứ mệnh mang môi trường học tiếng Anh chuẩn quốc tế đến với học viên Việt Nam, giúp các bạn tự tin vươn ra thế giới.
          </motion.p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-midnight-ink tracking-tight mb-6">Tầm nhìn & Sứ mệnh</h2>
              <p className="text-stone text-[16px] leading-relaxed mb-6">
                RosyClass không chỉ là nơi dạy tiếng Anh, mà còn là một ngôi nhà thứ hai, nơi khơi dậy niềm đam mê học hỏi và khám phá tiềm năng của mỗi học viên.
              </p>
              <p className="text-stone text-[16px] leading-relaxed mb-8">
                Chúng tôi tin rằng ngôn ngữ là chìa khóa mở ra vô vàn cơ hội trong tương lai. Sứ mệnh của chúng tôi là trang bị cho thế hệ trẻ sự tự tin và kỹ năng cần thiết để trở thành những công dân toàn cầu.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <div className="w-12 h-12 bg-signal-blue/10 rounded-2xl flex items-center justify-center text-signal-blue">
                    <Target className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-midnight-ink text-[18px]">Mục tiêu rõ ràng</h4>
                  <p className="text-[14px] text-stone">Cam kết chuẩn đầu ra cho từng khóa học.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="w-12 h-12 bg-amethyst/10 rounded-2xl flex items-center justify-center text-amethyst">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-midnight-ink text-[18px]">Chất lượng</h4>
                  <p className="text-[14px] text-stone">Giáo trình quốc tế & phương pháp hiện đại.</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-sunset-gradient rounded-[32px] blur-2xl transform rotate-3 scale-105 opacity-50"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80" 
                alt="RosyClass Team" 
                className="relative z-10 w-full h-[500px] object-cover rounded-[32px] border border-stone/10 shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Real Stats from DB */}
      <section className="py-20 bg-paper-white border-y border-stone/5">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Trophy className="w-16 h-16 mx-auto text-tangerine mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold text-midnight-ink tracking-tight mb-16">Thành tựu đạt được</h2>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-signal-blue to-amethyst mb-2">
                  {stat.num}
                </div>
                <div className="text-[15px] font-medium text-stone uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
