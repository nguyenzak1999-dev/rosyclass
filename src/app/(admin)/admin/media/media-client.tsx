"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Upload,
  Search,
  Loader2,
  Trash2,
  Copy,
  MoreHorizontal,
  Images,
  FolderOpen,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
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

const FOLDERS = [
  { value: "all", label: "Tất cả" },
  { value: "general", label: "Chung" },
  { value: "banners", label: "Banner" },
  { value: "blog", label: "Blog" },
  { value: "courses", label: "Khóa học" },
  { value: "teachers", label: "Giáo viên" },
  { value: "testimonials", label: "Testimonials" },
  { value: "site", label: "Website" },
]

function formatBytes(bytes?: number | null) {
  if (!bytes) return "–"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  })
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function MediaClient() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState("")
  const [folder, setFolder] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [dragging, setDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  // Chỉ nhận kết quả của lần tải mới nhất: gõ tìm kiếm nhanh tạo nhiều request, về không theo thứ tự
  const requestIdRef = useRef(0)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
  }, [])

  const loadFiles = useCallback(async (params: {
    search?: string
    folder?: string
    page?: number
  } = {}) => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    try {
      const p = new URLSearchParams({
        page: String(params.page || 1),
        limit: "24",
        ...(params.search ? { search: params.search } : {}),
        ...(params.folder && params.folder !== "all" ? { folder: params.folder } : {}),
      })
      const res = await fetch(`/api/media?${p}`)
      const data = await res.json()
      if (requestId !== requestIdRef.current) return
      if (!res.ok || !data.success) throw new Error(data.error || "Không thể tải danh sách file")
      setFiles(data.files)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (err: unknown) {
      if (requestId === requestIdRef.current) toast.error(getErrorMessage(err, "Không thể tải danh sách file"))
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(() => loadFiles())
  }, [loadFiles])

  const handleSearch = (value: string) => {
    setSearch(value)
    // Đợi người dùng gõ xong mới gọi API
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => loadFiles({ search: value.trim(), folder, page: 1 }), 300)
  }

  const handleFolderChange = (value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    setFolder(value)
    loadFiles({ search: search.trim(), folder: value, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    loadFiles({ search, folder, page: newPage })
  }

  const handleUpload = async (file: File, uploadFolder = folder === "all" ? "general" : folder) => {
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("folder", uploadFolder)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      toast.success(`Đã tải lên: ${file.name}`)
      loadFiles({ search, folder, page: 1 })
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Tải lên thất bại"))
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    for (const file of selectedFiles) {
      await handleUpload(file)
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"))
    for (const file of droppedFiles) {
      await handleUpload(file)
    }
  }

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Xóa ảnh "${file.name}"?\n\nHành động này không thể hoàn tác.`)) return
    try {
      const res = await fetch(`/api/upload?id=${file.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      toast.success("Đã xóa ảnh")
      if (selectedFile?.id === file.id) setSelectedFile(null)
      // Xoá file cuối cùng của trang thì lùi về trang trước
      loadFiles({ search, folder, page: files.length === 1 && page > 1 ? page - 1 : page })
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Xóa ảnh thất bại"))
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => toast.success("Đã sao chép URL"),
      () => toast.error("Không sao chép được URL")
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thư viện Media</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} file · Quản lý ảnh và tài nguyên website
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? "Đang tải lên..." : "Tải ảnh lên"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Sidebar folders */}
        <aside className="w-44 shrink-0">
          <Card>
            <CardHeader className="py-3 px-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <FolderOpen className="w-3.5 h-3.5" /> Thư mục
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-2 pb-3 space-y-0.5">
              {FOLDERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleFolderChange(f.value)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                    folder === f.value
                      ? "bg-muted text-foreground font-medium"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên file..."
                className="pl-9"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            className={cn(
              "flex-1 rounded-xl border-2 transition-colors overflow-hidden",
              dragging ? "border-primary bg-primary/5" : "border-transparent"
            )}
          >
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : files.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/60 hover:text-primary transition-colors"
              >
                <Images className="w-14 h-14 opacity-30" />
                <div className="text-center">
                  <p className="font-medium">Thư viện trống</p>
                  <p className="text-sm">Nhấn để tải ảnh lên hoặc kéo & thả vào đây</p>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <ScrollArea className="h-full">
                <div className="grid grid-cols-4 xl:grid-cols-6 gap-3 p-1">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFile(selectedFile?.id === file.id ? null : file)}
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 group transition-all",
                        selectedFile?.id === file.id
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-transparent hover:border-border"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />

                      {/* Actions overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute top-1 right-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className="w-6 h-6"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              }
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCopyUrl(file.url)}>
                                <Copy className="w-4 h-4 mr-2" /> Sao chép URL
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => { e.stopPropagation(); handleDelete(file) }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-1">
                          <p className="text-white text-[10px] truncate">{file.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              // List view
              <ScrollArea className="h-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">File</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Thư mục</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Kích thước</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Ngày tải</th>
                      <th className="py-2 px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => (
                      <tr key={file.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={file.url} alt={file.name} className="w-10 h-10 rounded object-cover shrink-0" />
                            <div>
                              <p className="font-medium truncate max-w-[180px]">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{file.width}×{file.height} {file.format?.toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <Badge variant="secondary">{file.folder}</Badge>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">{formatBytes(file.bytes)}</td>
                        <td className="py-2 px-3 text-muted-foreground">{formatDate(file.createdAt)}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => handleCopyUrl(file.url)}>
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => handleDelete(file)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Trang {page} / {totalPages} · {total} file
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel – selected file */}
        {selectedFile && (
          <aside className="w-56 shrink-0">
            <Card>
              <CardContent className="p-3 space-y-3">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedFile.url} alt={selectedFile.name} className="w-full h-full object-contain" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedFile.width}×{selectedFile.height}px</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.bytes)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(selectedFile.createdAt)}</p>
                  <Badge variant="secondary" className="text-xs">{selectedFile.folder}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-1"
                  onClick={() => handleCopyUrl(selectedFile.url)}
                >
                  <Copy className="w-3.5 h-3.5" /> Sao chép URL
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full gap-1"
                  onClick={() => handleDelete(selectedFile)}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa ảnh
                </Button>
              </CardContent>
            </Card>
          </aside>
        )}
      </div>
    </div>
  )
}
