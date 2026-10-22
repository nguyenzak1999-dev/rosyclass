"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MessageSquarePlus, Save, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SKILL_LEVELS, SKILLS } from "@/lib/curriculum"
import { cn } from "@/lib/utils"
import { saveSkillAssessments } from "@/app/(admin)/admin/progress-reports/actions"
import { nativeSelectClass } from "@/app/(admin)/admin/homework/components/homework-dialog"

export type SkillAssessmentRow = { studentId: string; unitId: string; skill: string; level: number; note: string | null }

type Cell = { level: number | null; note: string }
type Cells = Record<string, Cell>

const cellKey = (studentId: string, skill: string) => `${studentId}:${skill}`

const LEVEL_STYLES: Record<number, string> = {
  1: "border-orange-400 bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100",
  2: "border-sky-400 bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100",
  3: "border-emerald-500 bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
}

function buildCells(assessments: SkillAssessmentRow[], unitId: string, students: { id: string }[]): Cells {
  const cells: Cells = {}
  for (const student of students) {
    for (const skill of SKILLS) cells[cellKey(student.id, skill.value)] = { level: null, note: "" }
  }
  for (const row of assessments) {
    if (row.unitId !== unitId) continue
    const key = cellKey(row.studentId, row.skill)
    if (key in cells) cells[key] = { level: row.level, note: row.note ?? "" }
  }
  return cells
}

