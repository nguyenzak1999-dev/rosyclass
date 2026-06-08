import * as z from "zod"

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "NO_ANSWER",
  "CONSULTED",
  "PLACEMENT_TEST_BOOKED",
  "TESTED",
  "WAITING_FOR_PAYMENT",
  "ENROLLED",
  "LOST",
] as const

export const LEAD_SOURCES = [
  "Facebook",
  "Website",
  "Người quen giới thiệu",
  "Biển hiệu/Tờ rơi",
  "Zalo",
  "Khác",
] as const

export const leadSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(1, "Tên khách hàng là bắt buộc"),
  phone: z.string().min(1, "Số điện thoại là bắt buộc"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  age: z.coerce.number().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  learningGoal: z.string().optional(),
  currentLevel: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(LEAD_STATUSES).default("NEW"),
  notes: z.string().optional(),
})

export type LeadFormValues = z.infer<typeof leadSchema>

/**
 * Schema cho thêm lead note
 */
export const addLeadNoteSchema = z.object({
  leadId: z.string().min(1, "Thiếu ID lead"),
  content: z
    .string()
    .min(1, "Nội dung ghi chú là bắt buộc")
    .max(2000, "Ghi chú tối đa 2000 ký tự"),
})

export type AddLeadNoteFormValues = z.infer<typeof addLeadNoteSchema>

/**
 * Schema cho book placement test
 */
export const bookPlacementTestSchema = z.object({
  leadId: z.string().min(1, "Thiếu ID lead"),
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ"),
  notes: z.string().max(500).optional(),
})

export type BookPlacementTestFormValues = z.infer<typeof bookPlacementTestSchema>

/**
 * Schema cho update lead status
 */
export const updateLeadStatusSchema = z.object({
  leadId: z.string().min(1, "Thiếu ID lead"),
  status: z.enum(LEAD_STATUSES),
  note: z.string().max(500).optional(),
})

export type UpdateLeadStatusFormValues = z.infer<typeof updateLeadStatusSchema>

/**
 * Schema cho convert lead → student
 */
export const convertLeadToStudentSchema = z.object({
  leadId: z.string().min(1, "Thiếu ID lead"),
  // Optional override các field
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  currentLevel: z.string().optional(),
  learningGoal: z.string().optional(),
  status: z
    .enum(["ACTIVE", "WAITING_CLASS", "RESERVED", "PAUSED"])
    .default("WAITING_CLASS"),
  parentId: z.string().optional().nullable(),
})

export type ConvertLeadToStudentFormValues = z.infer<typeof convertLeadToStudentSchema>
