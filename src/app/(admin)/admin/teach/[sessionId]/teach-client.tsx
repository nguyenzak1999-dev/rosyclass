"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, BookOpen, CheckCheck, ExternalLink, Music, Save, School } from "lucide-react"
import { cn } from "@/lib/utils"
import { saveTeachSession } from "../actions"
import { CountdownTimer } from "./components/countdown-timer"
import { RandomPicker } from "./components/random-picker"
import { isAbsent, StudentCard, type AttendanceValue, type StudentDraft } from "./components/student-card"
import { HomeworkAssign, type TeachHomework } from "./components/homework-assign"

export type TeachStudent = {
  id: string
  fullName: string
  /** Bé lớp khác được xếp học bù vào buổi này */
  isGuest: boolean
  status: AttendanceValue | null
  hasFeedback: boolean
  stars: number
  praises: string[]
  mood: string | null
  comment: string
  totalStars: number
}

export type TeachLesson = {
  title: string
  order: number
  objectives: string | null
  activities: string | null
  materials: string | null
  mediaUrl: string | null
  homework: string | null
  unit: {
    order: number
    title: string
    objectives: string | null
    vocabulary: string[]
    sentencePatterns: string[]
    phonics: string | null
    songUrl: string | null
  }
}

type TeachSession = {
  id: string
  classId: string
  className: string
  courseName: string
  dateLabel: string
  startTime: string
  endTime: string
  status: string
  topic: string | null
  teacherName: string | null
  roomName: string | null
}

type Drafts = Record<string, StudentDraft>

function toDraft(student: TeachStudent): StudentDraft {
  return {
    status: student.status,
    stars: student.stars,
    praises: student.praises,
    mood: student.mood,
    comment: student.comment,
  }
}

function toDrafts(students: TeachStudent[]): Drafts {
  return Object.fromEntries(students.map((student) => [student.id, toDraft(student)]))
}

/** Bé mới xuất hiện sau khi tải lại (vd. vừa được xếp học bù) chưa có bản nháp: lấy từ dữ liệu server */
function draftOf(drafts: Drafts, student: TeachStudent) {
  return drafts[student.id] ?? toDraft(student)
}

function sameDraft(a: StudentDraft, b: StudentDraft) {
  return (
    a.status === b.status &&
    a.stars === b.stars &&
    a.mood === b.mood &&
    a.comment.trim() === b.comment.trim() &&
    a.praises.length === b.praises.length &&
    a.praises.every((praise) => b.praises.includes(praise))
  )
}

function hasFeedbackContent(draft: StudentDraft) {
  return draft.stars > 0 || draft.praises.length > 0 || Boolean(draft.mood) || draft.comment.trim().length > 0
}

