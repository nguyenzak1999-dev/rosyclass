"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { arrayMove } from "@dnd-kit/sortable"
import {
  ArrowLeft,
  ExternalLink,
  Layers,
  Loader2,
  Monitor,
  PanelLeft,
  PanelRight,
  Plus,
  Redo2,
  Rocket,
  Save,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { cn } from "@/lib/utils"
import { getPublicPagePath, isPublicStatus, type PageStatus } from "@/lib/page-builder/constants"
import { createBlock, createBlockId, validateBlocks, type Block } from "@/lib/page-builder/document"
import { pageMetaSchema, type PageMetaInput } from "@/lib/page-builder/meta"
import type { BlockType } from "@/lib/page-builder/registry"
import type { PageBuilderData } from "@/lib/page-builder/types"
import { savePageBuilder, unpublishPage } from "../../../builder-actions"
import { BlockInspector } from "./block-inspector"
import { BlockLayers, BlockLibrary } from "./block-library"
import { BuilderCanvas, type CanvasActions, type Viewport } from "./builder-canvas"
import { PageSettingsPanel } from "./page-settings-panel"
import { StatusBadge } from "./status-badge"
import { useBlockHistory } from "./use-block-history"

export interface EditorPage {
  id: string
  title: string
  slug: string
  seoTitle: string
  seoDescription: string
  status: PageStatus
  isHome: boolean
}

const VIEWPORT_OPTIONS: { id: Viewport; label: string; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Máy tính", icon: Monitor },
  { id: "tablet", label: "Máy tính bảng", icon: Tablet },
  { id: "mobile", label: "Điện thoại", icon: Smartphone },
]

const UNSAVED_MESSAGE = "Bạn có thay đổi chưa lưu. Rời khỏi trang này?"

function snapshotOf(blocks: Block[], meta: PageMetaInput) {
  return JSON.stringify({ blocks, meta })
}

function isEditableTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null
  return Boolean(element?.closest("input, textarea, select, [contenteditable='true']"))
}

