import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BadgeStatus } from "@/components/ui/badge-status"

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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
        },
      },
      class: { select: { id: true, name: true } },
      course: { select: { id: true, name: true } },
      createdBy: { select: { id: true, fullName: true } },
    },
  })

  if (!payment) {
    return notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/admin/payments" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold tracking-tight">Thanh toán #{payment.id.slice(0, 8)}</h2>
          <p className="text-sm text-muted-foreground">
            <Link
              href={`/admin/students/${payment.student.id}`}
              className="hover:underline text-primary"
            >
              {payment.student.fullName}
            </Link>
            {payment.class && (
              <>
                {" · "}
                <Link
                  href={`/admin/classes/${payment.class.id}`}
                  className="hover:underline text-primary"
                >
                  {payment.class.name}
                </Link>
              </>
            )}
          </p>
        </div>
        <BadgeStatus status={payment.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Tổng học phí</p>
          <p className="mt-2 text-2xl font-semibold">{formatMoney(payment.totalAmount)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Đã thanh toán</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{formatMoney(payment.paidAmount)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Còn lại</p>
          <p className="mt-2 text-2xl font-semibold text-orange-600">{formatMoney(payment.remainingAmount)}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold">Thông tin thanh toán</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <DetailRow label="Phương thức" value={payment.paymentMethod} />
            <DetailRow label="Ngày thanh toán" value={formatDate(payment.paymentDate)} />
            <DetailRow label="Hạn thanh toán" value={formatDate(payment.dueDate)} />
            <DetailRow label="Người tạo" value={payment.createdBy.fullName} />
            <DetailRow label="Ngày tạo" value={formatDate(payment.createdAt)} />
          </dl>
        </section>

        <section className="rounded-lg border bg-card p-4">
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

      {payment.note ? (
        <section className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold">Ghi chú</h3>
          <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">{payment.note}</p>
        </section>
      ) : null}
    </div>
  )
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
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: Date | null) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value)
}
