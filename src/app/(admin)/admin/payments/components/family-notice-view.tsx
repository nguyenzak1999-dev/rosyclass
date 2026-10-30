import { formatBillingMonth, sessionMarkText, type FamilyNotice } from "@/lib/monthly-billing-shared"
import { cn } from "@/lib/utils"

const money = (value: number) => Math.round(value).toLocaleString("vi-VN")
/** Thừa/thiếu: số dương là còn thiếu (thu thêm), số âm là thừa (trừ vào tháng này) */
const signedMoney = (value: number) => (value < 0 ? `-${money(-value)}` : money(value))
/** "2026-09" → "09/26" như trên thông báo giấy */
const shortMonth = (month: string) => `${month.slice(5)}/${month.slice(2, 4)}`
const percentText = (value: number) => `${value.toLocaleString("vi-VN")}%`

function Row({
  index,
  label,
  values,
  strong,
  muted,
}: {
  index?: number
  label: string
  values: string[]
  strong?: boolean
  /** Dòng phụ (tạm tính, miễn giảm, đã đóng…): chữ nhỏ hơn một bậc */
  muted?: boolean
}) {
  return (
    <tr className={cn(strong ? "font-extrabold" : "font-semibold", muted ? "text-[34px]" : "text-[40px]")}>
      <td className="w-12 py-1.5 pr-2 align-baseline text-[28px] font-bold text-kid-ink-soft">{index ?? ""}</td>
      <td className="py-1.5 pr-6 leading-tight whitespace-nowrap">{label}</td>
      {values.map((value, i) => (
        <td key={i} className="px-3 py-1.5 text-center leading-tight">
          {value}
        </td>
      ))}
    </tr>
  )
}

/**
 * Thông báo thu học phí cả nhà: mỗi bé một cột (mục 1–7, miễn/giảm), tổng cả nhà và mã QR lớn để phụ huynh quét.
 * Một font (Nunito) và bảng màu của website; màu cố định nên ảnh gửi Zalo giống nhau ở giao diện sáng và tối.
 */
