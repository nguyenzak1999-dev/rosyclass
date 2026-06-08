"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  User,
  MapPin,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import type { ClassSuggestion } from "@/app/(admin)/admin/classes/actions"

interface ClassSuggestionsProps {
  loading: boolean
  suggestions: ClassSuggestion[]
  onEnroll: (classId: string) => void
  enrollingClassId: string | null
  studentName?: string
}

export function ClassSuggestions({
  loading,
  suggestions,
  onEnroll,
  enrollingClassId,
  studentName,
}: ClassSuggestionsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Đang tìm lớp phù hợp...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Gợi ý lớp học
          </CardTitle>
          <CardDescription>
            Chọn học viên ở cột bên trái để xem gợi ý.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground text-sm gap-2 border-2 border-dashed rounded-lg">
            <GraduationCap className="w-8 h-8 opacity-50" />
            <p>Chưa có gợi ý nào.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Top {suggestions.length} lớp phù hợp
        </CardTitle>
        <CardDescription>
          Sắp xếp theo điểm phù hợp với {studentName || "học viên đã chọn"}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((s) => {
          const isFull = s.currentStudents >= s.maxStudents
          const remaining = s.maxStudents - s.currentStudents
          const isEnrolling = enrollingClassId === s.classId
          const scoreColor =
            s.score >= 50
              ? "text-green-700 bg-green-50"
              : s.score >= 20
              ? "text-blue-700 bg-blue-50"
              : s.score >= 0
              ? "text-gray-700 bg-gray-50"
              : "text-red-700 bg-red-50"

          return (
            <div
              key={s.classId}
              className="border rounded-lg p-4 space-y-2 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{s.className}</h4>
                    <Badge variant="outline" className="text-xs">
                      {s.courseLevel}
                    </Badge>
                    {s.hasScheduleConflict && (
                      <Badge variant="destructive" className="text-xs gap-1">
                        <AlertTriangle className="w-3 h-3" /> Trùng lịch
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{s.courseName}</p>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-bold ${scoreColor}`}
                  title="Điểm phù hợp"
                >
                  {s.score >= 0 ? "+" : ""}
                  {s.score}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate">{s.teacherName || "Chưa có GV"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{s.branchName || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {s.currentStudents}/{s.maxStudents}
                    {remaining > 0 && (
                      <span className="text-green-600 ml-1">
                        (còn {remaining})
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic">
                {s.reason}
              </p>

              <Button
                size="sm"
                className="w-full"
                disabled={isFull || isEnrolling}
                onClick={() => onEnroll(s.classId)}
              >
                {isFull ? (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" /> Lớp đã đủ
                  </>
                ) : isEnrolling ? (
                  "Đang xếp..."
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Xếp vào lớp này
                  </>
                )}
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
