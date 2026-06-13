"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { type ClassFormValues } from "@/lib/schemas/class"

const ClassDialog = dynamic(
  () => import("./class-dialog").then((mod) => mod.ClassDialog),
  {
    ssr: false,
    loading: () => <Button disabled>Đang tải...</Button>,
  }
)

interface LazyClassDialogProps {
  initialData?: ClassFormValues
  trigger?: React.ReactElement<{ onClick?: React.MouseEventHandler }>
  courses: { id: string; name: string }[]
  teachers?: { id: string; fullName: string }[]
  teachingAssistants?: { id: string; fullName: string }[]
  branches?: { id: string; name: string }[]
  rooms?: { id: string; name: string; capacity: number; branchId: string; branch: { name: string } }[]
  students?: { id: string; fullName: string; phone: string | null; email: string | null }[]
}

export function LazyClassDialog({
  initialData,
  trigger,
  courses,
  teachers = [],
  teachingAssistants = [],
  branches = [],
  rooms = [],
  students = [],
}: LazyClassDialogProps) {
  const [shouldLoad, setShouldLoad] = React.useState(false)

  if (shouldLoad) {
    return (
      <ClassDialog
        initialData={initialData}
        trigger={trigger}
        courses={courses}
        teachers={teachers}
        teachingAssistants={teachingAssistants}
        branches={branches}
        rooms={rooms}
        students={students}
        defaultOpen
      />
    )
  }

  if (trigger) {
    return React.cloneElement(trigger, {
      onClick: (event: React.MouseEvent) => {
        trigger.props.onClick?.(event)
        if (!event.defaultPrevented) {
          setShouldLoad(true)
        }
      },
    })
  }

  return <Button onClick={() => setShouldLoad(true)}>+ Thêm Lớp học</Button>
}