export function PageBuilderEditor({
  page,
  initialBlocks,
  initialHasDraft,
  data,
  canWrite,
}: {
  page: EditorPage
  initialBlocks: Block[]
  initialHasDraft: boolean
  data: PageBuilderData
  canWrite: boolean
}) {
  const { blocks, setBlocks, undo, redo, canUndo, canRedo } = useBlockHistory(initialBlocks)
  const [meta, setMeta] = useState<PageMetaInput>({
    title: page.title,
    slug: page.slug,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
  })
  const [saved, setSaved] = useState(() => snapshotOf(initialBlocks, meta))
  const [pageState, setPageState] = useState({ status: page.status, hasDraft: initialHasDraft, slug: page.slug })
  const [rawSelectedId, setSelectedId] = useState<string | null>(null)
  const [viewport, setViewport] = useState<Viewport>("desktop")
  const [leftTab, setLeftTab] = useState<"library" | "layers">("library")
  const [rightTab, setRightTab] = useState<"block" | "page">("block")
  const [mobilePanel, setMobilePanel] = useState<"left" | "right" | null>(null)
  const [saving, setSaving] = useState<"draft" | "publish" | "unpublish" | null>(null)
  const [confirmUnpublish, setConfirmUnpublish] = useState(false)
  const [scrollTarget, setScrollTarget] = useState<{ id: string; nonce: number } | null>(null)

  const dirty = useMemo(() => snapshotOf(blocks, meta) !== saved, [blocks, meta, saved])
  const selectedBlock = blocks.find((block) => block.id === rawSelectedId) ?? null
  // Block đang chọn có thể biến mất (vd: sau khi undo) → coi như không chọn
  const selectedId = selectedBlock ? selectedBlock.id : null
  const readOnly = !canWrite
  const publicPath = getPublicPagePath(pageState.slug)
  const published = isPublicStatus(pageState.status)

  // ---------------------------------------------------------------------------
  // Thao tác với block
  // ---------------------------------------------------------------------------

  const requestScroll = (id: string) => setScrollTarget({ id, nonce: Date.now() })

  const addBlock = (type: BlockType) => {
    if (readOnly) return
    const block = createBlock(type)
    setBlocks((current) => {
      const index = selectedId ? current.findIndex((item) => item.id === selectedId) : -1
      const next = [...current]
      next.splice(index >= 0 ? index + 1 : next.length, 0, block)
      return next
    })
    setSelectedId(block.id)
    setRightTab("block")
    setMobilePanel(null)
    requestScroll(block.id)
  }

  const actions = useMemo<CanvasActions>(
    () => ({
      select: (id) => {
        setSelectedId(id)
        setRightTab("block")
      },
      move: (id, delta) =>
        setBlocks((current) => {
          const index = current.findIndex((block) => block.id === id)
          const target = index + delta
          if (index < 0 || target < 0 || target >= current.length) return current
          return arrayMove(current, index, target)
        }),
      reorder: (activeId, overId) =>
        setBlocks((current) => {
          const from = current.findIndex((block) => block.id === activeId)
          const to = current.findIndex((block) => block.id === overId)
          if (from < 0 || to < 0 || from === to) return current
          return arrayMove(current, from, to)
        }),
      duplicate: (id) => {
        const newId = createBlockId()
        setBlocks((current) => {
          const index = current.findIndex((block) => block.id === id)
          if (index < 0) return current
          const copy = { ...(JSON.parse(JSON.stringify(current[index])) as Block), id: newId }
          const next = [...current]
          next.splice(index + 1, 0, copy)
          return next
        })
        setSelectedId(newId)
        setScrollTarget({ id: newId, nonce: Date.now() })
      },
      toggleHidden: (id) =>
        setBlocks((current) =>
          current.map((block) => {
            if (block.id !== id) return block
            const next = { ...block }
            if (next.hidden) delete next.hidden
            else next.hidden = true
            return next
          })
        ),
      remove: (id) => {
        setBlocks((current) => current.filter((block) => block.id !== id))
        setSelectedId((current) => (current === id ? null : current))
        toast("Đã xoá khối", { action: { label: "Hoàn tác", onClick: () => undo() } })
      },
    }),
    [setBlocks, undo]
  )

  const updateProp = useCallback(
    (blockId: string, key: string, value: unknown, mergeKey?: string) => {
      setBlocks(
        (current) =>
          current.map((block) =>
            block.id === blockId ? ({ ...block, props: { ...block.props, [key]: value } } as Block) : block
          ),
        mergeKey ? `${blockId}.${key}.${mergeKey}` : undefined
      )
    },
    [setBlocks]
  )

  useEffect(() => {
    if (!scrollTarget) return
    const frame = requestAnimationFrame(() => {
      document
        .querySelector(`[data-pb-block="${scrollTarget.id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
    return () => cancelAnimationFrame(frame)
  }, [scrollTarget])

  // ---------------------------------------------------------------------------
  // Lưu
  // ---------------------------------------------------------------------------

  const save = async (mode: "draft" | "publish") => {
    if (readOnly || saving) return
    const blocksResult = validateBlocks(blocks)
    if (!blocksResult.success) {
      toast.error(blocksResult.error)
      return
    }
    const metaResult = pageMetaSchema.safeParse(meta)
    if (!metaResult.success) {
      toast.error(metaResult.error.issues[0]?.message || "Thông tin trang không hợp lệ")
      setRightTab("page")
      setMobilePanel("right")
      return
    }

    const metaAtSave = meta
    const normalizedMeta = metaResult.data
    setSaving(mode)
    try {
      const result = await savePageBuilder({ id: page.id, meta: normalizedMeta, blocks, mode })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setPageState({ status: result.page.status, hasDraft: result.page.hasDraft, slug: result.page.slug })
      const finalMeta = { ...normalizedMeta, slug: result.page.slug }
      setMeta((current) => (current === metaAtSave ? finalMeta : current))
      setSaved(snapshotOf(blocks, finalMeta))
      toast.success(
        mode === "publish"
          ? "Đã xuất bản – website đã được cập nhật"
          : result.page.hasDraft
            ? "Đã lưu bản nháp (website chưa thay đổi)"
            : "Đã lưu nháp"
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu trang")
    } finally {
      setSaving(null)
    }
  }

  const handleUnpublish = async () => {
    setSaving("unpublish")
    try {
      const result = await unpublishPage(page.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setPageState({ status: result.page.status, hasDraft: false, slug: result.page.slug })
      toast.success("Đã gỡ trang khỏi website")
      setConfirmUnpublish(false)
    } finally {
      setSaving(null)
    }
  }

  // ---------------------------------------------------------------------------
  // Phím tắt & cảnh báo rời trang
  // ---------------------------------------------------------------------------

  const saveRef = useRef(save)
  useEffect(() => {
    saveRef.current = save
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      if (!mod) {
        if (event.key === "Escape" && !isEditableTarget(event.target)) setSelectedId(null)
        return
      }
      const key = event.key.toLowerCase()
      if (key === "z") {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      } else if (key === "y") {
        event.preventDefault()
        redo()
      } else if (key === "s") {
        event.preventDefault()
        void saveRef.current("draft")
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [undo, redo])

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    // Chặn điều hướng nội bộ (Link của Next) khi còn thay đổi chưa lưu
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as HTMLElement | null)?.closest("a[href]") as HTMLAnchorElement | null
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return
      if (anchor.closest("[data-pb-block]")) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return
      if (!window.confirm(UNSAVED_MESSAGE)) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    document.addEventListener("click", onClick, true)
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload)
      document.removeEventListener("click", onClick, true)
    }
  }, [dirty])

  // ---------------------------------------------------------------------------
  // Giao diện
  // ---------------------------------------------------------------------------

  const busy = saving !== null

  return (
    <div className="-m-3 flex h-[calc(100svh-3.5rem)] flex-col overflow-hidden bg-muted/40 sm:-m-4 sm:h-[calc(100svh-4rem)]">
      {/* Thanh trên */}
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b bg-background px-3 py-2">
        <Button variant="ghost" size="icon-sm" render={<Link href="/admin/cms/pages" aria-label="Về danh sách trang" />}>
          <ArrowLeft />
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h1 className="truncate text-sm font-semibold sm:text-base">{meta.title || "Trang chưa đặt tên"}</h1>
          <StatusBadge status={pageState.status} />
          {pageState.hasDraft ? (
            <span className="hidden rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 sm:inline dark:bg-amber-500/15 dark:text-amber-300">
              Có bản nháp
            </span>
          ) : null}
          {dirty ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-orange-500" aria-hidden="true" />
              <span className="hidden sm:inline">Chưa lưu</span>
            </span>
          ) : null}
        </div>

        <div className="hidden items-center rounded-lg border bg-muted/50 p-0.5 md:flex" role="group" aria-label="Khung xem trước">
          {VIEWPORT_OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                type="button"
                title={option.label}
                aria-label={option.label}
                aria-pressed={viewport === option.id}
                onClick={() => setViewport(option.id)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors [&_svg]:size-4",
                  viewport === option.id && "bg-background text-foreground shadow-sm"
                )}
              >
                <Icon />
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={undo} disabled={!canUndo || readOnly} title="Hoàn tác (Ctrl/⌘+Z)" aria-label="Hoàn tác">
            <Undo2 />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={redo}
            disabled={!canRedo || readOnly}
            title="Làm lại (Ctrl/⌘+Shift+Z)"
            aria-label="Làm lại"
          >
            <Redo2 />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          render={<a href={publicPath} target="_blank" rel="noopener noreferrer" />}
          title={published ? "Mở trang trên website" : "Trang chưa xuất bản – website chưa hiển thị nội dung này"}
        >
          <ExternalLink /> <span className="hidden sm:inline">Xem trang</span>
        </Button>
        {canWrite ? (
          <>
            <Button variant="outline" size="sm" onClick={() => save("draft")} disabled={busy} title="Lưu nháp (Ctrl/⌘+S)">
              {saving === "draft" ? <Loader2 className="animate-spin" /> : <Save />}
              <span className="hidden sm:inline">Lưu nháp</span>
            </Button>
            <Button size="sm" onClick={() => save("publish")} disabled={busy}>
              {saving === "publish" ? <Loader2 className="animate-spin" /> : <Rocket />}
              Xuất bản
            </Button>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">Chỉ xem (không có quyền chỉnh sửa)</span>
        )}
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* Bảng trái */}
        <aside
          className={cn(
            "w-72 shrink-0 flex-col border-r bg-background",
            mobilePanel === "left" ? "absolute inset-y-0 left-0 z-40 flex shadow-xl" : "hidden lg:flex"
          )}
        >
          <Tabs value={leftTab} onValueChange={(value) => setLeftTab(value as "library" | "layers")} className="min-h-0 flex-1 gap-0">
            <div className="border-b p-2">
              <TabsList className="w-full">
                <TabsTrigger value="library" className="flex-1">
                  <Plus /> Thêm khối
                </TabsTrigger>
                <TabsTrigger value="layers" className="flex-1">
                  <Layers /> Cấu trúc
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="library" className="min-h-0 flex-1 overflow-y-auto">
              <BlockLibrary onAdd={addBlock} disabled={readOnly} />
            </TabsContent>
            <TabsContent value="layers" className="min-h-0 flex-1 overflow-y-auto">
              <BlockLayers
                blocks={blocks}
                selectedId={selectedId}
                disabled={readOnly}
                onSelect={(id) => {
                  actions.select(id)
                  requestScroll(id)
                }}
                onReorder={actions.reorder}
              />
            </TabsContent>
          </Tabs>
        </aside>

        {/* Canvas */}
        <main
          className="min-w-0 flex-1 overflow-y-auto p-3 md:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedId(null)
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-2 lg:hidden">
            <Button variant="outline" size="sm" onClick={() => setMobilePanel(mobilePanel === "left" ? null : "left")}>
              <PanelLeft /> Khối
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMobilePanel(mobilePanel === "right" ? null : "right")}>
              Thuộc tính <PanelRight />
            </Button>
          </div>
          <BuilderCanvas
            blocks={blocks}
            data={data}
            selectedId={selectedId}
            viewport={viewport}
            actions={actions}
            readOnly={readOnly}
          />
        </main>

        {/* Bảng phải */}
        <aside
          className={cn(
            "w-80 shrink-0 flex-col border-l bg-background",
            mobilePanel === "right" ? "absolute inset-y-0 right-0 z-40 flex shadow-xl" : "hidden lg:flex"
          )}
        >
          <Tabs value={rightTab} onValueChange={(value) => setRightTab(value as "block" | "page")} className="min-h-0 flex-1 gap-0">
            <div className="border-b p-2">
              <TabsList className="w-full">
                <TabsTrigger value="block" className="flex-1">
                  Khối
                </TabsTrigger>
                <TabsTrigger value="page" className="flex-1">
                  Cài đặt trang
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="block" className="min-h-0 flex-1 overflow-y-auto">
              <fieldset disabled={readOnly} className="min-w-0">
                <BlockInspector block={selectedBlock} onChangeProp={updateProp} />
              </fieldset>
            </TabsContent>
            <TabsContent value="page" className="min-h-0 flex-1 overflow-y-auto">
              <fieldset disabled={readOnly} className="min-w-0">
                <PageSettingsPanel
                  meta={meta}
                  onChange={setMeta}
                  isHome={page.isHome}
                  status={pageState.status}
                  hasDraft={pageState.hasDraft}
                  canWrite={canWrite}
                  busy={busy}
                  onUnpublish={() => setConfirmUnpublish(true)}
                />
              </fieldset>
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmUnpublish}
        onOpenChange={setConfirmUnpublish}
        title="Gỡ trang khỏi website?"
        description={
          page.isHome
            ? "Trang chủ sẽ quay về giao diện mặc định cho tới khi bạn xuất bản lại."
            : "Trang sẽ không còn truy cập được trên website cho tới khi bạn xuất bản lại."
        }
        confirmText="Gỡ xuất bản"
        variant="destructive"
        isSubmitting={saving === "unpublish"}
        onConfirm={handleUnpublish}
      />
    </div>
  )
}
