"use client"

import { Search } from "lucide-react"

export interface StudentOption {
  id: string
  fullName: string
  phone: string | null
  currentLevel: string | null
  status?: string
  currentClasses?: { id: string; name: string; courseName: string }[]
}

interface StudentPickerProps {
  students: StudentOption[]
  value: string | null
  onChange: (studentId: string | null) => void
  placeholder?: string
  disabled?: boolean
  showCurrentClasses?: boolean
}

/**
 * Combobox đơn giản dùng <select> + ô search filter.
 * Dùng khi codebase chưa có Command/Popover components.
 */
export function StudentPicker({
  students,
  value,
  onChange,
  placeholder = "Chọn học viên...",
  disabled = false,
  showCurrentClasses = true,
}: StudentPickerProps) {
  const selected = students.find((s) => s.id === value)

  if (selected) {
    return (
      <div className="space-y-2">
        <select
          className="w-full h-10 px-3 border rounded-md bg-background text-sm"
          value={selected.id}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled}
        >
          <option value={selected.id}>
            {selected.fullName} {selected.phone ? `(${selected.phone})` : ""}
          </option>
          <option value="">— Bỏ chọn —</option>
          {students
            .filter((s) => s.id !== selected.id)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} {s.phone ? `(${s.phone})` : ""}
                {s.currentLevel ? ` · ${s.currentLevel}` : ""}
              </option>
            ))}
        </select>
        {showCurrentClasses && selected.currentClasses && selected.currentClasses.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Đang học: {selected.currentClasses.map((c) => c.name).join(", ")}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Gõ để tìm..."
          className="w-full h-10 pl-9 pr-3 border rounded-md bg-background text-sm"
          defaultValue=""
          disabled={disabled}
          id="student-picker-search"
          onChange={(e) => {
            const search = e.target.value.toLowerCase()
            const target = document.getElementById("student-picker-list") as HTMLSelectElement | null
            if (!target) return
            const options = target.querySelectorAll("option")
            options.forEach((opt) => {
              const text = opt.textContent?.toLowerCase() || ""
              ;(opt as HTMLOptionElement).hidden = !text.includes(search)
            })
          }}
        />
      </div>
      <select
        id="student-picker-list"
        className="w-full h-40 px-3 border rounded-md bg-background text-sm"
        value=""
        onChange={(e) => {
          onChange(e.target.value || null)
        }}
        disabled={disabled}
        size={6}
      >
        <option value="">{placeholder}</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.fullName} {s.phone ? `(${s.phone})` : ""}
            {s.currentLevel ? ` · ${s.currentLevel}` : ""}
          </option>
        ))}
      </select>
    </div>
  )
}
