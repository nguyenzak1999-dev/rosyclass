import * as z from "zod"

export const branchSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tên chi nhánh là bắt buộc"),
  phone: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
})

export type BranchFormValues = z.infer<typeof branchSchema>
