"use client"

import { motion } from "framer-motion"
import { BookOpen, Calendar, ChevronRight } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export default function BlogClient({ posts }: { posts: any[] }) {
  return (
    <div className="flex flex-col w-full min-h-screen pb-20">
      <section className="pt-24 pb-16 bg-[#fcf5eb] overflow-hidden">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center rounded-full bg-white border border-[#e9edef] px-4 py-1.5 text-[13px] text-[#54656f] font-medium mb-6 shadow-sm"
          >
            <BookOpen className="w-4 h-4 mr-2 text-[#25d366]" /> Kiến thức bổ ích
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[40px] md:text-[56px] font-medium tracking-tight text-[#111b21] mb-6 leading-tight"
          >
            Góc học tập RosyClass
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-[#54656f] text-[18px] leading-relaxed"
          >
            Chia sẻ phương pháp học, tài liệu luyện thi và những câu chuyện truyền cảm hứng từ các chuyên gia ngôn ngữ.
          </motion.p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto">
          {posts.length === 0 ? (
            <div className="text-center text-stone py-20">
              Chưa có bài viết nào được xuất bản.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-10">
              {posts.map((post, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  key={idx}
                  className="group flex flex-col md:flex-row gap-6 bg-white rounded-[24px] p-6 border border-[#e9edef] shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="md:w-2/5 aspect-[4/3] md:aspect-auto md:h-full relative overflow-hidden rounded-[16px] bg-[#f0f2f5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={post.thumbnail || "https://images.unsplash.com/photo-1546410531-bea518040081?auto=format&fit=crop&w=800&q=80"} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[#111b21] text-[12px] font-medium px-3 py-1 rounded-full shadow-sm">
                      Tin tức
                    </div>
                  </div>
                  
                  <div className="md:w-3/5 flex flex-col justify-center py-2">
                    <div className="flex items-center text-[#54656f] text-[13px] mb-3 font-medium">
                      <Calendar className="w-4 h-4 mr-1.5" /> {format(new Date(post.publishedAt || post.createdAt), "dd MMM, yyyy", { locale: vi })}
                    </div>
                    <h3 className="text-[22px] font-medium text-[#111b21] tracking-tight mb-3 group-hover:text-[#25d366] transition-colors leading-snug">
                      <Link href={`/goc-hoc-tap/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-[#54656f] text-[15px] leading-relaxed mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <Link href={`/goc-hoc-tap/${post.slug}`} className="inline-flex items-center text-[14px] font-medium text-[#111b21] group-hover:text-[#25d366] transition-colors mt-auto">
                      Đọc tiếp
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