export function TeachClient({
  session,
  lesson,
  lessonRef,
  homework,
  nextSessionDateKey,
  students,
  canWrite,
}: {
  session: TeachSession
  lesson: TeachLesson | null
  lessonRef: { id: string; title: string; order: number; unitOrder: number; homework: string | null } | null
  homework: TeachHomework[]
  nextSessionDateKey: string
  students: TeachStudent[]
  canWrite: boolean
}) {
  const router = useRouter()
  const [drafts, setDrafts] = React.useState<Drafts>(() => toDrafts(students))
  const [saved, setSaved] = React.useState<Drafts>(() => toDrafts(students))
  const [savedFeedbackIds, setSavedFeedbackIds] = React.useState<Set<string>>(
    () => new Set(students.filter((student) => student.hasFeedback).map((student) => student.id))
  )
  const [highlightId, setHighlightId] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  const changedIds = React.useMemo(
    () => students.filter((student) => !sameDraft(draftOf(drafts, student), draftOf(saved, student))).map((student) => student.id),
    [drafts, saved, students]
  )
  const dirty = changedIds.length > 0

  // Nhắc khi rời trang mà chưa lưu
  React.useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [dirty])

  const updateDraft = React.useCallback(
    (id: string, patch: Partial<StudentDraft>) => {
      const student = students.find((item) => item.id === id)
      if (!student) return
      setDrafts((current) => ({ ...current, [id]: { ...draftOf(current, student), ...patch } }))
    },
    [students]
  )

  const markAllPresent = () => {
    setDrafts((current) => {
      const next = { ...current }
      for (const student of students) {
        const draft = draftOf(next, student)
        if (!draft.status) next[student.id] = { ...draft, status: student.isGuest ? "MAKE_UP" : "PRESENT" }
      }
      return next
    })
  }

  const recorded = students.filter((student) => draftOf(drafts, student).status).length
  const presentCount = students.filter((student) => {
    const status = draftOf(drafts, student).status
    return status && !isAbsent(status)
  }).length

  const presentCandidates = students.filter((student) => {
    const status = draftOf(drafts, student).status
    return status && !isAbsent(status)
  })
  const usingFallback = presentCandidates.length === 0
  const pickerCandidates = (usingFallback ? students.filter((student) => !draftOf(drafts, student).status) : presentCandidates).map(
    (student) => ({ id: student.id, fullName: student.fullName })
  )

  const onPicked = React.useCallback((studentId: string | null) => {
    setHighlightId(studentId)
    if (studentId) {
      document.getElementById(`student-${studentId}`)?.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      })
    }
  }, [])

  const save = async () => {
    setSaving(true)
    const snapshot = drafts
    const result = await saveTeachSession({
      sessionId: session.id,
      attendances: students
        .filter((student) => draftOf(snapshot, student).status)
        .map((student) => ({ studentId: student.id, status: draftOf(snapshot, student).status as AttendanceValue })),
      feedbacks: students
        .filter((student) => hasFeedbackContent(draftOf(snapshot, student)) || savedFeedbackIds.has(student.id))
        .map((student) => {
          const draft = draftOf(snapshot, student)
          return {
            studentId: student.id,
            stars: draft.stars,
            praises: draft.praises,
            mood: draft.mood,
            comment: draft.comment.trim() || null,
          }
        }),
    }).catch(() => ({ success: false as const, error: "Không thể lưu buổi học, vui lòng thử lại", data: undefined }))
    setSaving(false)

    if (!result.success || !result.data) {
      toast.error(result.error)
      return
    }
    setSaved(snapshot)
    setSavedFeedbackIds((current) => {
      const next = new Set(current)
      for (const student of students) if (hasFeedbackContent(draftOf(snapshot, student))) next.add(student.id)
      return next
    })
    toast.success(
      result.data.completed ? "Đã lưu. Cả lớp đã được điểm danh, buổi học chuyển sang Hoàn thành." : "Đã lưu điểm danh và nhận xét"
    )
    router.refresh()
  }

  return (
    <div className="theme-client -m-3 flex min-h-full flex-col bg-kid-cream text-kid-ink sm:-m-4">
      <div className="mx-auto w-full max-w-6xl flex-1 space-y-4 p-3 sm:p-5">
        {/* Đầu trang: lớp, giờ, bài */}
        <header className="flex flex-wrap items-start gap-3">
          <Link
            href="/admin/teach"
            aria-label="Về danh sách buổi học hôm nay"
            className="kid-border kid-focus flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-kid-display text-2xl leading-tight font-bold sm:text-3xl">{session.className}</h1>
            <p className="text-sm text-kid-ink-soft">
              {session.dateLabel} · {session.startTime} – {session.endTime}
              {session.roomName ? ` · ${session.roomName}` : ""}
              {session.teacherName ? ` · GV ${session.teacherName}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/classes/${session.classId}`}
              className="kid-border kid-focus inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold"
            >
              <School className="h-4 w-4" /> Trang lớp học
            </Link>
            <Link
              href={`/admin/schedules/${session.id}`}
              className="kid-border kid-focus inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-bold"
            >
              Chi tiết buổi
            </Link>
          </div>
        </header>

        {session.status === "CANCELLED" ? (
          <p className="kid-border rounded-[20px] bg-kid-orange-soft p-3 font-semibold">Buổi học này đã bị huỷ nên không điểm danh được.</p>
        ) : null}

        <LessonPanel lesson={lesson} topic={session.topic} />

        <HomeworkAssign
          classId={session.classId}
          sessionId={session.id}
          lesson={lessonRef}
          homework={homework}
          nextSessionDateKey={nextSessionDateKey}
          canWrite={canWrite}
        />

        {/* Công cụ trên lớp */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <RandomPicker candidates={pickerCandidates} onPicked={onPicked} usingFallback={usingFallback} />
          <CountdownTimer />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-kid-display text-xl font-bold">
            Các bé ({presentCount}/{students.length} có mặt)
          </h2>
          {canWrite && recorded < students.length ? (
            <button
              type="button"
              onClick={markAllPresent}
              className="kid-border kid-focus inline-flex min-h-11 items-center gap-1.5 rounded-full bg-kid-mint-soft px-4 text-sm font-bold"
            >
              <CheckCheck className="h-4 w-4" /> Các bé còn lại có mặt
            </button>
          ) : null}
        </div>

        {students.length === 0 ? (
          <p className="kid-border rounded-[24px] bg-white p-6 text-center">Lớp chưa có học viên nào.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                id={student.id}
                fullName={student.fullName}
                isGuest={student.isGuest}
                totalStars={student.totalStars}
                draft={draftOf(drafts, student)}
                highlighted={highlightId === student.id}
                disabled={!canWrite}
                onChange={updateDraft}
              />
            ))}
          </div>
        )}
      </div>

      {canWrite ? (
        <div className="sticky bottom-0 z-20 border-t-[3px] border-kid-ink bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-3 sm:px-5">
            <p className="min-w-0 flex-1 text-sm">
              <span className="font-bold">
                {recorded}/{students.length}
              </span>{" "}
              bé đã điểm danh
              {dirty ? (
                <span className="ml-2 font-semibold text-kid-rose">· {changedIds.length} bé có thay đổi chưa lưu</span>
              ) : (
                <span className="ml-2 text-kid-ink-soft">· Đã lưu</span>
              )}
            </p>
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty}
              className="kid-border kid-shadow-sm kid-pop kid-focus inline-flex min-h-12 items-center gap-2 rounded-full bg-kid-rose px-7 text-lg font-bold text-white disabled:opacity-50"
            >
              <Save className="h-5 w-5" /> {saving ? "Đang lưu…" : "Lưu"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function LessonPanel({ lesson, topic }: { lesson: TeachLesson | null; topic: string | null }) {
  if (!lesson) {
    return (
      <section className="kid-border rounded-[24px] bg-white p-4">
        <p className="font-kid-display text-lg font-bold">{topic || "Buổi này chưa gắn bài học"}</p>
        <p className="text-sm text-kid-ink-soft">
          Gắn chương trình cho lớp rồi bấm &quot;Gán bài cho các buổi học&quot; ở tab Lịch học của lớp, hoặc chọn bài trong &quot;Sửa buổi
          học&quot;.
        </p>
      </section>
    )
  }

  const { unit } = lesson
  return (
    <section className="kid-border kid-shadow-sm space-y-3 rounded-[24px] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-kid-rose">
            Unit {unit.order}: {unit.title}
          </p>
          <h2 className="font-kid-display text-2xl leading-tight font-bold">
            Bài {lesson.order}: {lesson.title}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {unit.songUrl ? (
            <a
              href={unit.songUrl}
              target="_blank"
              rel="noreferrer"
              className="kid-focus inline-flex min-h-10 items-center gap-1.5 rounded-full border-2 border-kid-ink bg-kid-sky-soft px-3 text-sm font-bold"
            >
              <Music className="h-4 w-4" /> Bài hát
            </a>
          ) : null}
          {lesson.mediaUrl ? (
            <a
              href={lesson.mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="kid-focus inline-flex min-h-10 items-center gap-1.5 rounded-full border-2 border-kid-ink bg-kid-grape-soft px-3 text-sm font-bold"
            >
              <ExternalLink className="h-4 w-4" /> Media
            </a>
          ) : null}
        </div>
      </div>

      {lesson.objectives || unit.objectives ? (
        <p className="text-sm">
          <span className="font-bold">Mục tiêu: </span>
          {lesson.objectives || unit.objectives}
        </p>
      ) : null}

      {unit.vocabulary.length > 0 ? (
        <div className="flex flex-wrap gap-1.5" aria-label="Từ vựng">
          {unit.vocabulary.map((word) => (
            <span key={word} className="rounded-full border-2 border-kid-ink bg-kid-sun-soft px-3 py-1 font-kid-display text-base font-bold">
              {word}
            </span>
          ))}
        </div>
      ) : null}

      {unit.sentencePatterns.length > 0 || unit.phonics ? (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {unit.sentencePatterns.length > 0 ? (
            <p>
              <span className="font-bold">Mẫu câu: </span>
              {unit.sentencePatterns.join(" · ")}
            </p>
          ) : null}
          {unit.phonics ? (
            <p>
              <span className="font-bold">Phonics: </span>
              {unit.phonics}
            </p>
          ) : null}
        </div>
      ) : null}

      {lesson.activities || lesson.materials || lesson.homework ? (
        <details className="group rounded-[18px] bg-kid-cream p-3" open>
          <summary className="kid-focus flex cursor-pointer list-none items-center gap-2 rounded-lg font-bold">
            <BookOpen className="h-4 w-4" /> Giáo án
            <span className="text-xs font-normal text-kid-ink-soft group-open:hidden">(bấm để mở)</span>
          </summary>
          <div className="mt-2 grid gap-3 text-sm md:grid-cols-[2fr_1fr]">
            {lesson.activities ? <p className={cn("whitespace-pre-wrap leading-relaxed")}>{lesson.activities}</p> : <span />}
            <div className="space-y-2">
              {lesson.materials ? (
                <p>
                  <span className="font-bold">Đồ dùng: </span>
                  {lesson.materials}
                </p>
              ) : null}
              {lesson.homework ? (
                <p className="rounded-[14px] border-2 border-kid-ink bg-white p-2">
                  <span className="font-bold">🏠 Bài về nhà: </span>
                  {lesson.homework}
                </p>
              ) : null}
            </div>
          </div>
        </details>
      ) : null}
    </section>
  )
}
