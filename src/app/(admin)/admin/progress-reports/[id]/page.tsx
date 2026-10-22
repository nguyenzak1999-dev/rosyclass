import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/get-site-settings"
import { parseReportData, REPORT_STATUS_LABELS } from "@/lib/progress-report"
import { PrintButton } from "@/components/learning/print-button"
import { ReportPrintStyles, ReportSheet } from "@/components/learning/report-sheet"

export const dynamic = "force-dynamic"

export default async function ProgressReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [report, settings] = await Promise.all([
    prisma.progressReport.findUnique({
      where: { id },
      include: { student: { select: { fullName: true } }, class: { select: { id: true, name: true } } },
    }),
    getSiteSettings(),
  ])
  if (!report) notFound()

  return (
    <div className="flex-1 space-y-4 p-2 pt-4 sm:p-4 md:p-8">
      <ReportPrintStyles />
      <div className="report-no-print flex flex-wrap items-center gap-3">
        <Link
          href={`/admin/classes/${report.class.id}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> {report.class.name}
        </Link>
        <p className="min-w-0 flex-1 text-sm text-muted-foreground">
          {report.student.fullName} · {REPORT_STATUS_LABELS[report.status] ?? report.status}
        </p>
        <PrintButton />
      </div>
      <ReportSheet
        report={report}
        data={parseReportData(report.data)}
        centre={{
          siteName: settings.siteName,
          legalName: settings.legalName,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          logoUrl: settings.logoUrl,
        }}
      />
    </div>
  )
}
