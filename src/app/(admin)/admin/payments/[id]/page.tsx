import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BadgeStatus } from "@/components/ui/badge-status"
import { getSiteSettings } from "@/lib/get-site-settings"
import PaymentDetailClient from "./payment-detail-client"
import { BillingSummaryView, familyRemaining } from "../components/billing-summary-view"
import { MonthlyBillingDialog } from "../components/monthly-billing-dialog"
import { formatBillingMonth, parseBillingSummary, type BillingCategory } from "@/lib/monthly-billing-shared"
import { siblingBills } from "@/lib/monthly-billing"
import { vietnamDateKey } from "@/lib/curriculum"

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const siteSettings = await getSiteSettings()
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          code: true,
          parent: { select: { fullName: true, phone: true, email: true } }
        }
      },
      class: { select: { id: true, name: true } },
      course: { select: { id: true, name: true } },
      createdBy: { select: { id: true, fullName: true } },
      lineItems: {
        orderBy: { createdAt: "asc" }
      }
    }
  })

  if (!payment) {
    return notFound()
  }

  // Phiếu thu tháng: số liệu đối chiếu lưu lúc lập phiếu, anh chị em đọc mới (phiếu của các bé có thể lập sau)
  const snapshot = parseBillingSummary(payment.billingSummary)
  const billingSummary =
    snapshot && payment.billingMonth
      ? {
          ...snapshot,
          siblings: await siblingBills(payment.student.id, payment.student.parent?.phone ?? snapshot.parentPhone, payment.billingMonth),
        }
      : null
  const canEditMonthly = Boolean(payment.billingMonth) && payment.status !== "CANCELLED" && payment.status !== "REFUNDED"

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/admin/payments" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Thanh toán {payment.receiptCode || `#${payment.id.slice(0, 8)}`}
          </h2>
          <p className="text-muted-foreground text-sm">
            <Link href={`/admin/students/${payment.student.id}`} className="text-primary hover:underline">
              {payment.student.fullName}
            </Link>
            {payment.class && (
              <>
                {" · "}
                <Link href={`/admin/classes/${payment.class.id}`} className="text-primary hover:underline">
                  {payment.class.name}
                </Link>
              </>
            )}
          </p>
        </div>
        <BadgeStatus status={payment.status} />
      </div>

      <PaymentDetailClient
        payment={JSON.parse(JSON.stringify({ ...payment, billingSummaryData: billingSummary }))}
        siteSettings={siteSettings}
      />

      {billingSummary && payment.billingMonth ? (
        <section className="bg-card space-y-3 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">Học phí tháng {formatBillingMonth(payment.billingMonth)}</h3>
            {canEditMonthly ? (
              <MonthlyBillingDialog
                students={[{ id: payment.student.id, name: payment.student.fullName }]}
                classes={[]}
                edit={{
                  paymentId: payment.id,
                  studentId: payment.student.id,
                  month: payment.billingMonth,
                  lines: payment.lineItems.map((item) => ({
                    description: item.description,
                    category: item.category as BillingCategory,
                    quantity: item.quantity,
                    unitAmount: item.unitAmount,
                  })),
                  dueDate: payment.dueDate ? vietnamDateKey(payment.dueDate) : null,
                  note: payment.note,
                  paidAmount: payment.paidAmount,
                }}
                trigger={<Button variant="outline" size="sm">Sửa phiếu / học liệu</Button>}
              />
            ) : null}
          </div>
          <BillingSummaryView summary={billingSummary} />
          {billingSummary.siblings.length > 0 ? (
            <p className="border-t pt-3 text-sm">
              Cả nhà còn phải đóng tháng này:{" "}
              <strong>{formatMoney(familyRemaining(billingSummary, payment.remainingAmount))}</strong>
            </p>
          ) : null}
        </section>
      ) : null}

      {payment.lineItems.length > 0 ? (
        <section className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold">Danh mục thu</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-muted-foreground text-left">
                <tr className="border-b">
                  <th className="py-2 pr-3 font-medium">Nội dung</th>
                  <th className="py-2 pr-3 font-medium">Danh mục</th>
                  <th className="py-2 pr-3 text-right font-medium">SL</th>
                  <th className="py-2 pr-3 text-right font-medium">Đơn giá</th>
                  <th className="py-2 text-right font-medium">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {payment.lineItems.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 pr-3 font-medium">{item.description}</td>
                    <td className="py-3 pr-3">{categoryLabel(item.category)}</td>
                    <td className="py-3 pr-3 text-right">{item.quantity}</td>
                    <td className="py-3 pr-3 text-right">{formatMoney(item.unitAmount)}</td>
                    <td className="py-3 text-right font-medium">{formatMoney(item.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {payment.qrPayload ? (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="bg-card rounded-lg border p-4">
            <h3 className="font-semibold">QR thanh toán</h3>
            <div className="mt-4 flex flex-col gap-3">
              {payment.qrPayload.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={payment.qrPayload}
                  alt={`QR thanh toán ${payment.receiptCode || payment.id}`}
                  className="h-auto w-full max-w-[280px] rounded-md border bg-white p-2"
                />
              ) : (
                <div className="bg-muted/30 rounded-md border p-3 text-sm font-medium">{payment.qrPayload}</div>
              )}
              <dl className="space-y-2 text-sm">
                <DetailRow label="Ngân hàng" value={payment.bankName || "—"} />
                <DetailRow label="Số tài khoản" value={payment.bankAccountNo || "—"} />
                <DetailRow label="Chủ tài khoản" value={payment.bankAccountName || "—"} />
                <DetailRow 
                  label="Nội dung" 
                  value={payment.student.code ? `ROSY ${payment.student.code} ${removeDiacritics(payment.student.fullName)}`.trim() : `ROSY ${payment.receiptCode || payment.id.slice(0, 8)}`} 
                />
              </dl>
            </div>
          </section>
        </div>
      ) : null}

    </div>
  )
}

function categoryLabel(value: string) {
  const labels: Record<string, string> = {
    TUITION: "Học phí",
    MATERIAL: "Tài liệu",
    TEST: "Kiểm tra",
    MAKE_UP: "Học bù",
    DISCOUNT: "Ưu đãi",
    OTHER: "Khác"
  }
  return labels[value] || value
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(value)
}

function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase();
}
