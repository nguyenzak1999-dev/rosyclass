"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { pageSchema, type PageFormValues } from "@/lib/schemas/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { upsertPage } from "../actions"
import { createBuilderPage } from "../builder-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { generateSlug } from "@/lib/slug"
import { HOME_PAGE_SLUG, isFixedSlug } from "@/lib/page-builder/constants"

interface PageDialogData {
  id: string
  title: string
  slug: string
  status: string
  seoTitle: string | null
  seoDescription: string | null
}

interface PageDialogProps {
  initialData?: PageDialogData
  trigger?: React.ReactElement
}

const statusLabels: Record<PageFormValues["status"], string> = {
  PUBLISHED: "Đã xuất bản",
  ACTIVE: "Đang hiển thị",
  DRAFT: "Nháp",
  INACTIVE: "Ẩn",
}

export function PageDialog({ initialData, trigger }: PageDialogProps) {
  return initialData ? <EditPageDialog initialData={initialData} trigger={trigger} /> : <CreatePageDialog trigger={trigger} />
}

/** Tạo trang mới rồi mở ngay trình thiết kế */
function CreatePageDialog({ trigger }: { trigger?: React.ReactElement }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [slugTouched, setSlugTouched] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setTitle("")
      setSlug("")
      setSlugTouched(false)
      setError(null)
    }
    setOpen(next)
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await createBuilderPage({ title, slug })
    setSubmitting(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    toast.success("Đã tạo trang, đang mở trình thiết kế...")
    setOpen(false)
    router.push(`/admin/cms/pages/${result.id}/builder`)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger || <Button>+ Tạo trang mới</Button>} />
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Tạo trang mới</DialogTitle>
          <DialogDescription>Trang được tạo ở dạng nháp với vài khối gợi ý. Bạn sẽ thiết kế trong trình kéo thả.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-page-title">Tiêu đề *</Label>
            <Input
              id="new-page-title"
              value={title}
              autoFocus
              onChange={(e) => {
                setTitle(e.target.value)
                if (!slugTouched) setSlug(generateSlug(e.target.value))
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-page-slug">Đường dẫn (slug) *</Label>
            <div className="flex items-center rounded-lg border border-input pl-2.5 text-sm text-muted-foreground focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              /
              <input
                id="new-page-slug"
                className="h-8 min-w-0 flex-1 bg-transparent pr-2.5 text-foreground outline-none"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                }}
              />
            </div>
          </div>
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting || !title.trim() || !slug.trim()}>
              {submitting ? "Đang tạo..." : "Tạo và thiết kế"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Sửa nhanh thông tin trang. Nội dung được chỉnh trong trình thiết kế. */
function EditPageDialog({ initialData, trigger }: { initialData: PageDialogData; trigger?: React.ReactElement }) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const isHome = initialData.slug === HOME_PAGE_SLUG
  const fixedSlug = isFixedSlug(initialData.slug ?? "")

  const defaults = React.useMemo<PageFormValues>(
    () => ({
      id: initialData.id,
      title: initialData.title,
      slug: initialData.slug,
      seoTitle: initialData.seoTitle ?? "",
      seoDescription: initialData.seoDescription ?? "",
      status: (Object.keys(statusLabels).includes(initialData.status) ? initialData.status : "DRAFT") as PageFormValues["status"],
    }),
    [initialData]
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PageFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(pageSchema) as any,
    defaultValues: defaults,
  })

  const status = watch("status")

  React.useEffect(() => {
    if (open) reset(defaults)
  }, [open, defaults, reset])

  const onSubmit = async (data: PageFormValues) => {
    const result = await upsertPage(data)
    if (result.success) {
      toast.success("Cập nhật thành công!")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger || <Button variant="ghost">Sửa</Button>} />
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Sửa thông tin trang</DialogTitle>
          <DialogDescription>Nội dung trang được chỉnh trong trình thiết kế (nút “Thiết kế”).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" readOnly={fixedSlug} {...register("slug")} />
              {fixedSlug ? (
                <p className="text-xs text-muted-foreground">
                  Slug của {isHome ? "trang chủ" : "trang hệ thống"} không thể thay đổi.
                </p>
              ) : null}
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input id="seoTitle" {...register("seoTitle")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={status} onValueChange={(value) => setValue("status", value as PageFormValues["status"])}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Trạng thái">{(value: string) => statusLabels[value as PageFormValues["status"]] ?? value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(statusLabels) as PageFormValues["status"][]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {statusLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Textarea id="seoDescription" {...register("seoDescription")} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thông tin"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
