"use client"

import * as React from "react"
import { useForm, useWatch, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Bold,
  Eye,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Loader2,
  PanelTop,
  Quote,
  Save,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUploader } from "@/components/ui/image-uploader"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { formatBlogContent } from "@/lib/blog-content"
import { generateSlug } from "@/lib/slug"
import { blogPostSchema, type BlogPostFormValues } from "@/lib/schemas/blog-post"
import { cn } from "@/lib/utils"
import { upsertBlogPost } from "../actions"

type BlogPostFormInitialData = {
  id?: string
  title?: string
  slug?: string
  excerpt?: string | null
  content?: string
  thumbnail?: string | null
  status?: BlogPostFormValues["status"]
  seoTitle?: string | null
    seoDescription?: string | null
  }

const emptyPost: BlogPostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  thumbnail: "",
  status: "DRAFT",
  seoTitle: "",
  seoDescription: "",
}

const editorButtonClass =
  "h-8 w-8 rounded-md text-muted-foreground hover:text-foreground"

export function BlogPostForm({ initialData }: { initialData?: BlogPostFormInitialData }) {
  const router = useRouter()
  const editorRef = React.useRef<HTMLDivElement>(null)
  const inlineImageInputRef = React.useRef<HTMLInputElement>(null)
  const [initialContent] = React.useState(initialData?.content || "")
  const [activeTab, setActiveTab] = React.useState("write")
  const [contentPreview, setContentPreview] = React.useState(initialData?.content || "")
  const [uploadingInlineImage, setUploadingInlineImage] = React.useState(false)
  const [slugTouched, setSlugTouched] = React.useState(Boolean(initialData?.slug))

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema) as unknown as Resolver<BlogPostFormValues>,
    defaultValues: {
      ...emptyPost,
      ...initialData,
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      thumbnail: initialData?.thumbnail || "",
      seoTitle: initialData?.seoTitle || "",
      seoDescription: initialData?.seoDescription || "",
    },
  })

  const title = useWatch({ control, name: "title" }) || ""
  const slug = useWatch({ control, name: "slug" }) || ""
  const excerpt = useWatch({ control, name: "excerpt" }) || ""
  const thumbnail = useWatch({ control, name: "thumbnail" }) || ""
  const status = useWatch({ control, name: "status" }) || "DRAFT"

  React.useEffect(() => {
    if (!slugTouched) {
      setValue("slug", generateSlug(title), { shouldValidate: true })
    }
  }, [slugTouched, setValue, title])

  const syncContentFromEditor = React.useCallback(() => {
    const html = editorRef.current?.innerHTML || ""
    setContentPreview(html)
    setValue("content", html, { shouldDirty: true, shouldValidate: true })
  }, [setValue])

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    syncContentFromEditor()
  }

  const insertHtml = (html: string) => {
    editorRef.current?.focus()
    document.execCommand("insertHTML", false, html)
    syncContentFromEditor()
  }

  const insertImageUrl = () => {
    const url = window.prompt("Dán URL ảnh")
    if (!url?.trim()) return
    insertHtml(
      `<figure><img src="${url.trim()}" alt="" /><figcaption>Chú thích ảnh</figcaption></figure><p><br /></p>`
    )
  }

  const uploadInlineImage = async (file: File) => {
    setUploadingInlineImage(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", "blog")

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Tải ảnh thất bại")

      insertHtml(
        `<figure><img src="${data.media.url}" alt="${file.name}" /><figcaption>Chú thích ảnh</figcaption></figure><p><br /></p>`
      )
      toast.success("Đã chèn ảnh vào bài viết")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải ảnh")
    } finally {
      setUploadingInlineImage(false)
      if (inlineImageInputRef.current) inlineImageInputRef.current.value = ""
    }
  }

  const onSubmit = async (data: BlogPostFormValues) => {
    const result = await upsertBlogPost({
      ...data,
      content: data.content,
    })

    if (result.success) {
      toast.success(initialData?.id ? "Đã cập nhật bài viết" : "Đã tạo bài viết")
      router.push("/admin/cms/blog")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    syncContentFromEditor()
    void handleSubmit(onSubmit)(event)
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Nội dung bài viết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề *</Label>
                  <Input id="title" {...register("title")} placeholder="Ví dụ: 7 cách luyện nói tiếng Anh mỗi ngày" />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug URL *</Label>
                  <Input
                    id="slug"
                    {...register("slug")}
                    onChange={(event) => {
                      setSlugTouched(true)
                      setValue("slug", generateSlug(event.target.value), { shouldDirty: true, shouldValidate: true })
                    }}
                    placeholder="7-cach-luyen-noi-tieng-anh"
                  />
                  {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Mô tả ngắn</Label>
                <Textarea
                  id="excerpt"
                  className="min-h-24"
                  {...register("excerpt")}
                  placeholder="Tóm tắt dùng cho danh sách bài viết, SEO và chia sẻ mạng xã hội."
                />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <TabsList>
                    <TabsTrigger value="write">
                      <PanelTop className="h-4 w-4" /> Soạn thảo
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Eye className="h-4 w-4" /> Preview
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/30 p-1">
                    <ToolbarButton label="H2" onClick={() => runCommand("formatBlock", "h2")}>
                      <Heading2 className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="H3" onClick={() => runCommand("formatBlock", "h3")}>
                      <Heading3 className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Bold" onClick={() => runCommand("bold")}>
                      <Bold className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Italic" onClick={() => runCommand("italic")}>
                      <Italic className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Bullet list" onClick={() => runCommand("insertUnorderedList")}>
                      <List className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Numbered list" onClick={() => runCommand("insertOrderedList")}>
                      <ListOrdered className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Quote" onClick={() => runCommand("formatBlock", "blockquote")}>
                      <Quote className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      label="Link"
                      onClick={() => {
                        const url = window.prompt("Dán URL liên kết")
                        if (url?.trim()) runCommand("createLink", url.trim())
                      }}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Ảnh URL" onClick={insertImageUrl}>
                      <ImageIcon className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      label="Upload ảnh"
                      disabled={uploadingInlineImage}
                      onClick={() => inlineImageInputRef.current?.click()}
                    >
                      {uploadingInlineImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </ToolbarButton>
                    <input
                      ref={inlineImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) void uploadInlineImage(file)
                      }}
                    />
                  </div>
                </div>

                <TabsContent value="write" className="mt-3">
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className={cn(
                      "min-h-[520px] rounded-xl border bg-background p-5 text-sm leading-7 outline-none transition-colors focus:border-primary",
                      "empty:before:text-muted-foreground empty:before:content-['Viết_nội_dung_bài_viết...']",
                      richTextClassName
                    )}
                    onInput={syncContentFromEditor}
                    onBlur={syncContentFromEditor}
                    dangerouslySetInnerHTML={{ __html: initialContent }}
                  />
                  <input type="hidden" {...register("content")} />
                  {errors.content && <p className="mt-2 text-sm text-destructive">{errors.content.message}</p>}
                </TabsContent>

                <TabsContent value="preview" className="mt-3">
                  <ArticlePreview title={title} excerpt={excerpt} thumbnail={thumbnail} content={contentPreview} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Xuất bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={status} onValueChange={(value) => setValue("status", value as BlogPostFormValues["status"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Nháp</SelectItem>
                    <SelectItem value="PUBLISHED">Xuất bản</SelectItem>
                    <SelectItem value="INACTIVE">Ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                URL công khai: <span className="font-mono text-foreground">/goc-hoc-tap/{slug || "slug-bai-viet"}</span>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" render={<Link href="/admin/cms/blog" />}>
                  Hủy
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Lưu
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Ảnh đại diện</CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <ImageUploader
                value={thumbnail}
                onChange={(url) => setValue("thumbnail", url, { shouldDirty: true })}
                folder="blog"
                aspectRatio="16/9"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO title</Label>
                <Input id="seoTitle" {...register("seoTitle")} placeholder="Có thể để trống để dùng tiêu đề bài viết" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO description</Label>
                <Textarea
                  id="seoDescription"
                  className="min-h-28"
                  {...register("seoDescription")}
                  placeholder="Mô tả ngắn hiển thị trên Google và khi chia sẻ."
                />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>
  )
}

function ToolbarButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={editorButtonClass}
      disabled={disabled}
      title={label}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function ArticlePreview({
  title,
  excerpt,
  thumbnail,
  content,
}: {
  title?: string
  excerpt?: string
  thumbnail?: string
  content: string
}) {
  return (
    <article className="min-h-[520px] rounded-xl border bg-background p-6">
      {thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbnail} alt="" className="mb-6 aspect-video w-full rounded-xl object-cover" />
      )}
      <h1 className="mb-3 text-3xl font-semibold tracking-tight">{title || "Tiêu đề bài viết"}</h1>
      {excerpt && <p className="mb-6 rounded-lg bg-muted/50 p-4 text-base leading-7 text-muted-foreground">{excerpt}</p>}
      <div
        className={richTextClassName}
        dangerouslySetInnerHTML={{ __html: formatBlogContent(content) }}
      />
    </article>
  )
}

const richTextClassName = cn(
  "text-sm leading-7 text-foreground",
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline",
  "[&_blockquote]:my-5 [&_blockquote]:rounded-lg [&_blockquote]:bg-muted/60 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:italic",
  "[&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:text-muted-foreground",
  "[&_figure]:my-6",
  "[&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight",
  "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold",
  "[&_img]:mx-auto [&_img]:max-h-[520px] [&_img]:rounded-xl [&_img]:object-cover",
  "[&_li]:my-1",
  "[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_p]:my-4",
  "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
)
