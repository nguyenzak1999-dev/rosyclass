"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Star, BookOpen, Clock, Users, Award, Globe2, TrendingUp, Quote, GraduationCap, Play, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { HeroSlider } from "@/components/ui/hero-slider"
import { SiteSettings } from "@/lib/site-settings"

// Animation variants
const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const styleMap = [
  { color: "bg-primary", bgCard: "bg-paper-white" },
  { color: "bg-deep-cobalt", bgCard: "bg-paper-white" },
  { color: "bg-cornflower", bgCard: "bg-paper-white" },
  { color: "bg-signal-blue", bgCard: "bg-paper-white" }
]

// Mock data
const stats = [
  { label: "Học viên tin tưởng", value: "5,000+", icon: Users },
  { label: "Giáo viên bản ngữ", value: "50+", icon: Globe2 },
  { label: "Đạt mục tiêu đầu ra", value: "98%", icon: TrendingUp },
  { label: "Năm kinh nghiệm", value: "10+", icon: Award },
]

const teachers = [
  { name: "David Smith", role: "Giám đốc đào tạo", exp: "12 năm kinh nghiệm", img: "https://i.pravatar.cc/150?img=11", tag: "TESOL" },
  { name: "Sarah Connor", role: "Chuyên gia IELTS", exp: "8 năm kinh nghiệm", img: "https://i.pravatar.cc/150?img=5", tag: "IELTS 8.5" },
  { name: "Michael Chang", role: "Giảng viên Cao cấp", exp: "10 năm kinh nghiệm", img: "https://i.pravatar.cc/150?img=8", tag: "CELTA" },
  { name: "Emma Watson", role: "Giáo viên Kids", exp: "5 năm kinh nghiệm", img: "https://i.pravatar.cc/150?img=9", tag: "TEFL" },
]

const testimonials = [
  { 
    name: "Nguyễn Hương Giang", 
    role: "Học viên IELTS 8.0", 
    quote: "Phương pháp giảng dạy tại RosyClass rất hiện đại và thực tế. Các thầy cô không chỉ dạy kiến thức mà còn truyền cảm hứng học tập rất lớn.",
    img: "https://i.pravatar.cc/150?img=1"
  },
  { 
    name: "Trần Văn Minh", 
    role: "Phụ huynh bé Bin (Starter)", 
    quote: "Từ ngày học ở đây, bé nhà tôi mạnh dạn giao tiếp tiếng Anh hẳn. Lớp học sĩ số nhỏ giúp cô giáo theo sát được từng bé, tôi rất yên tâm.",
    img: "https://i.pravatar.cc/150?img=12"
  },
  { 
    name: "Lê Ngọc Hân", 
    role: "Học viên Tiếng Anh Giao Tiếp", 
    quote: "Lịch học linh hoạt giúp người đi làm như tôi dễ dàng sắp xếp. Chỉ sau 3 tháng, tôi đã tự tin thuyết trình bằng tiếng Anh với đối tác.",
    img: "https://i.pravatar.cc/150?img=3"
  },
]

const partners = [
  "Cambridge Assessment",
  "British Council",
  "IDP IELTS",
  "Oxford University Press",
  "Macmillan Education",
  "National Geographic"
]

