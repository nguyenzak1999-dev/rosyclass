import {
  SESSION_MARK_LABELS,
  carryOverText,
  formatBillingMonth,
  sessionMarkText,
  type BillingSummary,
  type SessionMarkCode,
} from "@/lib/monthly-billing-shared"
import { cn } from "@/lib/utils"

const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")}đ`

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Chưa đóng",
  PARTIAL: "Đóng một phần",
  PAID: "Đã đóng",
  REFUNDED: "Đã hoàn",
}

const MARK_STYLES: Record<SessionMarkCode, string> = {
  PRESENT: "border-emerald-200 bg-emerald-50 text-emerald-800",
  LATE: "border-amber-200 bg-amber-50 text-amber-800",
  MADE_UP: "border-sky-200 bg-sky-50 text-sky-800",
  PENDING_MAKE_UP: "border-amber-200 bg-amber-50 text-amber-800",
  MISSED_MAKE_UP: "border-red-200 bg-red-50 text-red-700",
  ABSENT: "border-red-200 bg-red-50 text-red-700",
  CANCELLED: "border-zinc-200 bg-zinc-50 text-zinc-500 line-through",
  UPCOMING: "border-dashed border-zinc-300 text-zinc-600",
  UNMARKED: "border-zinc-200 text-zinc-500",
}

function absenceText(item: BillingSummary["previous"][number]) {
  if (item.absent === 0) return "Không"
  return [
    `${item.absent} buổi`,
    item.madeUp ? `đã kèm bù ${item.madeUp}` : null,
    item.pendingMakeUp ? `chờ bù ${item.pendingMakeUp}` : null,
    item.missedMakeUp ? `không bù được ${item.missedMakeUp}` : null,
  ]
    .filter(Boolean)
    .join(" · ")
}

/** Đối chiếu tháng trước (đã thu, đã học, cộng dồn), lịch học tháng thu và anh chị em — in trên phiếu thu tháng */
export function BillingSummaryView({ summary, className }: { summary: BillingSummary; className?: string }) {
  const hasPrevious = summary.previous.some((item) => item.heldSessions > 0 || item.billedSessions !== null || (item.days?.length ?? 0) > 0)
  const monthLabel = formatBillingMonth(summary.month)
  return (
    <div className={cn("space-y-4 text-sm", className)}>
      <section className="space-y-2">
        <h4 className="font-semibold">Tháng trước ({formatBillingMonth(summary.previousMonth)})</h4>
        {hasPrevious ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-1 pr-2 font-medium">Lớp</th>
                  <th className="py-1 pr-2 text-right font-medium">Đã thu</th>
                  <th className="py-1 pr-2 text-right font-medium">Bé đã học</th>
                  <th className="py-1 pr-2 font-medium">Nghỉ</th>
                  <th className="py-1 font-medium">Cộng dồn sang T{monthLabel}</th>
                </tr>
              </thead>
              <tbody>
                {summary.previous.map((item) => (
                  <tr key={item.classId} className="border-b align-top last:border-0">
                    <td className="py-1.5 pr-2">
                      <div>{item.className}</div>
                      <div className="text-xs text-muted-foreground">
                        Lớp đã học {item.heldSessions}
                        {item.scheduledSessions !== undefined && item.scheduledSessions > item.heldSessions
                          ? `/${item.scheduledSessions}`
                          : ""}{" "}
                        buổi
                      </div>
                      {item.days?.length ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.days.map((day, index) => (
                            <span
                              key={`${day.date}-${index}`}
                              title={SESSION_MARK_LABELS[day.mark]}
                              className={cn("rounded border px-1.5 py-0.5 text-[11px] leading-tight", MARK_STYLES[day.mark])}
                            >
                              {sessionMarkText(day)}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-1.5 pr-2 text-right whitespace-nowrap">
                      {item.billedSessions === null ? "—" : `${item.billedSessions} buổi`}
                    </td>
                    <td className="py-1.5 pr-2 text-right whitespace-nowrap">{item.learned ?? item.attended} buổi</td>
                    <td className="py-1.5 pr-2">{absenceText(item)}</td>
                    <td className={cn("py-1.5", item.carryOver || item.extraSessions ? "font-medium" : "")}>{carryOverText(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground">Chưa có dữ liệu học tháng trước.</p>
        )}
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold">Tạm thu tháng {monthLabel}</h4>
        {summary.planned.length === 0 ? (
          <p className="text-muted-foreground">Bé chưa có lớp đang học.</p>
        ) : (
          <ul className="space-y-2">
            {summary.planned.map((item) => {
              const foreign = new Set(item.foreignDates ?? [])
              return (
                <li key={item.classId} className="space-y-1">
                  <div className="flex flex-wrap justify-between gap-x-3">
                    <span>
                      {item.isOneOnOne ? "Học 1-1 · " : ""}
                      {item.className}: <strong>{item.regularSessions} buổi</strong>
                      {item.foreignSessions ? ` + ${item.foreignSessions} buổi GV nước ngoài` : ""}
                      {item.estimated ? " (tạm tính theo lịch)" : ""}
                    </span>
                    <span className="font-medium">{money(item.amount)}</span>
                  </div>
                  {item.dates.length ? (
                    <div className="flex flex-wrap gap-1">
                      {item.dates.map((date, index) => (
                        <span
                          key={`${date}-${index}`}
                          className="rounded border border-dashed border-zinc-300 px-1.5 py-0.5 text-[11px] leading-tight text-zinc-600"
                        >
                          {foreign.has(date) ? `${date} (GVNN)` : date}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {summary.siblings.length > 0 ? (
        <section className="space-y-2">
          <h4 className="font-semibold">Anh chị em cùng nhà{summary.parentPhone ? ` (SĐT ${summary.parentPhone})` : ""}</h4>
          <ul className="space-y-1">
            {summary.siblings.map((sibling) => (
              <li key={sibling.studentId} className="flex flex-wrap justify-between gap-x-3">
                <span>
                  {sibling.fullName}
                  {sibling.code ? <span className="text-muted-foreground"> ({sibling.code})</span> : null}
                </span>
                <span>
                  {sibling.paymentId
                    ? `${sibling.receiptCode ?? "Phiếu"} · ${money(sibling.totalAmount)} · ${PAYMENT_STATUS_LABELS[sibling.status ?? ""] ?? sibling.status}`
                    : "Chưa lập phiếu tháng này"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

/** Tổng cả nhà còn phải đóng trong tháng: phiếu này + phiếu anh chị em */
export function familyRemaining(summary: BillingSummary, ownRemaining: number) {
  return ownRemaining + summary.siblings.reduce((sum, sibling) => sum + (sibling.paymentId ? sibling.remainingAmount : 0), 0)
}
