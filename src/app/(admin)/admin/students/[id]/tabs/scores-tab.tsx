"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatVietnam } from "@/lib/curriculum"
import { Award } from "lucide-react"

function ScoreBar({ label, score, max = 10 }: { label: string; score: number | null; max?: number }) {
  const pct = score !== null ? Math.round((score / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{score !== null ? `${score}/${max}` : "—"}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function ScoresTab({ student }: { student: any }) {
  const tests = student.placementTests || []

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Điểm số & kết quả kiểm tra</h3>
        <p className="text-sm text-muted-foreground">Lịch sử các bài kiểm tra và đề xuất lộ trình học tập</p>
      </div>

      {tests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Chưa có dữ liệu điểm số</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tests.map((test: any, idx: number) => (
            <Card key={test.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Bài kiểm tra #{tests.length - idx} — {formatVietnam(new Date(test.testDate), "dd/MM/yyyy")}
                  </CardTitle>
                  {test.totalScore !== null && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{test.totalScore}</div>
                      <div className="text-xs text-muted-foreground">Điểm tổng</div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ScoreBar label="Nghe (Listening)" score={test.listeningScore} />
                  <ScoreBar label="Đọc (Reading)" score={test.readingScore} />
                  <ScoreBar label="Viết (Writing)" score={test.writingScore} />
                  <ScoreBar label="Nói (Speaking)" score={test.speakingScore} />
                </div>
                {test.levelResult && (
                  <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                    <p className="text-sm font-medium">Kết quả xếp loại: <span className="text-primary">{test.levelResult}</span></p>
                  </div>
                )}
                {test.teacherComment && (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">Nhận xét của giáo viên:</p>
                    <p className="text-sm">{test.teacherComment}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
