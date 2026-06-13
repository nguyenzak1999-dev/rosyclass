"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search } from "lucide-react"
import { addStudentToClass } from "../../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"

type StudentOption = {
  id: string
  fullName: string
  phone: string | null
}



export function AddStudentDialog({
  classId,
  allStudents,
  currentStudentIds
}: {
  classId: string
  allStudents: StudentOption[]
  currentStudentIds: string[]
}) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const router = useRouter()

  // Filter out students that are already in the class
  const availableStudents = allStudents.filter((s) => !currentStudentIds.includes(s.id))

  // Apply search filter
  const filteredStudents = availableStudents.filter(
    (s) => s.fullName.toLowerCase().includes(search.toLowerCase()) || (s.phone && s.phone.includes(search))
  )

  const handleAddStudent = async (studentId: string) => {
    setIsSubmitting(true)
    const res = await addStudentToClass({
      classId,
      studentId,
      createPayment: true
    })
    setIsSubmitting(false)

    if (res.success) {
      toast.success("Đã thêm học viên vào lớp!")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Thêm học viên
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm học viên vào lớp</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">


          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm theo tên, SĐT..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[300px] rounded-md border p-2">
            {filteredStudents.length === 0 ? (
              <div className="text-muted-foreground p-4 text-center">Không tìm thấy học viên phù hợp</div>
            ) : (
              <div className="space-y-2">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{student.fullName}</p>
                      <p className="text-muted-foreground text-sm">{student.phone || "Chưa có SĐT"}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddStudent(student.id)}
                      disabled={isSubmitting}
                    >
                      Thêm
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

