import { z } from "zod"
import { studentSchema, type StudentFormValues } from "@/lib/schemas/student"
import { parseVietnamDateKey, vietnamDateKey } from "@/lib/curriculum"

// Form giữ ngày sinh dạng "YYYY-MM-DD" (input type="date") và cho phép bỏ trống các ô chọn;
// chuyển sang StudentFormValues ngay trước khi gọi server action
export const studentFormSchema = studentSchema.extend({
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
})

export type StudentFormInput = z.infer<typeof studentFormSchema>

export const STUDENT_STATUS_ITEMS = [
  { value: "ACTIVE", label: "Đang học" },
  { value: "WAITING_CLASS", label: "Chờ xếp lớp" },
  { value: "RESERVED", label: "Bảo lưu" },
  { value: "PAUSED", label: "Tạm dừng" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "DROPPED", label: "Đã nghỉ" },
]

export const GENDER_ITEMS = [
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" },
  { value: "Khác", label: "Khác" },
]

/** Dữ liệu cũ lưu giới tính bằng tiếng Anh (seed, tab Thông tin cũ) → quy về Nam/Nữ/Khác */
export function normalizeGender(gender: string | null | undefined) {
  const value = gender?.trim()
  if (!value) return ""
  const key = value.toLowerCase()
  if (key === "male" || key === "nam") return "Nam"
  if (key === "female" || key === "nữ" || key === "nu") return "Nữ"
  if (key === "other" || key === "khác" || key === "khac") return "Khác"
  return value
}

type StudentRecord = {
  id: string
  code?: string | null
  fullName: string
  email?: string | null
  phone?: string | null
  dateOfBirth?: Date | string | null
  gender?: string | null
  address?: string | null
  currentLevel?: string | null
  learningGoal?: string | null
  source?: string | null
  status: StudentFormValues["status"]
  notes?: string | null
  parentId?: string | null
  tuitionDiscountPercent?: number | null
}

export const EMPTY_STUDENT_FORM: StudentFormInput = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  status: "ACTIVE",
  gender: "",
  address: "",
  currentLevel: "",
  learningGoal: "",
  source: "",
  notes: "",
  parentId: null,
  tuitionDiscountPercent: 0,
}

/** Bản ghi học viên (null từ DB) → giá trị form (chuỗi rỗng) */
export function toStudentFormInput(student: StudentRecord): StudentFormInput {
  return {
    id: student.id,
    code: student.code || "",
    fullName: student.fullName,
    email: student.email || "",
    phone: student.phone || "",
    dateOfBirth: student.dateOfBirth ? vietnamDateKey(student.dateOfBirth) : "",
    gender: normalizeGender(student.gender),
    address: student.address || "",
    currentLevel: student.currentLevel || "",
    learningGoal: student.learningGoal || "",
    source: student.source || "",
    status: student.status,
    notes: student.notes || "",
    // undefined (không truyền) = giữ nguyên phụ huynh hiện tại
    parentId: student.parentId,
    tuitionDiscountPercent: student.tuitionDiscountPercent ?? 0,
  }
}

/** Giá trị form → dữ liệu gửi upsertStudent (ngày sinh là 00:00 giờ VN) */
export function toStudentPayload(values: StudentFormInput): StudentFormValues {
  return {
    ...values,
    dateOfBirth: values.dateOfBirth === undefined ? undefined : parseVietnamDateKey(values.dateOfBirth),
    gender: values.gender ?? "",
    source: values.source ?? "",
  }
}
