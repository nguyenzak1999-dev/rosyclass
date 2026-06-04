export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Báo cáo hệ thống</h1>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[400px]">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Chưa có báo cáo nào
          </h3>
          <p className="text-sm text-muted-foreground">
            Tính năng đang được phát triển. Bạn có thể sử dụng Dashboard để xem các báo cáo cơ bản.
          </p>
        </div>
      </div>
    </div>
  )
}