export default function HomeClient({ courses, settings }: { courses: any[], settings?: SiteSettings }) {
  const featuredCourses = courses.slice(0, 3);

  return (
    <div className="flex flex-col w-full font-sans pb-32 relative overflow-hidden bg-sky-wash/50">
      
      {/* 1. Glowing Orbs Background (WOW Factor) - Simplified for performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/10 blur-[120px] opacity-70"
        />
        <div 
          className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/10 blur-[150px] opacity-50"
        />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-6 md:pt-12 pb-8 md:pb-16">
          <div className="max-w-[1200px] px-4 sm:px-8 mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full mx-auto"
            >
              <HeroSlider />
            </motion.div>
          </div>
        </section>

        {/* 2. Partners Marquee (WOW Factor) */}
        <section className="w-full py-8 border-y border-stone/10 bg-white/50 backdrop-blur-md overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-sky-wash to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-sky-wash to-transparent z-10"></div>
          
          <div className="flex w-[200%] md:w-[150%] lg:w-[120%]">
            <div className="flex items-center justify-around w-full animate-marquee">
              {/* Duplicate array for seamless loop */}
              {[...partners, ...partners].map((partner, idx) => (
                <div key={idx} className="flex-shrink-0 px-8">
                  <span className="text-xl md:text-2xl font-bold text-stone/40 uppercase tracking-widest hover:text-primary transition-colors cursor-default">{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-20">
          <div className="max-w-[1200px] px-4 sm:px-8 mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-primary/5 border border-white p-8 md:p-12"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center pt-4 md:pt-0 first:pt-4 md:first:pt-0 group">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <stat.icon className="w-7 h-7 md:w-8 md:h-8" />
                    </div>
                    <h4 className="text-3xl md:text-5xl font-bold text-midnight-ink mb-2 group-hover:text-primary transition-colors">{stat.value}</h4>
                    <p className="text-stone text-[12px] md:text-[14px] font-medium uppercase tracking-wider text-center">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="w-full py-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px" }}
            variants={staggerContainer}
            className="max-w-[1200px] px-4 sm:px-8 mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-midnight-ink tracking-tight">Vì sao chọn RosyClass?</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div variants={fadeInUp} className="p-8 rounded-[32px] bg-white border border-stone/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 cursor-default group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="text-[20px] font-bold mb-3 text-midnight-ink tracking-tight group-hover:text-primary transition-colors">Giáo viên bản ngữ</h3>
                <p className="text-stone text-[14px] leading-[1.6] tracking-tight">Đội ngũ giáo viên có chứng chỉ TESOL/CELTA với nhiều năm kinh nghiệm giảng dạy.</p>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="p-8 rounded-[32px] bg-white border border-stone/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 cursor-default group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-[20px] font-bold mb-3 text-midnight-ink tracking-tight group-hover:text-primary transition-colors">Lớp học sĩ số nhỏ</h3>
                <p className="text-stone text-[14px] leading-[1.6] tracking-tight">Tối đa 12 học viên/lớp, đảm bảo tương tác liên tục 1-1 với giáo viên trong suốt buổi học.</p>
              </motion.div>

              <motion.div variants={fadeInUp} className="p-8 rounded-[32px] bg-white border border-stone/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 cursor-default group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-[20px] font-bold mb-3 text-midnight-ink tracking-tight group-hover:text-primary transition-colors">Giáo trình chuẩn</h3>
                <p className="text-stone text-[14px] leading-[1.6] tracking-tight">Cập nhật liên tục từ các NXB uy tín như Cambridge, Oxford bám sát đề thi thực tế.</p>
              </motion.div>

              <motion.div variants={fadeInUp} className="p-8 rounded-[32px] bg-white border border-stone/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 cursor-default group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-[20px] font-bold mb-3 text-midnight-ink tracking-tight group-hover:text-primary transition-colors">Giờ học linh hoạt</h3>
                <p className="text-stone text-[14px] leading-[1.6] tracking-tight">Nhiều ca học sáng, chiều, tối giúp học viên và người đi làm dễ dàng sắp xếp thời gian.</p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* 3. Video Experience Section (WOW Factor) */}
        <section className="w-full py-20">
          <div className="max-w-[1200px] px-4 sm:px-8 mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden group cursor-pointer shadow-2xl"
            >
              {/* Background Image/Cover */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b07ceb58?q=80&w=2070&auto=format&fit=crop" 
                alt="RosyClass Campus" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-midnight-ink/40 group-hover:bg-midnight-ink/30 transition-colors duration-500" />
              
              {/* Play Button & Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 md:p-6 text-center">
                <div className="relative mb-4 md:mb-6">
                  <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping" />
                  <div className="relative w-16 h-16 md:w-24 md:h-24 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-6 h-6 md:w-10 md:h-10 text-white ml-1 md:ml-2" fill="currentColor" />
                  </div>
                </div>
                <h3 className="text-2xl md:text-5xl font-bold tracking-tight mb-2 md:mb-4">Khám phá không gian học</h3>
                <p className="text-sm md:text-xl text-white/90 max-w-xl line-clamp-2 md:line-clamp-none">Trải nghiệm môi trường học tập hiện đại, truyền cảm hứng tại hệ thống cơ sở vật chất chuẩn quốc tế của RosyClass.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="w-full py-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px" }}
            variants={staggerContainer}
            className="max-w-[1200px] px-4 sm:px-8 mx-auto"
          >
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-4 md:gap-6">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-midnight-ink tracking-tight mb-2 md:mb-4">Các khóa học tiêu biểu</h2>
                <p className="text-[16px] md:text-[18px] text-stone tracking-tight">Lộ trình được thiết kế riêng cho từng độ tuổi và mục tiêu.</p>
              </div>
              <Link href="/khoa-hoc" className="w-full md:w-auto">
                <Button variant="outline" className="w-full md:w-auto rounded-full bg-white border-stone/20 text-midnight-ink h-12 px-6 hover:-translate-y-1 hover:border-primary/50 transition-all group">
                  Xem tất cả khóa học
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {featuredCourses.map((course, idx) => {
                const style = styleMap[idx % styleMap.length];
                const tags = course.learningOutcomes ? course.learningOutcomes.split('\n').filter((f: string) => f.trim() !== '').slice(0, 3) : [];
                
                return (
                  <motion.div variants={fadeInUp} key={idx} className={`group ${style.bgCard} rounded-[32px] overflow-hidden border border-stone/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 flex flex-col`}>
                    <div className={`h-32 ${style.color} p-8 flex flex-col justify-end relative overflow-hidden transition-transform duration-500 group-hover:scale-105 origin-bottom`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
                      <span className="text-white/90 text-[12px] font-bold uppercase tracking-wider mb-2">{course.targetAudience || course.level}</span>
                      <h3 className="text-[24px] font-bold text-white tracking-tight">{course.name}</h3>
                    </div>
                    <div className="p-8 flex-1 flex flex-col z-10 bg-white">
                      <p className="text-stone text-[14px] mb-8 leading-relaxed tracking-tight flex-1">
                        {course.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {tags.map((tag: string) => (
                          <span key={tag} className="px-3 py-1 bg-sky-wash text-primary border border-primary/10 rounded-full text-[12px] font-medium tracking-tight">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link href="/khoa-hoc">
                        <Button className="w-full rounded-full bg-cloud-veil hover:bg-primary hover:text-white text-midnight-ink shadow-none h-12 transition-colors">
                          Xem chi tiết
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </section>

        {/* Teachers Section */}
        <section className="w-full py-20 bg-white/50 backdrop-blur-sm border-y border-stone/5">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-[1200px] px-4 sm:px-8 mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-midnight-ink tracking-tight mb-2 md:mb-4">Đội ngũ giáo viên</h2>
              <p className="text-[16px] md:text-[18px] text-stone tracking-tight max-w-2xl mx-auto">100% giáo viên tại RosyClass đều có chứng chỉ giảng dạy quốc tế và tâm huyết với nghề.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teachers.map((teacher, idx) => (
                <motion.div variants={fadeInUp} key={idx} className="bg-white rounded-[2rem] p-6 text-center border border-stone/10 shadow-subtle hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 group hover:-translate-y-2">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500"></div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={teacher.img} alt={teacher.name} className="w-full h-full object-cover rounded-full relative z-10 border-4 border-white" />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-midnight-ink text-white text-[10px] font-bold px-3 py-1 rounded-full z-20 whitespace-nowrap shadow-sm group-hover:bg-primary transition-colors">
                      {teacher.tag}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-midnight-ink mb-1 group-hover:text-primary transition-colors">{teacher.name}</h3>
                  <p className="text-primary font-medium text-sm mb-2">{teacher.role}</p>
                  <p className="text-stone text-xs flex items-center justify-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {teacher.exp}
                  </p>
                </motion.div>
              ))}
            </div>
            
            <motion.div variants={fadeInUp} className="text-center mt-12">
              <Link href="/giao-vien">
                <Button variant="outline" className="rounded-full bg-white border-stone/20 text-midnight-ink h-12 px-8 hover:-translate-y-1 hover:border-primary/50 transition-all group">
                  Gặp gỡ toàn bộ đội ngũ
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-[1200px] px-4 sm:px-8 mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-midnight-ink tracking-tight mb-2 md:mb-4">Học viên nói gì về chúng tôi?</h2>
              <p className="text-[16px] md:text-[18px] text-stone tracking-tight">Những câu chuyện truyền cảm hứng từ chính các học viên và phụ huynh.</p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <motion.div variants={fadeInUp} key={idx} className="bg-white rounded-[2rem] p-8 border border-stone/10 shadow-subtle hover:shadow-xl hover:border-primary/30 transition-all duration-300 relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] rounded-tr-[2rem] -z-10 transition-colors group-hover:bg-primary/10"></div>
                  <Quote className="w-10 h-10 text-primary/20 absolute top-6 right-6 group-hover:text-primary/40 transition-colors" />
                  <div className="flex text-amber-400 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-stone italic text-[15px] leading-relaxed mb-8 min-h-[100px]">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={testimonial.img} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/30 transition-all" />
                    <div>
                      <h4 className="font-bold text-midnight-ink text-sm">{testimonial.name}</h4>
                      <p className="text-primary text-xs font-medium">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-[1200px] px-4 sm:px-8 mx-auto"
          >
            <div className="bg-midnight-ink rounded-[24px] md:rounded-[32px] p-8 md:p-16 text-center text-pure-white relative overflow-hidden group shadow-2xl shadow-midnight-ink/20">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl transform group-hover:translate-x-10 group-hover:-translate-y-10 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl transform group-hover:-translate-x-10 group-hover:translate-y-10 transition-transform duration-700"></div>
              
              <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-white">
                  Bắt đầu hành trình tiếng Anh của bạn.
                </h2>
                <p className="text-white/80 text-[16px] md:text-[20px] tracking-tight">
                  Để lại thông tin để nhận được lộ trình học tập miễn phí và ưu đãi học phí lên đến 30% trong tháng này.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/lien-he">
                    <Button className="h-14 px-10 text-[16px] bg-primary text-midnight-ink hover:bg-primary/90 rounded-full w-full sm:w-auto transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(54,200,192,0.4)] font-bold">
                      Đăng ký học ngay
                    </Button>
                  </Link>
                  <Link href="/kiem-tra-trinh-do">
                    <Button variant="outline" className="h-14 px-10 text-[16px] bg-transparent border-white/30 text-white hover:bg-white/10 rounded-full w-full sm:w-auto transition-all hover:-translate-y-1">
                      Kiểm tra trình độ miễn phí
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  )
}
