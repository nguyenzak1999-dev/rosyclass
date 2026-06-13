import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BadgeStatus } from "@/components/ui/badge-status"

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          code: true
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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Tổng học phí</p>
          <p className="mt-2 text-2xl font-semibold">{formatMoney(payment.totalAmount)}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Đã thanh toán</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{formatMoney(payment.paidAmount)}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Còn lại</p>
          <p className="mt-2 text-2xl font-semibold text-orange-600">{formatMoney(payment.remainingAmount)}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold">Thông tin thanh toán</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <DetailRow label="Mã phiếu thu" value={payment.receiptCode || "—"} />
            <DetailRow label="Phương thức" value={payment.paymentMethod} />
            <DetailRow label="Ngày thanh toán" value={formatDate(payment.paymentDate)} />
            <DetailRow label="Hạn thanh toán" value={formatDate(payment.dueDate)} />
            <DetailRow label="Người tạo" value={payment.createdBy.fullName} />
            <DetailRow label="Ngày tạo" value={formatDate(payment.createdAt)} />
          </dl>
        </section>

        <section className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold">Học viên</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <DetailRow label="Họ tên" value={payment.student.fullName} />
            <DetailRow label="Số điện thoại" value={payment.student.phone || "—"} />
            <DetailRow label="Email" value={payment.student.email || "—"} />
            <DetailRow label="Khóa học" value={payment.course?.name || "—"} />
            <DetailRow label="Lớp" value={payment.class?.name || "—"} />
          </dl>
        </section>
      </div>

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

      {payment.note ? (
        <section className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold">Ghi chú</h3>
          <p className="text-muted-foreground mt-3 text-sm whitespace-pre-line">{payment.note}</p>
        </section>
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

function formatDate(value: Date | null) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
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