export function FamilyNoticeView({ notice, siteName }: { notice: FamilyNotice; siteName: string }) {
  const { children } = notice
  const prev = shortMonth(notice.previousMonth)
  const current = shortMonth(notice.month)
  const hasDiscount = children.some((child) => child.discountAmount !== 0)
  const hasPercent = children.some((child) => child.percentAmount > 0)
  const hasPaid = notice.totalPaid > 0
  const sectionRow = (label: string) => (
    <tr>
      <td />
      <td colSpan={children.length + 1} className="pt-4 pb-1 text-[42px] leading-tight font-black text-kid-rose">
        {label}
      </td>
    </tr>
  )

  return (
    // Rộng cố định theo số bé (nhãn ~820px + mỗi bé ~320px) để dòng dài tự xuống dòng thay vì kéo rộng ảnh
    <div
      className="overflow-hidden rounded-[28px] border-[4px] border-kid-ink bg-kid-cream text-kid-ink [font-variant-numeric:lining-nums_tabular-nums]"
      style={{ fontFamily: "var(--font-kid-body)", width: Math.max(1300, 820 + children.length * 320) }}
    >
      <div className="border-b-[4px] border-kid-ink bg-kid-sun px-8 py-4 text-center text-[42px] leading-tight font-black uppercase">
        Thông báo thu học phí lớp tiếng Anh {siteName} tháng {formatBillingMonth(notice.month)}
      </div>

      <div className="bg-white px-8 pt-5 pb-3">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="text-[40px]">
              <td />
              <td className="py-1.5 pr-6 leading-tight font-semibold whitespace-nowrap">Kính gửi phụ huynh bạn</td>
              {children.map((child) => (
                <td key={child.paymentId} className="px-3 py-1.5 text-center leading-tight font-black">
                  {child.label}
                </td>
              ))}
            </tr>
            {sectionRow(`Tháng ${prev}`)}
            <Row index={1} label="Số buổi đã tạm thu:" values={children.map((child) => String(child.prevBilled))} />
            <Row index={2} label="Số buổi thực tính phí:" values={children.map((child) => String(child.prevChargeable))} />
            <Row index={3} label={`Thừa/ thiếu tháng ${prev}`} values={children.map((child) => signedMoney(child.carryAmount))} strong />
            {sectionRow(`Tháng ${current}`)}
            <Row index={4} label="Số buổi học tạm thu:" values={children.map((child) => String(child.monthSessions))} />
            <Row index={5} label={`Thành tiền tháng ${current}`} values={children.map((child) => money(child.monthAmount))} strong />
            <Row index={6} label="Buổi học Giáo viên nước ngoài" values={children.map((child) => money(child.foreignAmount))} />
            <Row index={7} label="Tài liệu bổ trợ / Học liệu / Sách" values={children.map((child) => money(child.materialAmount))} />
            {hasDiscount ? (
              <Row index={8} label="Giảm trừ khác" values={children.map((child) => signedMoney(child.discountAmount))} />
            ) : null}
            <tr>
              <td />
              <td colSpan={children.length + 1} className="py-2">
                <div className="border-t-[4px] border-dashed border-kid-ink" />
              </td>
            </tr>
            <Row
              label={`Tạm tính (Mục 3 + 5 + 6 + 7${hasDiscount ? " + 8" : ""}):`}
              values={children.map((child) => money(child.subtotal))}
              strong
              muted
            />
            {hasPercent ? (
              <>
                <Row
                  label="Miễn/ giảm học phí:"
                  values={children.map((child) => (child.percentAmount > 0 ? percentText(child.discountPercent) : ""))}
                  strong
                  muted
                />
                <Row label="Học phí sau miễn giảm:" values={children.map((child) => money(child.total))} strong muted />
              </>
            ) : null}
            {hasPaid ? (
              <>
                <Row label="Đã đóng:" values={children.map((child) => money(child.paid))} muted />
                <Row label="Còn phải đóng:" values={children.map((child) => money(child.remaining))} strong muted />
              </>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Thông tin chuyển khoản bên trái, mã QR cỡ lớn bên phải để phụ huynh quét dễ từ ảnh gửi Zalo */}
      <div className="flex items-center gap-8 border-t-[4px] border-kid-ink px-8 py-6">
        <div className="grid flex-1 grid-cols-[max-content_1fr] items-baseline gap-x-6 gap-y-3 text-[32px] leading-tight">
          <span className="font-extrabold">Học phí cần đóng:</span>
          <span className="text-[92px] leading-none font-black text-kid-rose">
            {notice.totalDue > 0 ? money(notice.totalDue) : "Đã đóng đủ"}
          </span>
          <span className="font-semibold text-kid-ink-soft">Tài khoản ngân hàng:</span>
          <span className="font-extrabold">{notice.bank.accountNo || "—"}</span>
          <span className="font-semibold text-kid-ink-soft">Tên chủ tài khoản:</span>
          <span className="font-extrabold">{notice.bank.accountName || "—"}</span>
          <span className="font-semibold text-kid-ink-soft">Ngân hàng:</span>
          <span className="font-extrabold">{notice.bank.code}</span>
          <span className="font-semibold text-kid-ink-soft">Nội dung chuyển khoản</span>
          <span className="font-extrabold">{notice.transferContent}</span>
          {notice.qrUrl ? (
            <p className="col-span-2 mt-4 rounded-2xl border-[3px] border-kid-ink bg-kid-sun-soft px-6 py-4 text-[32px] leading-snug font-extrabold text-kid-rose">
              Chuyển nhanh: mở app ngân hàng và quét mã QR bên cạnh ➜
            </p>
          ) : null}
        </div>

        {notice.qrUrl ? (
          <div className="shrink-0 rounded-3xl border-[4px] border-kid-ink bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={notice.qrUrl}
              data-receipt-qr
              crossOrigin="anonymous"
              alt={`Mã QR chuyển khoản ${money(notice.totalDue)} đồng`}
              className="h-[540px] w-[540px] object-contain"
            />
          </div>
        ) : null}
      </div>

      <div className="border-t-[4px] border-kid-ink bg-kid-mint-soft px-8 py-4 text-center text-[30px] leading-snug font-extrabold">
        Ba mẹ vui lòng thanh toán {notice.dueDate ? `trước ngày ${notice.dueDate}` : "trong 05 ngày"} và gửi xác nhận cho cô. Trân trọng.
      </div>

      {children.some((child) => child.attendance.length || child.planned.length) ? (
        <div className="space-y-4 border-t-[4px] border-kid-ink bg-white px-8 py-6 text-[26px] leading-snug">
          {children.map((child) => (
            <div key={child.paymentId}>
              <p className="font-extrabold">{child.label}</p>
              {child.attendance.map((item) => (
                <p key={`a-${item.className}`} className="font-semibold">
                  <span className="text-kid-ink-soft">Điểm danh tháng {prev}:</span> {item.days.map(sessionMarkText).join(", ")}
                </p>
              ))}
              {child.planned.map((item) => (
                <p key={`p-${item.className}`} className="font-semibold">
                  <span className="text-kid-ink-soft">Lịch học tháng {current}:</span> {item.dates}
                </p>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
