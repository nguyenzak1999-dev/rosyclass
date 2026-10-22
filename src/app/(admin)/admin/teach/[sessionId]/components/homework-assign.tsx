"use client"

import * as React from "react"
import { Home, Pencil, Plus } from "lucide-react"
import { homeworkKindInfo } from "@/lib/curriculum"
import { HomeworkDialog, type HomeworkDraft } from "@/app/(admin)/admin/homework/components/homework-dialog"

export type TeachHomework = {
  id: string
  title: string
  instructions: string | null
  kind: string
  dueDateKey: string
  submitted: number
}

/** Đoán loại bài từ nội dung "Bài về nhà" của giáo án */
function guessKind(text: string) {
  const value = text.toLowerCase()
  if (/tô|vẽ|colou?r|draw/.test(value)) return "DRAWING"
  if (/phiếu|worksheet|viết|trace/.test(value)) return "WORKSHEET"
  if (/ghi âm|nói|kể|say|speak/.test(value)) return "SPEAKING"
  if (/nghe|hát|song|listen/.test(value)) return "LISTENING"
  return "OTHER"
}

export function HomeworkAssign({
  classId,
  sessionId,
  lesson,
  homework,
  nextSessionDateKey,
  canWrite,
}: {
  classId: string
  sessionId: string
  lesson: { id: string; title: string; order: number; unitOrder: number; homework: string | null } | null
  homework: TeachHomework[]
  nextSessionDateKey: string
  canWrite: boolean
}) {
  const [draft, setDraft] = React.useState<HomeworkDraft | null>(null)

  const prefill = (): HomeworkDraft => ({
    title: lesson ? `Bài về nhà Unit ${lesson.unitOrder} – Bài ${lesson.order}: ${lesson.title}` : "Bài về nhà",
    instructions: lesson?.homework ?? "",
    kind: guessKind(lesson?.homework ?? ""),
    dueDate: nextSessionDateKey,
    sessionId,
    lessonId: lesson?.id ?? null,
  })

  if (!canWrite && homework.length === 0) return null

  return (
    <section className="kid-border flex flex-wrap items-center gap-2 rounded-[20px] bg-white p-3" aria-label="Bài tập về nhà">
      <span className="inline-flex items-center gap-1.5 font-bold">
        <Home className="h-4 w-4" /> Bài về nhà:
      </span>
      {homework.length === 0 ? <span className="text-sm text-kid-ink-soft">Chưa giao</span> : null}
      {homework.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={!canWrite}
          onClick={() =>
            setDraft({
              id: item.id,
              title: item.title,
              instructions: item.instructions ?? "",
              kind: item.kind,
              dueDate: item.dueDateKey,
              sessionId,
            })
          }
          className="kid-focus inline-flex min-h-10 items-center gap-1.5 rounded-full border-2 border-kid-ink bg-kid-mint-soft px-3 text-sm font-bold disabled:cursor-default"
        >
          <span aria-hidden="true">{homeworkKindInfo(item.kind).emoji}</span>
          <span className="max-w-[16rem] truncate">{item.title}</span>
          <span className="font-normal text-kid-ink-soft">· {item.submitted} bài nộp</span>
          {canWrite ? <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        </button>
      ))}
      {canWrite ? (
        <button
          type="button"
          onClick={() => setDraft(prefill())}
          className="kid-border kid-focus kid-pop ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-full bg-kid-sun px-4 text-sm font-bold"
        >
          <Plus className="h-4 w-4" /> Giao bài về nhà
        </button>
      ) : null}

      <HomeworkDialog
        open={Boolean(draft)}
        onOpenChange={(open) => !open && setDraft(null)}
        classId={classId}
        initial={draft ?? prefill()}
      />
    </section>
  )
}
