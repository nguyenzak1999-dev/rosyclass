"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Target, Heart, ShieldCheck, Sparkles, Users, BookOpen, Star as StarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Blob,
  KidButton,
  PageHero,
  RosyMascot,
  SectionHeading,
  Sparkle,
  Star,
  WaveDivider,
  readableSolid,
  toneAt,
  toneClasses,
} from "@/components/kids"

interface Stat {
  num: string
  label: string
}

const values = [
  {
    Icon: Users,
    title: "Bé là trung tâm",
    desc: "Mỗi bài học được thiết kế theo lứa tuổi, tính cách và nhịp phát triển của từng bé, để con học mà như chơi.",
  },
  {
    Icon: BookOpen,
    title: "Học thật, giá trị thật",
    desc: "Trong mỗi buổi học, bé được nghe, nói, hát và vận động bằng tiếng Anh — không học vẹt, không chạy theo thành tích, không tạo áp lực cho con.",
  },
  {
    Icon: StarIcon,
    title: "Đồng hành cùng ba mẹ",
    desc: "Trung tâm thường xuyên trao đổi với ba mẹ về việc học của con, để gia đình và lớp học cùng giúp bé tiến bộ.",
  },
]

const pillars = [
  {
    Icon: Target,
    title: "Mục tiêu rõ ràng",
    desc: "Mỗi chương trình có mục tiêu rõ ràng theo độ tuổi và cấp lớp, giúp ba mẹ biết con đang học gì và tiến bộ ra sao.",
    tone: "sky" as const,
  },
  {
    Icon: ShieldCheck,
    title: "Lớp học an toàn, thân thiện",
    desc: "Giáo trình phù hợp với trẻ nhỏ, kết hợp trò chơi, bài hát và hoạt động tương tác để bé hứng thú với tiếng Anh.",
    tone: "mint" as const,
  },
]

