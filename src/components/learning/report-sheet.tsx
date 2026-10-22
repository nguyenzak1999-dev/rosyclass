import { formatVietnamDate, SKILL_LEVELS, SKILLS } from "@/lib/curriculum"
import type { ProgressReportData } from "@/lib/progress-report"
import { cn } from "@/lib/utils"

// Bản báo cáo tiến bộ in được (A4). Dùng chung cho trang quản trị và cổng phụ huynh.
// Màu cố định (không theo dark mode) để bản in và bản xem trên điện thoại giống nhau.

export interface ReportSheetProps {
  report: {
    title: string
    periodStart: Date
    periodEnd: Date
    teacherComment: string | null
    publishedAt: Date | null
    status: string
  }
  data: ProgressReportData | null
  centre: {
    siteName: string
    legalName?: string
    address?: string
    phone?: string
    email?: string
    logoUrl?: string
  }
}

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-kid-orange",
  2: "bg-kid-sky",
  3: "bg-kid-mint",
}

/**
 * CSS in: chỉ in phần báo cáo (ẩn thanh điều hướng, sidebar, footer…), khổ A4.
 * Dùng visibility để không phụ thuộc vào cấu trúc layout bao ngoài.
 */
export function ReportPrintStyles() {
  return (
    <style>{`
      @page { size: A4; margin: 12mm; }
      @media print {
        html, body { background: #fff !important; }
        body * { visibility: hidden !important; }
        .report-print-root, .report-print-root * { visibility: visible !important; }
        .report-print-root { position: absolute; inset: 0 auto auto 0; width: 100%; margin: 0 !important; box-shadow: none !important; border: none !important; }
        .report-no-print { display: none !important; }
        .report-avoid-break { break-inside: avoid; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `}</style>
  )
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone: string }) {
  return (
    <div className={cn("report-avoid-break rounded-2xl border-2 border-kid-ink p-3", tone)}>
      <p className="text-xs font-bold tracking-wide text-kid-ink-soft uppercase">{label}</p>
      <p className="font-kid-display text-3xl leading-tight font-extrabold text-kid-ink">{value}</p>
      {hint ? <p className="text-xs text-kid-ink-soft">{hint}</p> : null}
    </div>
  )
}

