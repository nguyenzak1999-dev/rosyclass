"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Calendar, MapPin, User, Clock, X, PartyPopper } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Confetti,
  EmptyState,
  KidButton,
  KidField,
  KidInput,
  KidLabel,
  PageHero,
  RosyMascot,
  toneAt,
  toneClasses,
  type KidTone,
} from "@/components/kids"
import { submitClassRegistration } from "./actions"

type ClassData = {
  id: string
  courseId: string
  name: string
  level: string
  startDate: string
  schedule: string
  branch: string
  teacher: string
  status: string
  spotsLeft: number
}

const levels: { id: string; label: string; tone: KidTone }[] = [
  { id: "all", label: "Tất cả", tone: "sun" },
  { id: "kids", label: "Trẻ em", tone: "rose" },
  { id: "teens", label: "Thiếu niên", tone: "sky" },
  { id: "ielts", label: "IELTS", tone: "grape" },
  { id: "communication", label: "Giao tiếp", tone: "mint" },
]

type RegisterModalProps = {
  cls: ClassData | null
  onClose: () => void
}

function RegisterModal({ cls, onClose }: RegisterModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({ fullName: "", phone: "", email: "" })
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  // Esc để đóng, khoá cuộn nền và đưa focus vào hộp thoại
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  if (!cls) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const result = await submitClassRegistration({
      fullName: formData.fullName,
      phone: formData.phone,
        email: formData.email || undefined,
        className: cls.name,
        classId: cls.id,
        courseId: cls.courseId,
      })

    setIsSubmitting(false)

    if (result.success) {
      setIsSuccess(true)
      toast.success("Đăng ký thành công! Chúng tôi sẽ liên hệ xác nhận sớm nhất.")
    } else {
      toast.error(result.error || "Có lỗi xảy ra, vui lòng thử lại.")
    }
  }

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div aria-hidden="true" className="absolute inset-0 bg-kid-ink/55 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="kid-border kid-shadow-lg kid-bounce-in relative max-h-[calc(100dvh-2rem)] w-full max-w-[500px] overflow-y-auto rounded-kid-lg bg-white p-6 sm:p-8 md:p-10"
      >
        <span aria-hidden="true" className="kid-dots pointer-events-none absolute inset-x-0 top-0 h-28 rounded-t-[36px] bg-kid-sun-soft" />

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="kid-pop kid-border-2 kid-focus absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-kid-ink"
        >
          <X className="h-5 w-5" strokeWidth={3} />
        </button>

        {isSuccess ? (
          <div className="relative z-10 flex flex-col items-center py-6 text-center">
            <Confetti className="-top-10" />
            <RosyMascot mood="happy" className="kid-float mb-4 h-28 w-28" />
            <h3 id={titleId} className="mb-2 text-[28px] font-extrabold text-kid-ink">
              Đã gửi thành công!
            </h3>
            <p className="mb-6 text-[16px] text-kid-ink-soft">
              Chúng tôi sẽ liên hệ để xác nhận chỗ đăng ký vào lớp{" "}
              <span className="font-bold text-kid-ink">{cls.name}</span>.
            </p>
            <KidButton type="button" onClick={onClose} tone="sun">
              Đóng
            </KidButton>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="mb-6 pr-10">
              <span className="kid-border-2 inline-flex items-center gap-1.5 rounded-full bg-kid-rose-soft px-3 py-0.5 font-kid-display text-[14px] font-bold text-kid-ink">
                <PartyPopper className="h-4 w-4" aria-hidden="true" />
                Đăng ký lớp học
              </span>
              <h3 id={titleId} className="mt-3 text-[24px] leading-snug font-extrabold text-kid-ink">
                {cls.name}
              </h3>
              <p className="mt-1 text-[15px] text-kid-ink-soft">
                {cls.schedule} · {cls.branch}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <KidField>
                <KidLabel htmlFor="schedule-fullName" required>
                  Họ và tên
                </KidLabel>
                <KidInput
                  id="schedule-fullName"
                  required
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </KidField>

              <KidField>
                <KidLabel htmlFor="schedule-phone" required>
                  Số điện thoại
                </KidLabel>
                <KidInput
                  id="schedule-phone"
                  required
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09xxxx..."
                />
              </KidField>

              <KidField>
                <KidLabel htmlFor="schedule-email">Email (không bắt buộc)</KidLabel>
                <KidInput
                  id="schedule-email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                />
              </KidField>

              <KidButton type="submit" disabled={isSubmitting} tone="rose" size="lg" className="mt-2 w-full text-kid-ink h-auto min-h-14 py-3 whitespace-normal leading-tight">
                {isSubmitting ? "Đang gửi..." : "Xác nhận đăng ký"}
              </KidButton>

              <p className="text-center text-[13px] text-kid-ink-soft">
                Thông tin của bạn được bảo mật và chỉ dùng để liên hệ tư vấn.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export function ScheduleClient({ initialClasses }: { initialClasses: ClassData[] }) {
  const [activeLevel, setActiveLevel] = useState("all")
  const [registeringClass, setRegisteringClass] = useState<ClassData | null>(null)

  const filteredClasses = initialClasses.filter(c =>
    activeLevel === "all" ? true : c.level === activeLevel
  )

  // Format date: YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa cập nhật"
    const [year, month, day] = dateString.split("-")
    return `${day}/${month}/${year}`
  }

  return (
    <>
      {/* Registration Modal */}
      {registeringClass && (
        <RegisterModal
          cls={registeringClass}
          onClose={() => setRegisteringClass(null)}
        />
      )}

      <div className="flex min-h-screen w-full flex-col pb-24">
        <PageHero
          tone="orange"
          eyebrow="Kế hoạch học tập"
          eyebrowIcon={<Calendar className="h-4 w-4" aria-hidden="true" />}
          title="Lịch khai giảng"
          highlight="khai giảng"
          description="Cập nhật lịch mở lớp mới nhất. Đăng ký sớm để nhận ưu đãi và giữ chỗ vì số lượng học viên mỗi lớp có hạn."
        />

        <section className="pt-8 md:pt-12">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
            {/* Filters */}
            <div role="group" aria-label="Lọc theo cấp độ" className="mb-12 flex flex-wrap items-center justify-center gap-3">
              {levels.map(level => {
                const active = activeLevel === level.id
                return (
                  <button
                    key={level.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveLevel(level.id)}
                    className={cn(
                      "kid-pop kid-focus h-12 rounded-full border-[3px] border-kid-ink px-5 font-kid-display text-[17px] font-bold text-kid-ink",
                      active ? cn(toneClasses[level.tone].soft, "kid-shadow-sm -rotate-2") : "bg-white shadow-[0_2px_0_0_var(--color-kid-ink)]"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn("mr-2 inline-block h-3 w-3 rounded-full border-2 border-kid-ink align-middle", toneClasses[level.tone].solid)}
                    />
                    {level.label}
                  </button>
                )
              })}
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls, i) => {
                  const levelInfo = levels.find(l => l.id === cls.level)
                  const tone = levelInfo?.tone ?? toneAt(i)
                  const full = cls.status === "full"
                  return (
                    <article
                      key={cls.id}
                      className={cn(
                        "kid-border kid-shadow kid-pop relative flex h-full flex-col overflow-hidden rounded-kid bg-white",
                        i % 3 === 1 ? "md:rotate-[0.6deg]" : i % 3 === 2 ? "md:-rotate-[0.6deg]" : null
                      )}
                    >
                      <div className={cn("relative border-b-[3px] border-kid-ink px-6 pt-5 pb-4", toneClasses[tone].soft)}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="kid-border-2 inline-flex items-center rounded-full bg-white px-3 py-0.5 text-[13px] font-bold text-kid-ink">
                            {levelInfo?.label}
                          </span>
                          {full && (
                            <span className="kid-border-2 rotate-6 rounded-lg bg-[#e11d48] px-2.5 py-0.5 font-kid-display text-[13px] font-extrabold tracking-[0.15em] text-white uppercase">
                              ĐÃ ĐẦY
                            </span>
                          )}
                        </div>
                        <h3 className="text-[22px] leading-snug font-extrabold text-kid-ink">{cls.name}</h3>
                      </div>

                      <dl className="flex-1 space-y-3 p-6 text-[15px]">
                        {[
                          { Icon: Calendar, label: "Khai giảng:", value: formatDate(cls.startDate) },
                          { Icon: Clock, label: "Lịch học:", value: cls.schedule },
                          { Icon: MapPin, label: "Cơ sở:", value: cls.branch },
                          { Icon: User, label: "Giáo viên:", value: cls.teacher },
                        ].map((row) => (
                          <div key={row.label} className="flex items-start gap-3">
                            <row.Icon className="mt-0.5 h-5 w-5 shrink-0 text-kid-ink" aria-hidden="true" />
                            <dt className="shrink-0 text-kid-ink-soft">{row.label}</dt>
                            <dd className="min-w-0 font-bold text-kid-ink">{row.value}</dd>
                          </div>
                        ))}
                      </dl>

                      <div className="mt-auto flex items-center justify-between gap-3 border-t-[3px] border-dashed border-kid-ink/15 px-6 py-5">
                        {cls.status === "opening" ? (
                          <span className="kid-border-2 rounded-full bg-kid-mint-soft px-3 py-1 text-[14px] font-bold text-kid-ink">
                            Còn {cls.spotsLeft} chỗ
                          </span>
                        ) : (
                          <span className="kid-border-2 rounded-full bg-kid-rose-soft px-3 py-1 text-[14px] font-bold text-[#b0124a]">
                            Hết chỗ
                          </span>
                        )}

                        <KidButton
                          type="button"
                          tone={full ? "white" : "sun"}
                          size="sm"
                          disabled={full}
                          onClick={() => !full && setRegisteringClass(cls)}
                        >
                          Đăng ký ngay
                        </KidButton>
                      </div>
                    </article>
                  )
                })
              ) : (
                <EmptyState
                  className="col-span-full"
                  title="Không có lớp học nào đang mở cho cấp độ này."
                  action={
                    <KidButton type="button" tone="sun" onClick={() => setActiveLevel("all")}>
                      Xem tất cả các lớp
                    </KidButton>
                  }
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
