"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Upload,
  Images,
  Link2,
  X,
  Check,
  Search,
  Loader2,
  ImageIcon,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MediaFile {
  id: string
  url: string
  publicId: string
  name: string
  folder: string
  format?: string | null
  width?: number | null
  height?: number | null
  bytes?: number | null
  createdAt: string
}

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  aspectRatio?: string // e.g. "16/9", "1/1", "1200/630"
  maxWidth?: number
  className?: string
  placeholder?: string
  required?: boolean
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ImageUploader({
  value,
  onChange,
  folder = "general",
  label,
  aspectRatio = "16/9",
  className,
  placeholder = "https://...",
  required = false,
}: ImageUploaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tab, setTab] = useState<"upload" | "gallery" | "url">("upload")
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState(value || "")

  // Gallery state
  const [galleryFiles, setGalleryFiles] = useState<MediaFile[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [gallerySearch, setGallerySearch] = useState("")
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [galleryPage, setGalleryPage] = useState(1)
  const [galleryTotal, setGalleryTotal] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load gallery
  const loadGallery = useCallback(async (search = "", page = 1) => {
    setGalleryLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "24",
        ...(search ? { search } : {}),
      })
      const res = await fetch(`/api/media?${params}`)
      const data = await res.json()
      if (data.success) {
        setGalleryFiles(data.files)
        setGalleryTotal(data.total)
        setGalleryPage(page)
      }
    } catch {
      toast.error("Không thể tải thư viện ảnh")
    } finally {
      setGalleryLoading(false)
    }
  }, [])

  const handleOpenGallery = () => {
    setDialogOpen(true)
    setTab("gallery")
    loadGallery()
  }

  // Upload file
  const handleUpload = async (file: File) => {
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("folder", folder)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      onChange(data.media.url)
      toast.success("Tải ảnh lên thành công!")
      setDialogOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Tải lên thất bại")
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) handleUpload(file)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [folder]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }
  const handleDragLeave = () => setDragging(false)

  // Select from gallery
  const handleSelectGallery = () => {
    if (selectedFile) {
      onChange(selectedFile.url)
      setDialogOpen(false)
      setSelectedFile(null)
    }
  }

  // URL tab submit
  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return
    onChange(urlInput.trim())
    setDialogOpen(false)
  }

  // Delete from gallery
  const handleDeleteMedia = async (file: MediaFile, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Xóa ảnh "${file.name}"?`)) return
    try {
      const res = await fetch(`/api/upload?id=${file.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      toast.success("Đã xóa ảnh")
      // Remove from state
      setGalleryFiles((prev) => prev.filter((f) => f.id !== file.id))
      if (value === file.url) onChange("")
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      {/* Preview + actions */}
      <div className="space-y-2">
        {value ? (
          <div className="relative rounded-xl overflow-hidden border border-border bg-muted group">
            <div style={{ aspectRatio: aspectRatio.replace("/", " / ") }} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {/* Overlay buttons */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setDialogOpen(true)}
                >
                  <Images className="w-4 h-4 mr-1" /> Thay đổi
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => onChange("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-2 text-xs text-muted-foreground truncate border-t">{value}</div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="w-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            <ImageIcon className="w-10 h-10 opacity-40" />
            <span className="text-sm font-medium">Nhấn để chọn hoặc tải ảnh lên</span>
            <span className="text-xs">PNG, JPG, WebP – tối đa 10MB</span>
          </button>
        )}

        {/* Quick action buttons */}
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1 flex-1"
            onClick={() => { setDialogOpen(true); setTab("upload") }}
          >
            <Upload className="w-3.5 h-3.5" /> Tải lên
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1 flex-1"
            onClick={handleOpenGallery}
          >
            <Images className="w-3.5 h-3.5" /> Thư viện
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1 flex-1"
            onClick={() => { setDialogOpen(true); setTab("url") }}
          >
            <Link2 className="w-3.5 h-3.5" /> URL
          </Button>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Chọn hình ảnh</DialogTitle>
          </DialogHeader>

          <Tabs value={tab} onValueChange={(v) => {
            setTab(v as any)
            if (v === "gallery") loadGallery(gallerySearch)
          }}>
            <TabsList className="w-full">
              <TabsTrigger value="upload" className="flex-1 gap-1">
                <Upload className="w-4 h-4" /> Tải lên
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex-1 gap-1">
                <Images className="w-4 h-4" /> Thư viện
              </TabsTrigger>
              <TabsTrigger value="url" className="flex-1 gap-1">
                <Link2 className="w-4 h-4" /> Từ URL
              </TabsTrigger>
            </TabsList>

            {/* ── Upload Tab ── */}
            <TabsContent value="upload" className="mt-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors",
                  dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/50",
                  uploading && "pointer-events-none opacity-70"
                )}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-sm font-medium">Đang tải lên Cloudinary...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-semibold">Kéo & thả hoặc nhấn để chọn ảnh</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP, GIF – tối đa 10MB</p>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </TabsContent>

            {/* ── Gallery Tab ── */}
            <TabsContent value="gallery" className="mt-4 flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm ảnh..."
                  className="pl-9"
                  value={gallerySearch}
                  onChange={(e) => {
                    setGallerySearch(e.target.value)
                    loadGallery(e.target.value, 1)
                  }}
                />
              </div>

              {/* Grid */}
              <ScrollArea className="h-[380px] pr-2">
                {galleryLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : galleryFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                    <Images className="w-10 h-10 opacity-30" />
                    <p className="text-sm">Thư viện trống, hãy tải ảnh lên trước</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {galleryFiles.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => setSelectedFile(selectedFile?.id === file.id ? null : file)}
                        className={cn(
                          "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 group transition-all",
                          selectedFile?.id === file.id
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-transparent hover:border-primary/40"
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        
                        {/* Selected checkmark */}
                        {selectedFile?.id === file.id && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteMedia(file, e)}
                          className="absolute bottom-1 right-1 w-6 h-6 bg-destructive/80 rounded-full items-center justify-center hidden group-hover:flex hover:bg-destructive"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>

                        {/* Hover overlay info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Pagination + confirm */}
              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{galleryTotal} ảnh</span>
                  {galleryPage > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => loadGallery(gallerySearch, galleryPage - 1)}
                    >
                      ← Trang trước
                    </Button>
                  )}
                  {galleryPage * 24 < galleryTotal && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => loadGallery(gallerySearch, galleryPage + 1)}
                    >
                      Trang sau →
                    </Button>
                  )}
                </div>
                <Button
                  type="button"
                  disabled={!selectedFile}
                  onClick={handleSelectGallery}
                  className="gap-1"
                >
                  <Check className="w-4 h-4" /> Chọn ảnh này
                </Button>
              </div>
            </TabsContent>

            {/* ── URL Tab ── */}
            <TabsContent value="url" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Nhập URL hình ảnh</Label>
                <Input
                  placeholder={placeholder}
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
              </div>
              {urlInput && (
                <div className="rounded-xl overflow-hidden border aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={urlInput} alt="Preview URL" className="w-full h-full object-contain bg-muted" />
                </div>
              )}
              <div className="flex justify-end">
                <Button type="button" onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                  Dùng URL này
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