export default function AboutClient({ stats, imageUrl }: { stats: Stat[]; imageUrl: string }) {
  const reduceMotion = useReducedMotion()
  const rise = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { type: "spring" as const, stiffness: 150, damping: 18, delay },
        }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHero
        tone="rose"
        eyebrow="Về RosyClass"
        eyebrowIcon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
        title="Nơi bé yêu tiếng Anh"
        highlight="yêu tiếng Anh"
        description="RosyClass là trung tâm tiếng Anh dành riêng cho các bé mầm non (3–5 tuổi) và tiểu học (lớp 1–5) tại Dương Xá, Gia Lâm, Hà Nội. Chúng tôi mong mỗi bé đều được làm quen với tiếng Anh một cách tự nhiên, vui vẻ và tự tin."
        contentClassName="md:pb-36"
      />

      {/* Stats */}
      <section className="relative z-20 -mt-10 md:-mt-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-8">
          <motion.div {...rise(0.1)} className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {stats.map((stat, idx) => {
              const tone = toneAt(idx + 1)
              return (
                <div
                  key={idx}
                  className={cn(
                    "kid-border kid-shadow kid-pop flex flex-col items-center justify-center rounded-kid px-3 py-6 text-center md:py-8",
                    toneClasses[tone].soft,
                    idx % 2 === 0 ? "-rotate-2" : "rotate-2"
                  )}
                >
                  <div className="font-kid-display text-[30px] leading-none font-extrabold break-words text-kid-ink md:text-[48px]">
                    {stat.num}
                  </div>
                  <div className="mt-2 text-[14px] font-bold text-kid-ink-soft md:text-[15px]">{stat.label}</div>
                </div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Story & Vision */}
      <section className="overflow-hidden py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
          <div className="grid items-center gap-16 md:grid-cols-2 md:gap-20">
            <motion.div {...rise()} className="relative mx-auto w-full max-w-[520px]">
              <Blob className="pointer-events-none absolute -top-10 -left-10 h-[115%] w-[115%] fill-kid-sun-soft" />
              <span aria-hidden="true" className="kid-border absolute inset-0 translate-x-3 translate-y-3 rotate-3 rounded-kid-lg bg-kid-mint" />
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Lớp học tại RosyClass"
                  className="kid-border relative z-10 h-[380px] w-full -rotate-2 rounded-kid-lg object-cover md:h-[520px]"
                />
              ) : (
                <div className="kid-border relative z-10 flex h-[380px] w-full -rotate-2 flex-col items-center justify-center gap-4 rounded-kid-lg bg-white px-8 text-center text-kid-ink-soft md:h-[520px]">
                  <RosyMascot mood="happy" className="h-32 w-32" />
                  Chưa có ảnh giới thiệu trong CMS.
                </div>
              )}

              <div className="kid-border kid-shadow absolute -right-2 -bottom-8 z-20 max-w-[260px] rotate-3 rounded-kid bg-white p-4 md:-right-10 md:-bottom-10 md:p-5">
                <div className="flex items-center gap-3">
                  <div className="kid-border-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-kid-rose text-white">
                    <Heart className="h-6 w-6 fill-current" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="mb-1 font-kid-display text-[24px] leading-none font-extrabold text-kid-ink">3–11 tuổi</div>
                    <div className="text-[14px] leading-tight font-semibold text-kid-ink-soft">Mầm non &amp; Tiểu học</div>
                  </div>
                </div>
              </div>
              <Star className="kid-float absolute -top-6 right-6 z-20 h-12 w-12 rotate-12" />
            </motion.div>

            <motion.div {...rise(0.1)} className="flex flex-col justify-center">
              <h2 className="mb-8 text-[34px] leading-[1.15] font-extrabold text-kid-ink md:text-[46px]">
                Không chỉ là nơi học tiếng Anh. Đó là{" "}
                <span className="relative inline-block text-kid-rose">
                  ngôi nhà thứ hai.
                  <Sparkle className="absolute -top-4 -right-6 h-6 w-6 fill-kid-sun" />
                </span>
              </h2>
              <div className="space-y-5 text-[17px] leading-relaxed text-kid-ink-soft md:text-[18px]">
                <p>
                  RosyClass được xây dựng từ tâm huyết của những người làm giáo dục, mong muốn tạo ra một lớp học ấm áp, nơi mỗi bé đều được yêu thương, thấu hiểu và khích lệ để tự tin thể hiện mình.
                </p>
                <p>
                  Chúng tôi tin rằng với trẻ nhỏ, học tiếng Anh không nên là áp lực, mà là niềm vui khám phá mỗi ngày — qua bài hát, câu chuyện, trò chơi và những người bạn cùng lớp.
                </p>
              </div>

              <div className="mt-10 space-y-5">
                {pillars.map((pillar) => (
                  <div key={pillar.title} className={cn("kid-border kid-shadow-sm flex items-start gap-4 rounded-kid p-5", toneClasses[pillar.tone].soft)}>
                    <div className={cn("kid-border-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", readableSolid(pillar.tone))}>
                      <pillar.Icon className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-[20px] font-extrabold text-kid-ink">{pillar.title}</h3>
                      <p className="text-[16px] leading-relaxed text-kid-ink-soft">{pillar.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative bg-kid-sky-soft">
        <WaveDivider className="text-kid-cream" flip />
        <div className="kid-dots pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1200px] px-4 py-16 sm:px-8 md:py-20">
          <motion.div {...rise()}>
            <SectionHeading
              title="Giá trị cốt lõi"
              highlight="cốt lõi"
              description="Những điều RosyClass luôn giữ khi chăm sóc và dạy tiếng Anh cho các bé."
              className="mb-14"
            />
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {values.map((value, idx) => {
              const tone = toneAt(idx * 2)
              return (
                <motion.div key={value.title} {...rise(idx * 0.08)}>
                  <div
                    className={cn(
                      "kid-border kid-shadow kid-pop group h-full rounded-kid-lg bg-white p-8 md:p-9",
                      idx === 1 ? "md:translate-y-6" : null
                    )}
                  >
                    <div
                      className={cn(
                        "kid-border mb-7 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6",
                        readableSolid(tone)
                      )}
                    >
                      <value.Icon className="h-8 w-8" strokeWidth={2.5} aria-hidden="true" />
                    </div>
                    <h3 className="mb-3 text-[24px] font-extrabold text-kid-ink">{value.title}</h3>
                    <p className="text-[16px] leading-relaxed text-kid-ink-soft">{value.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-20 flex flex-wrap justify-center gap-3">
            <KidButton href="/dang-ky" tone="rose" size="lg" className="text-kid-ink">
              Đăng ký học thử
            </KidButton>
            <KidButton href="/giao-vien" tone="white" size="lg">
              Xem đội ngũ
            </KidButton>
          </div>
        </div>
        <WaveDivider className="text-kid-cream" />
      </section>
    </div>
  )
}
