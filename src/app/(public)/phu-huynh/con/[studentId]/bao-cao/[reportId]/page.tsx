import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireParentChild } from "@/lib/parent-portal"
import { getSiteSettings } from "@/lib/get-site-settings"
import { parseReportData } from "@/lib/progress-report"
import { PrintButton } from "@/components/learning/print-button"
import { ReportPrintStyles, ReportSheet } from "@/components/learning/report-sheet"
import { PortalHeader } from "../../../../components/portal-shell"

export default async function ParentReportPage({ params }: { params: Promise<{ studentId: string; reportId: string }> }) {
  const { studentId, reportId } = await params
  const { session, student } = await requireParentChild(studentId)

  const [report, settings] = await Promise.all([
    // Chỉ báo cáo đã gửi, của đúng bé thuộc phụ huynh này
    prisma.progressReport.findFirst({ where: { id: reportId, studentId: student.id, status: "PUBLISHED" } }),
    getSiteSettings(),
  ])
  if (!report) notFound()

  return (
    <div className="space-y-4">
      <ReportPrintStyles />
      <div className="report-no-print">
        <PortalHeader parentName={session.parentName} backHref={`/phu-huynh/con/${student.id}#bao-cao`} backLabel={student.fullName} />
        <div className="flex justify-end">
          <PrintButton />
        </div>
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