export function ReportSheet({ report, data, centre }: ReportSheetProps) {
  const period = `${formatVietnamDate(report.periodStart)} – ${formatVietnamDate(report.periodEnd)}`
  const skillByCode = new Map((data?.skills ?? []).map((skill) => [skill.skill, skill]))

  return (
    <article className="report-print-root theme-client mx-auto w-full max-w-[210mm] rounded-[24px] border-[3px] border-kid-ink bg-white p-5 text-kid-ink sm:p-8">
      {/* Đầu trang: trung tâm */}
      <header className="flex items-start gap-4 border-b-2 border-dashed border-kid-ink/30 pb-4">
        {centre.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- logo từ cài đặt website, cần hiện cả khi in
          <img src={centre.logoUrl} alt={centre.siteName} className="h-14 w-14 shrink-0 rounded-xl object-contain" />
        ) : null}
        <div className="min-w-0 flex-1 text-sm leading-snug">
          <p className="font-kid-display text-lg font-extrabold">{centre.legalName || centre.siteName}</p>
          {centre.address ? <p>{centre.address}</p> : null}
          <p className="text-kid-ink-soft">{[centre.phone, centre.email].filter(Boolean).join(" · ")}</p>
        </div>
        <span aria-hidden="true" className="text-4xl">
          🌟
        </span>
      </header>

      <div className="mt-5 space-y-1 text-center">
        <p className="text-sm font-bold text-kid-rose">{report.title}</p>
        <h1 className="font-kid-display text-3xl leading-tight font-extrabold sm:text-4xl">{data?.studentName || "Báo cáo tiến bộ"}</h1>
        <p className="text-sm text-kid-ink-soft">
          {data?.className}
          {data?.courseName ? ` · ${data.courseName}` : ""}
          {data?.teacherName ? ` · GV ${data.teacherName}` : ""}
        </p>
        <p className="text-sm font-semibold">Kỳ báo cáo: {period}</p>
      </div>

      {!data ? (
        <p className="mt-6 rounded-2xl bg-kid-cream p-4 text-center">Báo cáo chưa có số liệu.</p>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Tổng quan">
            <Stat
              label="Chuyên cần"
              value={data.attendance.rate === null ? "—" : `${data.attendance.rate}%`}
              hint={`${data.attendance.present + data.attendance.late + data.attendance.makeUp}/${data.attendance.recorded} buổi có mặt`}
              tone="bg-kid-mint-soft"
            />
            <Stat
              label="Sao thưởng"
              value={`⭐ ${data.stars.total}`}
              hint={data.stars.average === null ? "Chưa có nhận xét" : `TB ${data.stars.average} sao/buổi`}
              tone="bg-kid-sun-soft"
            />
            <Stat
              label="Bài về nhà"
              value={`${data.homework.submitted}/${data.homework.assigned}`}
              hint={`${data.homework.reviewed} bài đã chấm`}
              tone="bg-kid-sky-soft"
            />
            <Stat label="Bài đã học" value={String(data.lessons.length)} hint={`${data.attendance.sessions} buổi của lớp`} tone="bg-kid-grape-soft" />
          </section>

          {data.attendance.excused + data.attendance.absent + data.attendance.late > 0 ? (
            <p className="text-sm text-kid-ink-soft">
              Đi muộn {data.attendance.late} · Nghỉ có phép {data.attendance.excused} · Nghỉ không phép {data.attendance.absent}
              {data.attendance.makeUp > 0 ? ` · Học bù ${data.attendance.makeUp}` : ""}
            </p>
          ) : null}

          <section className="report-avoid-break space-y-2">
            <h2 className="font-kid-display text-xl font-extrabold">Kỹ năng của con</h2>
            <div className="space-y-2">
              {SKILLS.map((skill) => {
                const value = skillByCode.get(skill.value)
                return (
                  <div key={skill.value} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 text-sm">
                    <span className="font-bold">
                      <span aria-hidden="true">{skill.emoji}</span> {skill.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-1 gap-1" aria-hidden="true">
                        {SKILL_LEVELS.map((level) => (
                          <span
                            key={level.value}
                            className={cn(
                              "h-4 flex-1 rounded-full border-2 border-kid-ink",
                              value && value.level >= level.value ? LEVEL_COLORS[value.level] : "bg-white"
                            )}
                          />
                        ))}
                      </div>
                      <span className="w-28 shrink-0 text-right font-semibold">
                        {value ? SKILL_LEVELS.find((level) => level.value === value.level)?.label : "Chưa đánh giá"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            {data.skills.some((skill) => skill.note) ? (
              <ul className="space-y-1 text-sm text-kid-ink-soft">
                {data.skills
                  .filter((skill) => skill.note)
                  .map((skill) => (
                    <li key={skill.skill}>
                      • {SKILLS.find((item) => item.value === skill.skill)?.label}: {skill.note}
                    </li>
                  ))}
              </ul>
            ) : null}
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            <section className="report-avoid-break space-y-2">
              <h2 className="font-kid-display text-xl font-extrabold">Cô khen con</h2>
              {data.topPraises.length === 0 && data.homework.stickers.length === 0 ? (
                <p className="text-sm text-kid-ink-soft">Chưa có lời khen trong kỳ này.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.topPraises.map((item) => (
                    <span key={item.praise} className="rounded-full border-2 border-kid-ink bg-kid-rose-soft px-3 py-1 text-sm font-bold">
                      {item.praise} ×{item.count}
                    </span>
                  ))}
                  {data.homework.stickers.map((item) => (
                    <span key={item.sticker} className="rounded-full border-2 border-kid-ink bg-kid-sun-soft px-3 py-1 text-sm font-bold">
                      {item.sticker} ×{item.count}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className="report-avoid-break space-y-2">
              <h2 className="font-kid-display text-xl font-extrabold">Con đã học</h2>
              {data.lessons.length === 0 ? (
                <p className="text-sm text-kid-ink-soft">Chưa có bài học nào được ghi nhận.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {data.lessons.slice(0, 12).map((lesson) => (
                    <li key={lesson}>📘 {lesson}</li>
                  ))}
                  {data.lessons.length > 12 ? <li className="text-kid-ink-soft">… và {data.lessons.length - 12} bài khác</li> : null}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}

      <section className="report-avoid-break mt-6 space-y-2 rounded-2xl border-2 border-kid-ink bg-kid-cream p-4">
        <h2 className="font-kid-display text-xl font-extrabold">Nhận xét của giáo viên</h2>
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {report.teacherComment?.trim() || "Giáo viên chưa viết nhận xét cho kỳ này."}
        </p>
        {data?.teacherName ? <p className="text-right text-sm font-bold">— GV {data.teacherName}</p> : null}
      </section>

      <footer className="mt-4 text-center text-xs text-kid-ink-soft">
        {report.publishedAt ? `Gửi ngày ${formatVietnamDate(report.publishedAt)}` : "Bản nháp – chưa gửi phụ huynh"}
        {data ? ` · Số liệu tổng hợp ngày ${formatVietnamDate(data.generatedAt)}` : ""}
      </footer>
    </article>
  )
}
