"use client"

import { motion } from "framer-motion"
import { Target, Heart, ShieldCheck, Sparkles, Users, BookOpen, Star } from "lucide-react"

interface Stat {
  num: string
  label: string
}

export default function AboutClient({ stats }: { stats: Stat[] }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-32 bg-[#fcf5eb] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-[#d9fdd3] rounded-full blur-[100px] opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] bg-[#25d366] rounded-full blur-[120px] opacity-10"></div>
        </div>

        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center rounded-full bg-white border border-[#e9edef] px-4 py-1.5 text-[14px] text-[#54656f] font-medium mb-8 shadow-sm"
          >
            <Sparkles className="w-4 h-4 mr-2 text-[#25d366]" />
            Về RosyClass
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[48px] md:text-[72px] font-medium tracking-tight text-[#111b21] mb-8 leading-[1.1]"
          >
            Hành trình <br className="hidden md:block" />
            <span className="text-[#25d366]">truyền cảm hứng</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-[#54656f] text-[18px] md:text-[20px] leading-relaxed"
          >
            Sứ mệnh của chúng tôi là mang đến môi trường học tiếng Anh chuẩn quốc tế, trang bị cho học viên Việt Nam sự tự tin và kỹ năng để vươn ra thế giới.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-0 bg-white relative z-20">
        <div className="max-w-[1000px] px-4 sm:px-8 mx-auto -mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#e9edef] p-10 md:p-14"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className="text-4xl md:text-[56px] font-medium text-[#111b21] mb-3 leading-none tracking-tight">
                    {stat.num}
                  </div>
                  <div className="text-[14px] font-medium text-[#54656f] uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story & Vision */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-[#d9fdd3] rounded-[40px] transform -rotate-6 scale-105 opacity-60"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80" 
                alt="RosyClass Team" 
                className="relative z-10 w-full h-[600px] object-cover rounded-[40px] shadow-2xl"
              />
              
              <div className="absolute -bottom-8 -right-8 md:-bottom-12 md:-right-12 bg-white p-6 rounded-3xl shadow-xl border border-[#e9edef] z-20 max-w-[280px]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#25d366] rounded-full flex items-center justify-center text-white shrink-0">
                    <Heart className="w-7 h-7 fill-current" />
                  </div>
                  <div>
                    <div className="text-[24px] font-bold text-[#111b21] leading-none mb-1">10+ Năm</div>
                    <div className="text-[14px] text-[#54656f] font-medium leading-tight">Kinh nghiệm giảng dạy</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center"
            >
              <h2 className="text-[36px] md:text-[48px] font-medium text-[#111b21] tracking-tight mb-8 leading-[1.2]">
                Không chỉ là một nơi dạy học. Đó là <span className="text-[#25d366]">ngôi nhà thứ hai.</span>
              </h2>
              <div className="space-y-6 text-[#54656f] text-[18px] leading-relaxed">
                <p>
                  RosyClass được xây dựng từ tâm huyết của những người làm giáo dục, mong muốn tạo ra một môi trường học tập nơi mỗi học viên đều được tôn trọng, thấu hiểu và phát huy tối đa tiềm năng.
                </p>
                <p>
                  Chúng tôi tin rằng ngôn ngữ là chìa khóa vạn năng mở ra những chân trời mới. Hành trình học tiếng Anh không nên là áp lực, mà là niềm vui khám phá, kết nối và trưởng thành mỗi ngày.
                </p>
              </div>

              <div className="mt-12 space-y-8">
                <div className="flex items-start gap-5">
                  <div className="mt-1 w-14 h-14 shrink-0 bg-[#fcf5eb] rounded-2xl flex items-center justify-center text-[#25d366]">
                    <Target className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#111b21] text-[20px] mb-2">Mục tiêu rõ ràng</h4>
                    <p className="text-[16px] text-[#54656f] leading-relaxed">Lộ trình học tập được cá nhân hóa, cam kết chuẩn đầu ra rõ ràng cho từng khóa học và từng học viên.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="mt-1 w-14 h-14 shrink-0 bg-[#fcf5eb] rounded-2xl flex items-center justify-center text-[#25d366]">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#111b21] text-[20px] mb-2">Chất lượng quốc tế</h4>
                    <p className="text-[16px] text-[#54656f] leading-relaxed">Áp dụng giáo trình chuẩn quốc tế kết hợp cùng phương pháp giảng dạy hiện đại, tương tác cao.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-[#f0f2f5] border-t border-[#e9edef]">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[36px] md:text-[48px] font-medium text-[#111b21] tracking-tight mb-6 leading-[1.2]"
            >
              Giá trị cốt lõi
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[#54656f] text-[18px] leading-relaxed"
            >
              Những nguyên tắc định hướng cho mọi hoạt động giảng dạy và vận hành tại RosyClass.
            </motion.p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Users className="w-8 h-8" />,
                title: "Học viên là trung tâm",
                desc: "Mọi phương pháp, bài giảng đều được thiết kế xoay quanh sự phát triển và nhu cầu thực tế của người học."
              },
              {
                icon: <BookOpen className="w-8 h-8" />,
                title: "Học thật, giá trị thật",
                desc: "Chú trọng vào khả năng ứng dụng ngôn ngữ thực tế, không học vẹt, không chạy theo thành tích ảo."
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Không ngừng đổi mới",
                desc: "Liên tục cập nhật kiến thức, công nghệ và phương pháp giáo dục tiên tiến nhất trên thế giới."
              }
            ].map((value, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="bg-white p-10 rounded-[32px] border border-[#e9edef] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-[#fcf5eb] rounded-2xl flex items-center justify-center text-[#25d366] mb-8 group-hover:scale-110 group-hover:bg-[#25d366] group-hover:text-white transition-all duration-300">
                  {value.icon}
                </div>
                <h3 className="text-[24px] font-medium text-[#111b21] mb-4 tracking-tight">{value.title}</h3>
                <p className="text-[#54656f] text-[16px] leading-relaxed">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
