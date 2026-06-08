"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, GraduationCap, Wallet, UserPlus, Trash2, ExternalLink, UserMinus, MapPin } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { linkStudentToParent, unlinkStudentFromParent } from "@/app/(admin)/admin/parents/actions"
import { BadgeStatus } from "@/components/ui/badge-status"

interface Parent {
  id: string
  fullName: string
  phone: string
  email: string | null
  relationship: string | null
  address: string | null
  notes: string | null
  students: Array<{
    id: string
    fullName: string
    phone: string | null
    email: string | null
    currentLevel: string | null
    status: string
    classStudents: Array<{
      class: {
        id: string
        name: string
        course: { name: string }
      }
    }>
  }>
}

interface AvailableStudent {
  id: string
  fullName: string
  phone: string | null
  currentLevel: string | null
}

interface Payment {
  id: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  status: string
  paymentDate: string | null
  dueDate: string | null
  student: { id: string; fullName: string }
  class: { name: string } | null
  course: { name: string } | null
}

interface ParentDetailClientProps {
  parent: Parent
  availableStudents: AvailableStudent[]
  payments: Payment[]
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ParentDetailClient({
  parent,
  availableStudents,
  payments,
}: ParentDetailClientProps) {
  const router = useRouter()
  const [linkOpen, setLinkOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [isLinking, setIsLinking] = useState(false)
  const [unlinkStudentId, setUnlinkStudentId] = useState<string | null>(null)
  const [isUnlinking, setIsUnlinking] = useState(false)

  const totalDebt = parent.students.reduce(
    (sum, s) => sum + payments.filter((p) => p.student.id === s.id).reduce((s2, p) => s2 + p.remainingAmount, 0),
    0
  )
  const totalPaid = parent.students.reduce(
    (sum, s) => sum + payments.filter((p) => p.student.id === s.id).reduce((s2, p) => s2 + p.paidAmount, 0),
    0
  )

  const handleLink = async () => {
    if (!selectedStudentId) {
      toast.error("Vui lòng chọn học viên")
      return
    }
    setIsLinking(true)
    const res = await linkStudentToParent(parent.id, selectedStudentId)
    setIsLinking(false)
    if (res.success) {
      toast.success("Đã liên kết học viên")
      setLinkOpen(false)
      setSelectedStudentId("")
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleUnlink = async () => {
    if (!unlinkStudentId) return
    setIsUnlinking(true)
    const res = await unlinkStudentFromParent(parent.id, unlinkStudentId)
    setIsUnlinking(false)
    if (res.success) {
      toast.success("Đã hủy liên kết")
      setUnlinkStudentId(null)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Số con
            </CardDescription>
            <CardTitle className="text-2xl">{parent.students.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" /> Đã đóng
            </CardDescription>
            <CardTitle className="text-2xl text-green-700">{formatVND(totalPaid)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" /> Còn nợ
            </CardDescription>
            <CardTitle className="text-2xl text-red-700">{formatVND(totalDebt)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="children" className="space-y-4">
        <TabsList>
          <TabsTrigger value="children" className="gap-2">
            <GraduationCap className="w-4 h-4" /> Con ({parent.students.length})
          </TabsTrigger>
          <TabsTrigger value="info" className="gap-2">
            <UserMinus className="w-4 h-4" /> Thông tin
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <Wallet className="w-4 h-4" /> Thanh toán ({payments.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Con */}
        <TabsContent value="children" className="space-y-3">
          <div className="flex justify-end">
            <Button onClick={() => setLinkOpen(true)} disabled={availableStudents.length === 0}>
              <UserPlus className="w-4 h-4 mr-2" /> Liên kết học viên
            </Button>
          </div>
          {parent.students.length === 0 ? (
            <Card>
              <CardContent className="h-32 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Users className="w-8 h-8 opacity-50" />
                <p>Chưa liên kết học viên nào.</p>
                <p className="text-xs">Click "Liên kết học viên" để thêm.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {parent.students.map((student) => {
                const activeClasses = student.classStudents.map((cs) => cs.class)
                return (
                  <Card key={student.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/admin/students/${student.id}`}
                                className="font-medium hover:underline text-primary"
                              >
                                {student.fullName}
                              </Link>
                              <BadgeStatus status={student.status} />
                              {student.currentLevel && (
                                <Badge variant="outline" className="text-xs">
                                  {student.currentLevel}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {student.phone || "—"}
                              {student.email && ` · ${student.email}`}
                            </p>
                            {activeClasses.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {activeClasses.map((cls) => (
                                  <Link
                                    key={cls.id}
                                    href={`/admin/classes/${cls.id}`}
                                    className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-100"
                                  >
                                    {cls.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            render={<Link href={`/admin/students/${student.id}`} />}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setUnlinkStudentId(student.id)}
                          >
                            <Trash2 className="w-4 h-4" />
          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab Thông tin */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin phụ huynh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Họ tên</p>
                <p className="font-medium">{parent.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Số điện thoại</p>
                <a href={`tel:${parent.phone}`} className="font-medium text-primary hover:underline">
                  {parent.phone}
                </a>
              </div>
              {parent.email && (
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{parent.email}</p>
                </div>
              )}
              {parent.relationship && (
                <div>
                  <p className="text-xs text-muted-foreground">Quan hệ với học viên</p>
                  <p className="font-medium">{parent.relationship}</p>
                </div>
              )}
              {parent.address && (
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Địa chỉ
                  </p>
                  <p className="font-medium">{parent.address}</p>
                </div>
              )}
              {parent.notes && (
                <div>
                  <p className="text-xs text-muted-foreground">Ghi chú</p>
                  <p className="text-sm whitespace-pre-wrap">{parent.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Thanh toán */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử thanh toán của các con</CardTitle>
              <CardDescription>
                Tổng {payments.length} phiếu
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
                  Chưa có phiếu thanh toán nào.
                </div>
              ) : (
                <div className="space-y-2">
                  {payments.map((p) => (
                    <Link
                      key={p.id}
                      href={`/admin/payments/${p.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{p.student.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.class?.name || p.course?.name || "—"} ·{" "}
                          {p.dueDate
                            ? `Hạn: ${format(new Date(p.dueDate), "dd/MM/yyyy", { locale: vi })}`
                            : "Không có hạn"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatVND(p.paidAmount)} / {formatVND(p.totalAmount)}
                        </p>
                        <BadgeStatus status={p.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog liên kết học viên */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Liên kết học viên</DialogTitle>
            <DialogDescription>
              Chọn học viên để liên kết với <strong>{parent.fullName}</strong>.
              Học viên sẽ chuyển từ PH cũ (nếu có) sang PH này.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Chọn học viên</Label>
              <Select
                value={selectedStudentId}
                onValueChange={(v) => setSelectedStudentId(v as string)}
                disabled={isLinking}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn học viên..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Không có HV khả dụng
                    </SelectItem>
                  ) : (
                    availableStudents.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.fullName} {s.phone ? `(${s.phone})` : ""}
                        {s.currentLevel ? ` · ${s.currentLevel}` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            {availableStudents.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Tất cả học viên ACTIVE đã có phụ huynh khác.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkOpen(false)} disabled={isLinking}>
              Hủy
            </Button>
            <Button
              onClick={handleLink}
              disabled={isLinking || !selectedStudentId}
            >
              {isLinking ? "Đang liên kết..." : "Liên kết"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ConfirmDialog hủy liên kết */}
      <ConfirmDialog
        open={unlinkStudentId !== null}
        onOpenChange={(open) => !open && setUnlinkStudentId(null)}
        title="Hủy liên kết học viên?"
        description="Học viên sẽ không còn liên kết với phụ huynh này. Có thể liên kết lại sau."
        confirmText="Hủy liên kết"
        variant="destructive"
        onConfirm={handleUnlink}
        isSubmitting={isUnlinking}
      />
    </div>
  )
}
