import { formatBillingMonth, sessionMarkText, type FamilyNotice } from "@/lib/monthly-billing-shared"
import { cn } from "@/lib/utils"

const money = (value: number) => Math.round(value).toLocaleString("vi-VN")
/** Thừa/thiếu: số dương là còn thiếu (thu thêm), số âm là thừa (trừ vào tháng này) */
const signedMoney = (value: number) => (value < 0 ? `-${money(-value)}` : money(value))
/** "2026-09" → "09/26" như trên thông báo giấy */
const shortMonth = (month: string) => `${month.slice(5)}/${month.slice(2, 4)}`

function Row({
  index,
  label,
  values,
  strong,
}: {
  index?: number
  label: string
  values: string[]
  strong?: boolean
}) {
  return (
    <tr className={cn(strong && "font-bold italic")}>
      <td className="w-6 py-1 pr-1 align-top text-sm text-zinc-500">{index ?? ""}</td>
      <td className="py-1 pr-3 text-[17px]">{label}</td>
      {values.map((value, i) => (
        <td key={i} className="py-1 text-center text-[17px] tabular-nums">
          {value}
        </td>
      ))}
    </tr>
  )
}

/**
 * Thông báo thu học phí cả nhà: mỗi bé một cột (mục 1–6), tổng cả nhà và mã QR lớn để phụ huynh quét.
 * Màu cố định (giấy trắng) để ảnh chụp gửi Zalo giống nhau ở cả giao diện sáng và tối.
 */
export function FamilyNoticeView({ notice, siteName }: { notice: FamilyNotice; siteName: string }) {
  const { children } = notice
  const prev = shortMonth(notice.previousMonth)
  const current = shortMonth(notice.month)
  const hasDiscount = children.some((child) => child.discountAmount !== 0)
  const hasPaid = notice.totalPaid > 0
  const sectionRow = (label: string) => (
    <tr>
      <td />
      <td colSpan={children.length + 1} className="pt-2 text-[18px] font-bold text-red-600">
        {label}
      </td>
    </tr>
  )
  const separator = (
    <tr>
      <td />
      <td colSpan={children.length + 1} className="py-1">
        <div className="border-t-2 border-double border-zinc-500" />
      </td>
    </tr>
  )

  return (
    // Times như thông báo giấy; lining-nums để chữ số cao bằng nhau, dễ đọc số tiền
    <div
      className="min-w-[1000px] border-2 border-zinc-800 bg-white text-zinc-900 [font-variant-numeric:lining-nums_tabular-nums]"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <div className="border-b-2 border-zinc-800 bg-yellow-300 px-4 py-2 text-center text-[20px] font-bold text-blue-950 italic uppercase">
        Thông báo thu học phí lớp tiếng Anh {siteName} tháng {formatBillingMonth(notice.month)}
      </div>

      <div className="px-4 pt-3">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td />
              <td className="py-1 pr-3 text-[17px]">Kính gửi phụ huynh bạn</td>
              {children.map((child) => (
                <td key={child.paymentId} className="px-2 py-1 text-center text-[18px] font-bold">
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
            <Row index={6} label="Buổi học GVNN + Học liệu" values={children.map((child) => money(child.extrasAmount))} strong />
            {hasDiscount ? (
              <Row index={7} label="Giảm trừ" values={children.map((child) => signedMoney(child.discountAmount))} strong />
            ) : null}
            {separator}
            <Row
              label={`Tạm tính (Mục 3 + 5 + 6${hasDiscount ? " + 7" : ""}):`}
              values={children.map((child) => money(child.total))}
              strong
            />
            {hasPaid ? (
              <>
                <Row label="Đã đóng:" values={children.map((child) => money(child.paid))} />
                <Row label="Còn phải đóng:" values={children.map((child) => money(child.remaining))} strong />
              </>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Thông tin chuyển khoản bên trái, mã QR cỡ lớn bên phải để phụ huynh quét dễ từ ảnh gửi Zalo */}
      <div className="flex items-center gap-6 border-t border-zinc-300 px-4 py-4">
        <div className="grid flex-1 grid-cols-[170px_1fr] items-baseline gap-x-3 gap-y-2 font-sans text-[16px]">
          <span className="font-bold">Học phí cần đóng:</span>
          <span className="text-[44px] leading-none font-bold text-red-600 italic" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            {notice.totalDue > 0 ? money(notice.totalDue) : "Đã đóng đủ"}
          </span>
          <span>Tài khoản ngân hàng:</span>
          <span className="font-semibold">{notice.bank.accountNo || "—"}</span>
          <span>Tên chủ tài khoản:</span>
          <span className="font-semibold">{notice.bank.accountName || "—"}</span>
          <span>Ngân hàng:</span>
          <span className="font-semibold">{notice.bank.code}</span>
          <span>Nội dung chuyển khoản</span>
          <span className="font-semibold">{notice.transferContent}</span>
          {notice.qrUrl ? (
            <p className="col-span-2 mt-3 w-max rounded bg-yellow-200 px-4 py-2 text-[18px] leading-snug font-bold text-red-600">
              Chuyển nhanh: mở app ngân hàng và quét mã QR bên cạnh ➜
            </p>
          ) : null}
        </div>

        {notice.qrUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={notice.qrUrl}
            data-receipt-qr
            crossOrigin="anonymous"
            alt={`Mã QR chuyển khoản ${money(notice.totalDue)} đồng`}
            className="h-[520px] w-[520px] shrink-0 object-contain"
          />
        ) : null}
      </div>

      <div className="border-t-2 border-zinc-800 bg-green-100 px-4 py-1.5 text-center font-sans text-[15px] font-bold">
        Ba mẹ vui lòng thanh toán {notice.dueDate ? `trước ngày ${notice.dueDate}` : "trong 05 ngày"} và gửi xác nhận cho cô. Trân trọng.
      </div>

      {children.some((child) => child.attendance.length || child.planned.length) ? (
        <div className="space-y-2 border-t border-zinc-300 px-4 py-3 font-sans text-[13px] leading-relaxed">
          {children.map((child) => (
            <div key={child.paymentId}>
              <p className="font-bold">{child.label}</p>
              {child.attendance.map((item) => (
                <p key={`a-${item.className}`}>
                  <span className="text-zinc-500">Điểm danh tháng {prev}:</span> {item.days.map(sessionMarkText).join(", ")}
                </p>
              ))}
              {child.planned.map((item) => (
                <p key={`p-${item.className}`}>
                  <span className="text-zinc-500">Lịch học tháng {current}:</span> {item.dates}
                </p>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
