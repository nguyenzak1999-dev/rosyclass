// Khối đối chiếu học phí tháng dạng HTML (cửa sổ in) và văn bản (tin nhắn gửi phụ huynh)
import {
  carryOverText,
  formatBillingMonth,
  plannedDatesText,
  sessionMarkText,
  type BillingSummary,
} from "@/lib/monthly-billing-shared"

const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")}đ`

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function absenceText(item: BillingSummary["previous"][number]) {
  if (item.absent === 0) return "không nghỉ"
  return [
    `nghỉ ${item.absent}`,
    item.madeUp ? `đã kèm bù ${item.madeUp}` : null,
    item.pendingMakeUp ? `chờ bù ${item.pendingMakeUp}` : null,
    item.missedMakeUp ? `không bù được ${item.missedMakeUp}` : null,
  ]
    .filter(Boolean)
    .join(", ")
}

function plannedText(item: BillingSummary["planned"][number]) {
  return `${item.isOneOnOne ? "Học 1-1 · " : ""}${item.className}: ${item.regularSessions} buổi${
    item.foreignSessions ? ` + ${item.foreignSessions} buổi GV nước ngoài` : ""
  }${item.estimated ? " (tạm tính)" : ""}`
}

export function billingSummaryText(summary: BillingSummary, familyRemaining: number) {
  const monthLabel = formatBillingMonth(summary.month)
  const lines = [`Tháng trước (${formatBillingMonth(summary.previousMonth)}):`]
  for (const item of summary.previous) {
    lines.push(
      `- ${item.className}: đã thu ${item.billedSessions ?? "—"} buổi · lớp học ${item.heldSessions} buổi · bé đã học ${item.learned ?? item.attended} buổi (${absenceText(item)})`
    )
    if (item.carryOver !== undefined) lines.push(`  Cộng dồn sang tháng ${monthLabel}: ${carryOverText(item)}`)
    if (item.days?.length) lines.push(`  Điểm danh: ${item.days.map(sessionMarkText).join(", ")}`)
  }
  lines.push(`Tạm thu tháng ${monthLabel}:`)
  for (const item of summary.planned) {
    lines.push(`- ${plannedText(item)}: ${money(item.amount)}`)
    if (item.dates.length) lines.push(`  Lịch học: ${plannedDatesText(item)}`)
  }
  if (summary.siblings.length > 0) {
    lines.push("Anh chị em cùng nhà:")
    for (const sibling of summary.siblings) {
      lines.push(`- ${sibling.fullName}: ${sibling.paymentId ? `${money(sibling.totalAmount)} (còn ${money(sibling.remainingAmount)})` : "chưa lập phiếu"}`)
    }
    lines.push(`Cả nhà còn phải đóng tháng này: ${money(familyRemaining)}`)
  }
  return lines.join("\n")
}

export function billingSummaryHtml(summary: BillingSummary, familyRemaining: number) {
  const previousRows = summary.previous
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.className)}</td>
        <td class="text-right">${item.billedSessions ?? "—"}</td>
        <td class="text-right">${item.heldSessions}</td>
        <td class="text-right">${item.learned ?? item.attended}</td>
        <td>${escapeHtml(absenceText(item))}</td>
        <td>${escapeHtml(carryOverText(item))}</td>
      </tr>${
        item.days?.length
          ? `<tr><td colspan="6" style="color:#555;font-size:10px">Điểm danh: ${escapeHtml(item.days.map(sessionMarkText).join(", "))}</td></tr>`
          : ""
      }`
    )
    .join("")
  const plannedRows = summary.planned
    .map(
      (item) => `<tr>
        <td>${escapeHtml(plannedText(item))}${item.dates.length ? `<br/><span style="color:#666;font-size:10px">${escapeHtml(plannedDatesText(item))}</span>` : ""}</td>
        <td class="text-right font-bold">${money(item.amount)}</td>
      </tr>`
    )
    .join("")
  const siblings = summary.siblings.length
    ? `<div style="margin-top:8px"><b>Anh chị em cùng nhà${summary.parentPhone ? ` (SĐT ${escapeHtml(summary.parentPhone)})` : ""}:</b> ${summary.siblings
        .map(
          (sibling) =>
            `${escapeHtml(sibling.fullName)} – ${sibling.paymentId ? `${money(sibling.totalAmount)} (còn ${money(sibling.remainingAmount)})` : "chưa lập phiếu"}`
        )
        .join("; ")}<br/><b>Cả nhà còn phải đóng tháng này: ${money(familyRemaining)}</b></div>`
    : ""

  return `<div style="margin: 12px 0; font-size: 11px;">
    <div style="font-weight:bold;margin-bottom:4px">Đối chiếu tháng trước (${formatBillingMonth(summary.previousMonth)})</div>
    <table>
      <thead><tr><th>Lớp</th><th class="text-right">Buổi đã thu</th><th class="text-right">Lớp đã học</th><th class="text-right">Bé đã học</th><th>Nghỉ / kèm bù</th><th>Cộng dồn sang T${formatBillingMonth(summary.month)}</th></tr></thead>
      <tbody>${previousRows || `<tr><td colspan="6">Chưa có dữ liệu</td></tr>`}</tbody>
    </table>
    <div style="font-weight:bold;margin:8px 0 4px">Tạm thu tháng ${formatBillingMonth(summary.month)}</div>
    <table>
      <thead><tr><th>Lớp · số buổi</th><th class="text-right">Số tiền</th></tr></thead>
      <tbody>${plannedRows || `<tr><td colspan="2">Chưa có lớp</td></tr>`}</tbody>
    </table>
    ${siblings}
  </div>`
}
