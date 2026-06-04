"use client"

import { motion } from "framer-motion"
import { BookOpen, Calendar, ChevronRight } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export default function BlogClient({ posts }: { posts: any[] }) {
  return (
    <div className="flex flex-col w-full min-h-screen pb-20">
      <section className="pt-16 pb-20 bg-sunset-gradient overflow-hidden">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center rounded-full bg-pure-white/80 backdrop-blur-md border border-stone/20 px-4 py-1.5 text-[14px] text-midnight-ink font-medium mb-6"
          >
            <BookOpen className="w-4 h-4 mr-2 text-tangerine" /> Kiến thức bổ ích
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-midnight-ink mb-6"
          >
            Góc học tập RosyClass
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-stone text-[18px] leading-relaxed"
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
                  className="group flex flex-col md:flex-row gap-6 bg-pure-white rounded-[32px] p-6 border border-stone/10 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="md:w-2/5 aspect-[4/3] md:aspect-auto md:h-full relative overflow-hidden rounded-[20px] bg-cloud-veil">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={post.thumbnail || "https://images.unsplash.com/photo-1546410531-bea518040081?auto=format&fit=crop&w=800&q=80"} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-midnight-ink text-[12px] font-bold px-3 py-1 rounded-full">
                      Tin tức
                    </div>
                  </div>
                  
                  <div className="md:w-3/5 flex flex-col justify-center">
                    <div className="flex items-center text-stone text-[13px] mb-3">
                      <Calendar className="w-4 h-4 mr-1.5" /> {format(new Date(post.publishedAt || post.createdAt), "dd MMM, yyyy", { locale: vi })}
                    </div>
                    <h3 className="text-xl font-bold text-midnight-ink tracking-tight mb-3 group-hover:text-signal-blue transition-colors leading-tight">
                      <Link href={`/goc-hoc-tap/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-stone text-[14px] leading-relaxed mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <Link href={`/goc-hoc-tap/${post.slug}`} className="inline-flex items-center text-[14px] font-bold text-midnight-ink group-hover:text-signal-blue transition-colors mt-auto">
                      Đọc tiếp <ChevronRight className="w-4 h-4 ml-1" />
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
