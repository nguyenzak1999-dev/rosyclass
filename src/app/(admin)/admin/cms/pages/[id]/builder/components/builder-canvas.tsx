"use client"

import { createContext, memo, useContext, useId, useLayoutEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type ReactNode, type Ref } from "react"
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, GripVertical, LayoutTemplate, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { BlockCanvasRoot, BlockView } from "@/components/page-builder/block-renderer"
import type { BlockRenderContext } from "@/components/page-builder/blocks/shared"
import type { Block } from "@/lib/page-builder/document"
import { getBlockDefinition } from "@/lib/page-builder/registry"
import type { PageBuilderData } from "@/lib/page-builder/types"

export type Viewport = "desktop" | "tablet" | "mobile"

export const VIEWPORT_WIDTHS: Record<Viewport, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 390,
}

export interface CanvasActions {
  select: (id: string) => void
  move: (id: string, delta: number) => void
  duplicate: (id: string) => void
  toggleHidden: (id: string) => void
  remove: (id: string) => void
  reorder: (activeId: string, overId: string) => void
}

const ScaleContext = createContext(1)

/**
 * Render nội dung ở đúng chiều rộng thiết bị rồi thu nhỏ cho vừa khung,
 * nhờ đó bản xem trước "máy tính" vẫn chính xác trên màn hình admin hẹp.
 */
function ScaledFrame({ width, children }: { width: number; children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ scale: 1, height: 0 })

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    const update = () => {
      const scale = Math.min(1, outer.clientWidth / width)
      setSize({ scale, height: inner.offsetHeight * scale })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(outer)
    observer.observe(inner)
    return () => observer.disconnect()
  }, [width])

  return (
    <div ref={outerRef} className="w-full">
      <div className="relative mx-auto" style={{ width: width * size.scale, height: size.height }}>
        <div
          ref={innerRef}
          className="absolute top-0 left-0"
          style={{ width, transform: `scale(${size.scale})`, transformOrigin: "top left" }}
        >
          <ScaleContext.Provider value={size.scale}>{children}</ScaleContext.Provider>
        </div>
      </div>
    </div>
  )
}

