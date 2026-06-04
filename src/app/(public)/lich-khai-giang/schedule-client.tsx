"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, MapPin, User, Clock, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type ClassData = {
  id: string
  name: string
  level: string
  startDate: string
  schedule: string
  branch: string
  teacher: string
  status: string
  spotsLeft: number
}

const levels = [
  { id: "all", label: "Tất cả" },
  { id: "kids", label: "Trẻ em" },
  { id: "teens", label: "Thiếu niên" },
  { id: "ielts", label: "IELTS" },
  { id: "communication", label: "Giao tiếp" },
]

export function ScheduleClient({ initialClasses }: { initialClasses: ClassData[] }) {
  const [activeLevel, setActiveLevel] = useState("all")

  const filteredClasses = initialClasses.filter(c => 
    activeLevel === "all" ? true : c.level === activeLevel
  )

  // Format date: YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-")
    return `${day}/${month}/${year}`
  }

  return (
    <div className="pb-24">
      {/* Hero Header */}
      <section className="bg-white py-16 md:py-24 border-b border-stone/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-midnight-ink tracking-tight mb-6">
              Lịch khai giảng
            </h1>
            <p className="text-lg text-stone leading-relaxed">
              Cập nhật lịch mở lớp mới nhất. Đăng ký sớm để nhận ưu đãi và giữ chỗ vì số lượng học viên mỗi lớp có hạn.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-12">
            {levels.map(level => (
              <Button
                key={level.id}
                variant={activeLevel === level.id ? "default" : "outline"}
                className={activeLevel === level.id ? "bg-midnight-ink text-white" : "bg-white"}
                onClick={() => setActiveLevel(level.id)}
                size="sm"
              >
                {level.label}
              </Button>
            ))}
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls, index) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-3xl p-6 shadow-subtle border border-stone/10 hover:border-mint/30 hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden"
                >
                  {cls.status === "full" && (
                    <div className="absolute top-4 right-[-30px] bg-red-500 text-white text-[10px] font-bold px-8 py-1 rotate-45 z-10 shadow-sm">
                      ĐÃ ĐẦY
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="bg-mint/10 text-midnight-ink border-0 px-3 py-1 text-xs">
                      {levels.find(l => l.id === cls.level)?.label}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold text-midnight-ink mb-4 group-hover:text-mint transition-colors">
                    {cls.name}
                  </h3>

                  <div className="space-y-3 mb-8 flex-1">
                    <div className="flex items-center text-sm text-stone">
                      <Calendar className="w-4 h-4 mr-3 text-mint shrink-0" />
                      Khách giảng: <span className="font-semibold text-midnight-ink ml-1">{formatDate(cls.startDate)}</span>
                    </div>
                    <div className="flex items-center text-sm text-stone">
                      <Clock className="w-4 h-4 mr-3 text-mint shrink-0" />
                      Lịch học: <span className="text-midnight-ink ml-1">{cls.schedule}</span>
                    </div>
                    <div className="flex items-center text-sm text-stone">
                      <MapPin className="w-4 h-4 mr-3 text-mint shrink-0" />
                      Cơ sở: <span className="text-midnight-ink ml-1">{cls.branch}</span>
                    </div>
                    <div className="flex items-center text-sm text-stone">
                      <User className="w-4 h-4 mr-3 text-mint shrink-0" />
                      Giáo viên: <span className="text-midnight-ink ml-1">{cls.teacher}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone/10 mt-auto flex items-center justify-between">
                    {cls.status === "opening" ? (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        Còn {cls.spotsLeft} chỗ
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md">
                        Hết chỗ
                      </span>
                    )}
                    
                    <Link 
                      href={cls.status === "full" ? "#" : `/lien-he?course=${cls.id}`}
                      className={`inline-flex items-center justify-center text-sm font-medium transition-colors px-0 py-2 ${cls.status === "full" ? "text-stone opacity-50 cursor-not-allowed pointer-events-none" : "text-midnight-ink hover:text-mint"}`}
                    >
                      Đăng ký ngay <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-stone/10">
                <p className="text-stone">Không có lớp học nào đang mở cho cấp độ này.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveLevel("all")}
                >
                  Xem tất cả các lớp
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
