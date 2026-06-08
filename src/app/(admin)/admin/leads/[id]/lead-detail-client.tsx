"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  GraduationCap,
  ClipboardCheck,
  UserPlus,
  BookOpen,
  Clock,
  Phone,
  Mail,
  Target,
  User,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { LeadNotesTab } from "./components/lead-notes-tab"
import { LeadTimelineTab } from "./components/lead-timeline-tab"
import { LeadActionsDialog } from "./components/lead-actions-dialog"
import { deleteLead } from "@/app/(admin)/admin/leads/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface Lead {
  id: string
  fullName: string
  phone: string
  email: string | null
  age: number | null
  parentName: string | null
  parentPhone: string | null
  learningGoal: string | null
  currentLevel: string | null
  source: string | null
  status: string
  createdAt: string | Date
  interestedCourse: { id: string; name: string; level: string } | null
  assignedTo: { id: string; fullName: string; email: string } | null
  leadNotes: Array<{
    id: string
    content: string
    createdAt: string | Date
    createdBy: { id: string; fullName: string } | null
  }>
  placementTests: Array<{
    id: string
    testDate: string | Date
    listeningScore: number | null
    readingScore: number | null
    writingScore: number | null
    speakingScore: number | null
    totalScore: number | null
    levelResult: string | null
  }>
}

interface TimelineItem {
  id: string
  type: "NOTE" | "STATUS" | "PLACEMENT_TEST" | "CREATED"
  date: string | Date
  title: string
  description?: string
  actorName?: string
}

interface LeadDetailClientProps {
  lead: Lead
  timeline: TimelineItem[]
  parents: { id: string; fullName: string; phone: string }[]
}

export default function LeadDetailClient({
  lead,
  timeline,
  parents,
}: LeadDetailClientProps) {
  const router = useRouter()
  const [actionDialog, setActionDialog] = useState<"book" | "convert" | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const res = await deleteLead(lead.id)
    setIsDeleting(false)
    if (res.success) {
      toast.success("Đã xoá lead")
      router.push("/admin/leads")
    } else {
      toast.error(res.error)
    }
  }

  const canConvert = lead.status !== "ENROLLED"

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setActionDialog("book")}
        >
          <ClipboardCheck className="w-4 h-4 mr-2" /> Đặt lịch Placement Test
        </Button>
        {canConvert && (
          <Button onClick={() => setActionDialog("convert")}>
            <UserPlus className="w-4 h-4 mr-2" /> Chuyển thành học viên
          </Button>
        )}
        <div className="flex-1" />
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="w-4 h-4 mr-2" /> Xoá
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Thông tin cơ bản */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Thông tin liên hệ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Họ tên</p>
                <p className="font-medium">{lead.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Số điện thoại</p>
                <a
                  href={`tel:${lead.phone}`}
                  className="font-medium text-primary hover:underline"
                >
                  {lead.phone}
                </a>
              </div>
            </div>
            {lead.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{lead.email}</p>
                </div>
              </div>
            )}
            {lead.parentName && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phụ huynh</p>
                  <p className="font-medium">
                    {lead.parentName} · {lead.parentPhone}
                  </p>
                </div>
              </div>
            )}
            {lead.learningGoal && (
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Mục tiêu</p>
                  <p className="text-sm">{lead.learningGoal}</p>
                </div>
              </div>
            )}
            <Separator />
            {lead.interestedCourse && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Khóa quan tâm</p>
                  <Link
                    href={`/khoa-hoc/${lead.interestedCourse.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {lead.interestedCourse.name}
                  </Link>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {lead.interestedCourse.level}
                  </Badge>
                </div>
              </div>
            )}
            {lead.assignedTo && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tư vấn viên</p>
                  <p className="font-medium">{lead.assignedTo.fullName}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ngày tạo</p>
                <p className="font-medium">
                  {format(new Date(lead.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs: Notes / Placement Tests / Timeline */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="notes" className="space-y-4">
            <TabsList>
              <TabsTrigger value="notes" className="gap-2">
                <ClipboardCheck className="w-4 h-4" /> Ghi chú ({lead.leadNotes.length})
              </TabsTrigger>
              <TabsTrigger value="tests" className="gap-2">
                <GraduationCap className="w-4 h-4" /> Placement Test ({lead.placementTests.length})
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <Clock className="w-4 h-4" /> Timeline ({timeline.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notes">
              <LeadNotesTab leadId={lead.id} initialNotes={lead.leadNotes} />
            </TabsContent>

            <TabsContent value="tests">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử Placement Test</CardTitle>
                  <CardDescription>
                    Tất cả các lần test đã book và kết quả
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {lead.placementTests.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground gap-2">
                      <GraduationCap className="w-8 h-8 opacity-50" />
                      <p>Chưa có placement test nào.</p>
                      <p className="text-xs">Click "Đặt lịch Placement Test" ở trên.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lead.placementTests.map((test) => (
                        <div
                          key={test.id}
                          className="p-3 border rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">
                              {format(new Date(test.testDate), "dd/MM/yyyy", { locale: vi })}
                            </p>
                            {test.totalScore !== null && (
                              <p className="text-sm text-muted-foreground">
                                Tổng điểm: {test.totalScore} · Level: {test.levelResult || "—"}
                              </p>
                            )}
                          </div>
                          {test.totalScore !== null ? (
                            <Badge variant="default">Đã test</Badge>
                          ) : (
                            <Badge variant="outline">Chưa có điểm</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline">
              <LeadTimelineTab timeline={timeline} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <LeadActionsDialog
        open={actionDialog}
        onOpenChange={(open) => !open && setActionDialog(null)}
        lead={lead}
        parents={parents}
        onSuccess={() => {
          setActionDialog(null)
          router.refresh()
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá lead này?"
        description="Hành động này không thể hoàn tác. Tất cả ghi chú và placement test liên quan cũng sẽ bị xoá."
        confirmText="Xoá"
        variant="destructive"
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
    </div>
  )
}