export function ClassSkillsTab({
  classId,
  curriculum,
  units,
  defaultUnitId,
  students,
  assessments,
  canWrite,
}: {
  classId: string
  curriculum: { id: string; name: string } | null
  units: { id: string; order: number; title: string }[]
  defaultUnitId: string | null
  students: { id: string; fullName: string }[]
  assessments: SkillAssessmentRow[]
  canWrite: boolean
}) {
  const router = useRouter()
  const [unitId, setUnitId] = React.useState(defaultUnitId ?? units[0]?.id ?? "")
  const [saved, setSaved] = React.useState<Cells>(() => buildCells(assessments, unitId, students))
  const [cells, setCells] = React.useState<Cells>(saved)
  const [openNotes, setOpenNotes] = React.useState<Set<string>>(new Set())
  const [saving, setSaving] = React.useState(false)

  const changedKeys = Object.keys(cells).filter(
    (key) => cells[key].level !== saved[key]?.level || cells[key].note.trim() !== (saved[key]?.note ?? "").trim()
  )
  const dirty = changedKeys.length > 0

  const switchUnit = (nextUnitId: string) => {
    if (dirty) toast.warning("Các thay đổi chưa lưu của Unit trước đã bị bỏ")
    const next = buildCells(assessments, nextUnitId, students)
    setUnitId(nextUnitId)
    setSaved(next)
    setCells(next)
    setOpenNotes(new Set())
  }

  // Dữ liệu server thay đổi (sau khi lưu, router.refresh) → đồng bộ lại bản đã lưu
  const [syncedAssessments, setSyncedAssessments] = React.useState(assessments)
  if (syncedAssessments !== assessments) {
    setSyncedAssessments(assessments)
    const next = buildCells(assessments, unitId, students)
    setSaved(next)
    if (!dirty) setCells(next)
  }

  const setLevel = (key: string, level: number) =>
    setCells((current) => ({ ...current, [key]: { ...current[key], level: current[key].level === level ? null : level } }))

  const fillEmpty = () =>
    setCells((current) => {
      const next = { ...current }
      for (const key of Object.keys(next)) if (next[key].level === null) next[key] = { ...next[key], level: 2 }
      return next
    })

  const save = async () => {
    setSaving(true)
    const entries = changedKeys.map((key) => {
      const [studentId, skill] = key.split(":")
      return { studentId, skill, level: cells[key].level, note: cells[key].note }
    })
    const result = await saveSkillAssessments({ classId, unitId, entries })
    setSaving(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setSaved(cells)
    toast.success("Đã lưu đánh giá kỹ năng")
    router.refresh()
  }

  if (!curriculum) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Lớp chưa gắn chương trình học. Gắn chương trình (Sửa lớp → Chương trình) để đánh giá kỹ năng theo từng Unit.
        </CardContent>
      </Card>
    )
  }

  if (units.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Chương trình{" "}
          <Link href={`/admin/curriculums/${curriculum.id}`} className="text-primary hover:underline">
            {curriculum.name}
          </Link>{" "}
          chưa có Unit nào.
        </CardContent>
      </Card>
    )
  }

  const assessedCount = Object.values(cells).filter((cell) => cell.level !== null).length

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <CardTitle>Đánh giá kỹ năng cuối Unit</CardTitle>
          <CardDescription>3 mức: Cần cố gắng / Đạt / Tốt (theo Cambridge Pre-A1 Starters). Bấm lại mức đang chọn để bỏ.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="skills-unit" className="text-sm text-muted-foreground">
            Unit
          </label>
          <select
            id="skills-unit"
            className={cn(nativeSelectClass, "w-auto min-w-[220px]")}
            value={unitId}
            onChange={(event) => switchUnit(event.target.value)}
          >
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                Unit {unit.order}: {unit.title}
              </option>
            ))}
          </select>
          {canWrite ? (
            <Button variant="outline" size="sm" onClick={fillEmpty}>
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Ô trống → Đạt
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {students.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Lớp chưa có học viên đang học.</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {students.map((student) => (
              <div key={student.id} className="space-y-2 rounded-xl border p-3">
                <p className="font-semibold">{student.fullName}</p>
                <div className="space-y-1.5">
                  {SKILLS.map((skill) => {
                    const key = cellKey(student.id, skill.value)
                    const cell = cells[key]
                    const noteOpen = openNotes.has(key) || Boolean(cell.note)
                    return (
                      <div key={skill.value} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-24 shrink-0 text-sm">
                            <span aria-hidden="true">{skill.emoji}</span> {skill.label}
                          </span>
                          <div className="flex flex-1 gap-1.5" role="group" aria-label={`${skill.label} của ${student.fullName}`}>
                            {SKILL_LEVELS.map((level) => {
                              const selected = cell.level === level.value
                              return (
                                <button
                                  key={level.value}
                                  type="button"
                                  disabled={!canWrite}
                                  aria-pressed={selected}
                                  title={level.label}
                                  onClick={() => setLevel(key, level.value)}
                                  className={cn(
                                    "min-h-10 flex-1 rounded-lg border-2 px-1 text-xs font-semibold transition-colors disabled:cursor-default sm:text-sm",
                                    selected ? LEVEL_STYLES[level.value] : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted"
                                  )}
                                >
                                  {level.value} · {level.short}
                                </button>
                              )
                            })}
                          </div>
                          {canWrite ? (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 shrink-0"
                              aria-label={`Ghi chú ${skill.label} của ${student.fullName}`}
                              onClick={() =>
                                setOpenNotes((current) => {
                                  const next = new Set(current)
                                  if (next.has(key)) next.delete(key)
                                  else next.add(key)
                                  return next
                                })
                              }
                            >
                              <MessageSquarePlus className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                        {noteOpen ? (
                          <Input
                            value={cell.note}
                            disabled={!canWrite}
                            maxLength={300}
                            placeholder={`Ghi chú về kỹ năng ${skill.label.toLowerCase()} (tuỳ chọn)`}
                            onChange={(event) =>
                              setCells((current) => ({ ...current, [key]: { ...current[key], note: event.target.value } }))
                            }
                            className="ml-26 h-8 w-[calc(100%-6.5rem)] text-sm"
                          />
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {canWrite && students.length > 0 ? (
          <div className="sticky bottom-0 flex items-center justify-between gap-3 rounded-lg border bg-background/95 p-3 backdrop-blur">
            <p className="text-sm">
              Đã đánh giá {assessedCount}/{students.length * SKILLS.length} ô
              {dirty ? <span className="ml-2 font-medium text-amber-600">· {changedKeys.length} ô chưa lưu</span> : null}
            </p>
            <Button onClick={save} disabled={saving || !dirty}>
              <Save className="mr-2 h-4 w-4" /> {saving ? "Đang lưu..." : "Lưu đánh giá"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
