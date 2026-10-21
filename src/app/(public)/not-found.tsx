import { BookOpen, Home } from "lucide-react"
import { Cloud, KidButton, RosyMascot, Sparkle, Star, toneClasses } from "@/components/kids"

// Trang 404 cho các route công khai (hiển thị khi gọi notFound() trong nhóm (public)).
// Next.js tự chèn meta robots noindex cho phản hồi 404.
export default function PublicNotFound() {
  const digits = [
    { char: "4", tone: "rose" as const, tilt: "-rotate-6" },
    { char: "0", tone: "sun" as const, tilt: "rotate-3" },
    { char: "4", tone: "sky" as const, tilt: "-rotate-3" },
  ]

  return (
    <section className="relative overflow-hidden bg-kid-grape-soft">
      <div aria-hidden="true" className="kid-dots pointer-events-none absolute inset-0 opacity-70" />
      <Cloud className="kid-float-slow pointer-events-none absolute top-10 -left-6 h-14 w-28 md:left-[6%]" />
      <Cloud className="kid-float pointer-events-none absolute right-[-20px] bottom-24 hidden h-16 w-32 md:block" />
      <Star className="kid-float pointer-events-none absolute top-16 right-[10%] h-10 w-10 rotate-12" />
      <Sparkle className="kid-spin-slow pointer-events-none absolute bottom-20 left-[12%] h-8 w-8 fill-kid-rose" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-80px)] max-w-[760px] flex-col items-center justify-center px-4 py-16 text-center sm:px-8">
        <div aria-hidden="true" className="kid-rise mb-6 flex items-end justify-center gap-2 sm:gap-4">
          {digits.map((digit, i) =>
            digit.char === "0" ? (
              <RosyMascot key={i} mood="wow" className="kid-float h-28 w-28 sm:h-36 sm:w-36" />
            ) : (
              <span
                key={i}
                className={`kid-border kid-shadow flex h-24 w-20 items-center justify-center rounded-kid font-kid-display text-[72px] leading-none font-extrabold text-kid-ink sm:h-32 sm:w-28 sm:text-[100px] ${toneClasses[digit.tone].soft} ${digit.tilt}`}
              >
                {digit.char}
              </span>
            )
          )}
        </div>

        <p className="kid-border-2 mb-4 rotate-[-2deg] rounded-full bg-white px-4 py-1 font-kid-display text-[15px] font-bold text-kid-ink">
          Lỗi 404
        </p>
        <h1 className="kid-rise text-[34px] leading-[1.1] font-extrabold text-kid-ink [--kid-delay:0.1s] md:text-[52px]">
          Ôi! Không tìm thấy trang này
        </h1>
        <p className="kid-rise mt-4 max-w-[520px] text-[17px] leading-relaxed text-kid-ink-soft [--kid-delay:0.2s] md:text-[19px]">
          Trang bạn tìm có thể đã được đổi tên hoặc không còn tồn tại. Cùng quay lại và khám phá tiếp nhé!
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <KidButton href="/" tone="rose" size="lg" className="text-kid-ink">
            <Home className="h-5 w-5" aria-hidden="true" />
            Về trang chủ
          </KidButton>
          <KidButton href="/khoa-hoc" tone="white" size="lg">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            Xem khóa học
          </KidButton>
        </div>
      </div>
    </section>
  )
}