export function BuilderCanvas({
  blocks,
  data,
  selectedId,
  viewport,
  actions,
  readOnly,
}: {
  blocks: Block[]
  data: PageBuilderData
  selectedId: string | null
  viewport: Viewport
  actions: CanvasActions
  readOnly?: boolean
}) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const ctx = useMemo<BlockRenderContext>(() => ({ mode: "editor", data }), [data])
  const activeBlock = activeId ? blocks.find((block) => block.id === activeId) : null
  // id cố định để aria-describedby của dnd-kit khớp giữa server và client
  const dndId = useId()

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id))
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    if (event.over && event.active.id !== event.over.id) actions.reorder(String(event.active.id), String(event.over.id))
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <ScaledFrame width={VIEWPORT_WIDTHS[viewport]}>
        <div className="theme-client overflow-hidden rounded-xl bg-kid-cream shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_20px_50px_-20px_rgba(0,0,0,0.35)]">
          <BlockCanvasRoot>
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-6 py-32 text-center">
                <LayoutTemplate className="h-14 w-14 text-kid-ink-soft" aria-hidden="true" />
                <p className="font-kid-display text-[26px] font-bold">Trang chưa có khối nào</p>
                <p className="max-w-md text-[16px] text-kid-ink-soft">
                  Chọn một khối trong thư viện bên trái để bắt đầu thiết kế trang.
                </p>
              </div>
            ) : (
              <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy} disabled={readOnly}>
                {blocks.map((block, index) => (
                  <CanvasBlock
                    key={block.id}
                    block={block}
                    ctx={ctx}
                    index={index}
                    count={blocks.length}
                    selected={block.id === selectedId}
                    actions={actions}
                    readOnly={readOnly}
                  />
                ))}
              </SortableContext>
            )}
          </BlockCanvasRoot>
        </div>
      </ScaledFrame>
      <DragOverlay dropAnimation={null}>
        {activeBlock ? (
          <div className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium shadow-xl">
            <GripVertical className="size-4" />
            {getBlockDefinition(activeBlock.type).label}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

const CanvasBlock = memo(function CanvasBlock({
  block,
  ctx,
  index,
  count,
  selected,
  actions,
  readOnly,
}: {
  block: Block
  ctx: BlockRenderContext
  index: number
  count: number
  selected: boolean
  actions: CanvasActions
  readOnly?: boolean
}) {
  const scale = useContext(ScaleContext)
  // Không áp transform của dnd-kit vì canvas đang bị scale; dùng vạch chỉ vị trí thả thay thế
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging, isOver, activeIndex } = useSortable({
    id: block.id,
  })
  const def = getBlockDefinition(block.type)
  const dropPosition = isOver && !isDragging && activeIndex >= 0 ? (activeIndex > index ? "top" : "bottom") : null
  const counterScale = { transform: `scale(${1 / scale})` }

  return (
    <div
      ref={setNodeRef}
      data-pb-block={block.id}
      aria-label={`Khối ${index + 1}: ${def.label}`}
      className={cn(
        "group/block relative outline-offset-[-3px]",
        selected ? "outline-[3px] outline-[#3b82f6] outline-solid" : "hover:outline-2 hover:outline-[#3b82f6]/50 hover:outline-dashed",
        isDragging && "opacity-40"
      )}
      onClickCapture={(event) => {
        // Không điều hướng khi bấm link trong bản xem trước
        if ((event.target as HTMLElement).closest("a")) event.preventDefault()
      }}
      onClick={() => actions.select(block.id)}
    >
      {dropPosition ? (
        <div
          className={cn("pointer-events-none absolute inset-x-0 z-30 h-1.5 bg-[#3b82f6]", dropPosition === "top" ? "top-0" : "bottom-0")}
          aria-hidden="true"
        />
      ) : null}

      <div className={cn(block.hidden && "pointer-events-none opacity-35 grayscale")}>
        <BlockView block={block} ctx={ctx} />
      </div>
      {block.hidden ? (
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(43,33,64,0.06)_12px,rgba(43,33,64,0.06)_24px)]" />
      ) : null}

      {/* Nhãn khối */}
      <div
        className={cn(
          "absolute top-2 left-2 z-20 origin-top-left font-sans",
          selected ? "opacity-100" : "opacity-0 group-hover/block:opacity-100"
        )}
        style={counterScale}
      >
        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#3b82f6] px-2 py-1 text-xs font-medium text-white shadow">
          {def.label}
          {block.hidden ? <span className="rounded bg-white/25 px-1">Đang ẩn</span> : null}
        </span>
      </div>

      {/* Thanh công cụ */}
      {!readOnly ? (
        <div
          className={cn(
            "absolute top-2 right-2 z-20 flex origin-top-right items-center gap-0.5 rounded-lg border border-black/10 bg-white p-1 font-sans text-[#1f2937] shadow-lg",
            selected ? "opacity-100" : "opacity-0 group-hover/block:opacity-100 focus-within:opacity-100"
          )}
          style={counterScale}
          onClick={(event) => event.stopPropagation()}
        >
          <ToolbarButton
            label="Kéo để sắp xếp"
            ref={setActivatorNodeRef}
            className="cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical />
          </ToolbarButton>
          <ToolbarButton label="Chuyển lên" disabled={index === 0} onClick={() => actions.move(block.id, -1)}>
            <ArrowUp />
          </ToolbarButton>
          <ToolbarButton label="Chuyển xuống" disabled={index === count - 1} onClick={() => actions.move(block.id, 1)}>
            <ArrowDown />
          </ToolbarButton>
          <ToolbarButton label="Nhân bản" onClick={() => actions.duplicate(block.id)}>
            <Copy />
          </ToolbarButton>
          <ToolbarButton label={block.hidden ? "Hiện khối" : "Ẩn khối"} onClick={() => actions.toggleHidden(block.id)}>
            {block.hidden ? <Eye /> : <EyeOff />}
          </ToolbarButton>
          <ToolbarButton label="Xoá khối" className="text-red-600 hover:bg-red-50" onClick={() => actions.remove(block.id)}>
            <Trash2 />
          </ToolbarButton>
        </div>
      ) : null}
    </div>
  )
})

function ToolbarButton({
  label,
  className,
  children,
  ref,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; ref?: Ref<HTMLButtonElement> }) {
  return (
    <button
      ref={ref}
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        "flex size-7 items-center justify-center rounded-md outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#3b82f6] disabled:pointer-events-none disabled:opacity-30 [&_svg]:size-4",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
