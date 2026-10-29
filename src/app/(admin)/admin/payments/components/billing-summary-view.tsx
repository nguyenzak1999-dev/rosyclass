import { formatBillingMonth, type BillingSummary } from "@/lib/monthly-billing-shared"
import { cn } from "@/lib/utils"

const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")}đ`

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Chưa đóng",
  PARTIAL: "Đóng một phần",
  PAID: "Đã đóng",
  REFUNDED: "Đã hoàn",
}

/** Đối chiếu tháng trước, tạm thu tháng này và anh chị em — in trên phiếu thu tháng */
export function BillingSummaryView({ summary, className }: { summary: BillingSummary; className?: string }) {
  const hasPrevious = summary.previous.some((item) => item.heldSessions > 0 || item.billedSessions !== null)
  return (
    <div className={cn("space-y-4 text-sm", className)}>
      <section className="space-y-2">
        <h4 className="font-semibold">Tháng trước ({formatBillingMonth(summary.previousMonth)})</h4>
        {hasPrevious ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-1 pr-2 font-medium">Lớp</th>
                  <th className="py-1 pr-2 text-right font-medium">Đã thu</th>
                  <th className="py-1 pr-2 text-right font-medium">Lớp đã học</th>
                  <th className="py-1 pr-2 text-right font-medium">Bé đi học</th>
                  <th className="py-1 font-medium">Nghỉ</th>
                </tr>
              </thead>
              <tbody>
                {summary.previous.map((item) => (
                  <tr key={item.classId} className="border-b last:border-0">
                    <td className="py-1 pr-2">{item.className}</td>
                    <td className="py-1 pr-2 text-right">{item.billedSessions === null ? "—" : `${item.billedSessions} buổi`}</td>
                    <td className="py-1 pr-2 text-right">{item.heldSessions} buổi</td>
                    <td className="py-1 pr-2 text-right">{item.attended} buổi</td>
                    <td className="py-1">
                      {item.absent === 0
                        ? "Không"
                        : [
                            `${item.absent} buổi`,
                            item.madeUp ? `đã kèm bù ${item.madeUp}` : null,
                            item.pendingMakeUp ? `chờ bù ${item.pendingMakeUp}` : null,
                            item.missedMakeUp ? `không bù được ${item.missedMakeUp}` : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                    </td>
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
        <h4 className="font-semibold">Tạm thu tháng {formatBillingMonth(summary.month)}</h4>
        {summary.planned.length === 0 ? (
          <p className="text-muted-foreground">Bé chưa có lớp đang học.</p>
        ) : (
          <ul className="space-y-1">
            {summary.planned.map((item) => (
              <li key={item.classId} className="flex flex-wrap justify-between gap-x-3">
                <span>
                  {item.isOneOnOne ? "Học 1-1 · " : ""}
                  {item.className}: <strong>{item.regularSessions} buổi</strong>
                  {item.foreignSessions ? ` + ${item.foreignSessions} buổi GV nước ngoài` : ""}
                  {item.estimated ? " (tạm tính theo lịch)" : ""}
                  {item.dates.length ? <span className="text-muted-foreground"> · {item.dates.join(", ")}</span> : null}
                </span>
                <span className="font-medium">{money(item.amount)}</span>
              </li>
            ))}
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
