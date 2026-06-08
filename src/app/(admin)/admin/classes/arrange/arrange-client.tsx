"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentPicker, type StudentOption } from "./components/student-picker"
import { ClassSuggestions } from "./components/class-suggestions"
import { TransferDialog } from "./components/transfer-dialog"
import {
  addStudentToClass,
  suggestClassesForStudent,
  type ClassSuggestion,
} from "@/app/(admin)/admin/classes/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { UserPlus, ArrowLeftRight, GraduationCap } from "lucide-react"

interface WaitingStudent {
  id: string
  fullName: string
  phone: string | null
  currentLevel: string | null
  learningGoal: string | null
  age: number | null
  parent: { id: string; fullName: string; phone: string } | null
  placementTest: {
    id: string
    levelResult: string | null
    totalScore: number | null
    suggestedCourse: { id: string; name: string; level: string } | null
    suggestedClass: { id: string; name: string } | null
  } | null
}

interface ClassOption {
  id: string
  name: string
  courseName: string
  currentStudents: number
  maxStudents: number
  status: string
}

interface ArrangeClientProps {
  waitingStudents: WaitingStudent[]
  allStudents: StudentOption[]
  allClasses: ClassOption[]
}

export default function ArrangeClient({
  waitingStudents,
  allStudents,
  allClasses,
}: ArrangeClientProps) {
  const router = useRouter()
  const [tab, setTab] = useState<"new" | "transfer">("new")

  // State cho tab "Xếp HV mới"
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<ClassSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [enrollingClassId, setEnrollingClassId] = useState<string | null>(null)

  // State cho tab "Chuyển lớp"
  const [transferStudentId, setTransferStudentId] = useState<string | null>(null)
  const [transferFromClassId, setTransferFromClassId] = useState<string | null>(null)
  const [transferToClassId, setTransferToClassId] = useState<string | null>(null)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)

  // Tìm HV được chọn
  const selectedStudent = waitingStudents.find((s) => s.id === selectedStudentId)
  const selectedTransferStudent = allStudents.find((s) => s.id === transferStudentId)
  const transferFromClass = selectedTransferStudent?.currentClasses?.find(
    (c) => c.id === transferFromClassId
  )
  const transferToClass = allClasses.find((c) => c.id === transferToClassId)

  // Load suggestions khi chọn HV
  useEffect(() => {
    if (!selectedStudentId) {
      setSuggestions([])
      return
    }
    setLoading(true)
    setSuggestions([])
    suggestClassesForStudent(selectedStudentId).then((res) => {
      setLoading(false)
      if (res.success && res.data) {
        setSuggestions(res.data.suggestions)
      } else {
        toast.error(res.error)
      }
    })
  }, [selectedStudentId])

  const handleEnroll = async (classId: string) => {
    if (!selectedStudentId) return
    setEnrollingClassId(classId)
    const res = await addStudentToClass(classId, selectedStudentId)
    setEnrollingClassId(null)

    if (res.success) {
      toast.success("Đã xếp học viên vào lớp!")
      router.refresh()
      setSelectedStudentId(null)
      setSuggestions([])
    } else {
      toast.error(res.error)
    }
  }

  const handleTransferSuccess = () => {
    setTransferStudentId(null)
    setTransferFromClassId(null)
    setTransferToClassId(null)
    router.refresh()
  }

  const waitingStudentsAsOptions: StudentOption[] = waitingStudents.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    phone: s.phone,
    currentLevel: s.currentLevel,
    status: "WAITING_CLASS",
  }))

  // Lớp đích: loại trừ lớp nguồn + chỉ lấy lớp có thể nhận (UPCOMING/ACTIVE, còn chỗ)
  const destinationClasses = allClasses.filter(
    (c) =>
      c.id !== transferFromClassId &&
      ["UPCOMING", "ACTIVE"].includes(c.status) &&
      c.currentStudents < c.maxStudents
  )

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "new" | "transfer")}>
      <TabsList>
        <TabsTrigger value="new" className="gap-2">
          <UserPlus className="w-4 h-4" /> Xếp học viên mới
        </TabsTrigger>
        <TabsTrigger value="transfer" className="gap-2">
          <ArrowLeftRight className="w-4 h-4" /> Chuyển lớp
        </TabsTrigger>
      </TabsList>

      {/* Tab 1: Xếp HV mới vào lớp */}
      <TabsContent value="new" className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Học viên chờ xếp lớp
                </CardTitle>
                <CardDescription>
                  {waitingStudents.length} học viên đang ở trạng thái WAITING_CLASS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {waitingStudents.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-muted-foreground text-sm gap-2 border-2 border-dashed rounded-lg">
                    <p>Không có học viên chờ xếp lớp.</p>
                    <p className="text-xs">
                      Tạo HV mới với status WAITING_CLASS, hoặc chuyển từ Lead.
                    </p>
                  </div>
                ) : (
                  <>
                    <StudentPicker
                      students={waitingStudentsAsOptions}
                      value={selectedStudentId}
                      onChange={setSelectedStudentId}
                      placeholder="Tìm & chọn học viên..."
                    />
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {waitingStudents.slice(0, 5).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedStudentId(s.id)}
                          className={`w-full text-left p-3 border rounded-lg hover:bg-muted/30 transition-colors ${
                            selectedStudentId === s.id ? "border-primary bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{s.fullName}</p>
                              <p className="text-xs text-muted-foreground">
                                {s.age ? `${s.age} tuổi` : ""} · {s.currentLevel || "Chưa có level"}
                              </p>
                            </div>
                            {s.placementTest?.suggestedCourse && (
                              <Badge variant="outline" className="text-xs">
                                {s.placementTest.suggestedCourse.level}
                              </Badge>
                            )}
                          </div>
                          {s.learningGoal && (
                            <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">
                              Mục tiêu: {s.learningGoal}
                            </p>
                          )}
                        </button>
                      ))}
                      {waitingStudents.length > 5 && (
                        <p className="text-xs text-center text-muted-foreground pt-2">
                          +{waitingStudents.length - 5} học viên khác — dùng ô tìm kiếm ở trên
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {selectedStudent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GraduationCap className="w-4 h-4" />
                    {selectedStudent.fullName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Tuổi</p>
                      <p className="font-medium">{selectedStudent.age || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Trình độ</p>
                      <p className="font-medium">{selectedStudent.currentLevel || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Mục tiêu</p>
                      <p className="font-medium">{selectedStudent.learningGoal || "—"}</p>
                    </div>
                    {selectedStudent.parent && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Phụ huynh</p>
                        <p className="font-medium">
                          {selectedStudent.parent.fullName} · {selectedStudent.parent.phone}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedStudent.placementTest && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        Kết quả Placement Test
                      </p>
                      <p className="text-xs text-blue-800">
                        Level: <strong>{selectedStudent.placementTest.levelResult || "—"}</strong> ·
                        Điểm: {selectedStudent.placementTest.totalScore || "—"}
                      </p>
                      {selectedStudent.placementTest.suggestedCourse && (
                        <p className="text-xs text-blue-800 mt-1">
                          Gợi ý: {selectedStudent.placementTest.suggestedCourse.name}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-3">
            <ClassSuggestions
              loading={loading}
              suggestions={suggestions}
              onEnroll={handleEnroll}
              enrollingClassId={enrollingClassId}
              studentName={selectedStudent?.fullName}
            />
          </div>
        </div>
      </TabsContent>

      {/* Tab 2: Chuyển lớp */}
      <TabsContent value="transfer" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4" />
              Chuyển lớp cho học viên
            </CardTitle>
            <CardDescription>
              Chọn học viên đang học → chọn lớp nguồn → chọn lớp đích.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">
                  1. Học viên
                </label>
                <StudentPicker
                  students={allStudents}
                  value={transferStudentId}
                  onChange={(id) => {
                    setTransferStudentId(id)
                    setTransferFromClassId(null)
                    setTransferToClassId(null)
                  }}
                  placeholder="Chọn học viên..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">
                  2. Lớp nguồn (đang học)
                </label>
                <select
                  className="w-full h-10 px-3 border rounded-md bg-background text-sm disabled:opacity-50"
                  value={transferFromClassId || ""}
                  onChange={(e) => {
                    setTransferFromClassId(e.target.value || null)
                    setTransferToClassId(null)
                  }}
                  disabled={!transferStudentId}
                >
                  <option value="">-- Chọn lớp --</option>
                  {selectedTransferStudent?.currentClasses?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.courseName})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">
                  3. Lớp đích
                </label>
                <select
                  className="w-full h-10 px-3 border rounded-md bg-background text-sm disabled:opacity-50"
                  value={transferToClassId || ""}
                  onChange={(e) => setTransferToClassId(e.target.value || null)}
                  disabled={!transferFromClassId}
                >
                  <option value="">-- Chọn lớp đích --</option>
                  {destinationClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.courseName}) · {c.currentStudents}/{c.maxStudents}
                    </option>
                  ))}
                </select>
                {transferFromClassId && destinationClasses.length === 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Không có lớp nào còn chỗ trống phù hợp.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                onClick={() => {
                  if (!transferStudentId || !transferFromClassId || !transferToClassId) {
                    toast.error("Vui lòng chọn đầy đủ học viên, lớp nguồn và lớp đích")
                    return
                  }
                  setTransferDialogOpen(true)
                }}
                disabled={!transferStudentId || !transferFromClassId || !transferToClassId}
              >
                <ArrowLeftRight className="w-4 h-4 mr-2" /> Chuyển lớp
              </Button>
            </div>

            <TransferDialog
              open={transferDialogOpen}
              onOpenChange={(open) => {
                setTransferDialogOpen(open)
                if (!open) {
                  setTransferStudentId(null)
                  setTransferFromClassId(null)
                  setTransferToClassId(null)
                }
              }}
              student={
                transferStudentId
                  ? {
                      id: transferStudentId,
                      fullName:
                        allStudents.find((s) => s.id === transferStudentId)?.fullName || "",
                    }
                  : null
              }
              fromClass={
                transferFromClass
                  ? { id: transferFromClass.id, name: transferFromClass.name }
                  : null
              }
              toClass={
                transferToClass
                  ? { id: transferToClass.id, name: transferToClass.name }
                  : null
              }
              onSuccess={handleTransferSuccess}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
