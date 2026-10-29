"use client"

import { useId, useState } from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { EyeOff, GripVertical, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Block } from "@/lib/page-builder/document"
import { BLOCK_CATEGORIES, BLOCK_DEFINITIONS, BLOCK_TYPES, getBlockDefinition, type BlockType } from "@/lib/page-builder/registry"

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
}

export function BlockLibrary({ onAdd, disabled }: { onAdd: (type: BlockType) => void; disabled?: boolean }) {
  const [query, setQuery] = useState("")
  const q = normalize(query.trim())
  const matches = (type: BlockType) => {
    if (!q) return true
    const def = BLOCK_DEFINITIONS[type]
    return normalize(`${def.label} ${def.description}`).includes(q)
  }

  return (
    <div className="space-y-4 p-3">
      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm khối..."
          className="pl-8"
          aria-label="Tìm khối"
        />
      </div>
      <p className="text-xs text-muted-foreground">Bấm để thêm khối ngay sau khối đang chọn.</p>
      {BLOCK_CATEGORIES.map((category) => {
        const types = BLOCK_TYPES.filter((type) => BLOCK_DEFINITIONS[type].category === category.id && matches(type))
        if (types.length === 0) return null
        return (
          <section key={category.id} className="space-y-1.5">
            <h3 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{category.label}</h3>
            <div className="grid gap-1.5">
              {types.map((type) => {
                const def = getBlockDefinition(type)
                const Icon = def.icon
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={disabled}
                    onClick={() => onAdd(type)}
                    className="group flex items-start gap-2.5 rounded-lg border bg-card p-2.5 text-left transition-colors outline-none hover:border-primary/60 hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground group-hover:bg-primary/10 group-hover:text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{def.label}</span>
                      <span className="block text-xs leading-snug text-muted-foreground">{def.description}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export function BlockLayers({
  blocks,
  selectedId,
  onSelect,
  onReorder,
  disabled,
}: {
  blocks: Block[]
  selectedId: string | null
  onSelect: (id: string) => void
  onReorder: (activeId: string, overId: string) => void
  disabled?: boolean
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  // id cố định để aria-describedby của dnd-kit khớp giữa server và client
  const dndId = useId()

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over && event.active.id !== event.over.id) onReorder(String(event.active.id), String(event.over.id))
  }

  if (blocks.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">Trang chưa có khối nào.</p>
  }

  return (
    <div className="p-3">
      <p className="mb-2 text-xs text-muted-foreground">Kéo thả để sắp xếp thứ tự các khối.</p>
      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy} disabled={disabled}>
          <ol className="space-y-1">
            {blocks.map((block, index) => (
              <LayerItem
                key={block.id}
                block={block}
                index={index}
                selected={block.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function LayerItem({
  block,
  index,
  selected,
  onSelect,
}: {
  block: Block
  index: number
  selected: boolean
  onSelect: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })
  const def = getBlockDefinition(block.type)
  const Icon = def.icon
  const props = block.props as Record<string, unknown>
  const subtitle = typeof props.title === "string" && props.title ? props.title : null

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-1 rounded-lg border bg-card pr-2",
        selected && "border-primary ring-1 ring-primary",
        isDragging && "z-10 opacity-80 shadow-lg"
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="flex h-10 w-7 shrink-0 cursor-grab items-center justify-center text-muted-foreground active:cursor-grabbing"
        aria-label={`Kéo để sắp xếp: ${def.label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <button type="button" className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left" onClick={() => onSelect(block.id)}>
        <span className="w-5 shrink-0 text-xs text-muted-foreground tabular-nums">{index + 1}</span>
        <Icon className="size-4 shrink-0" />
        <span className={cn("min-w-0", block.hidden && "opacity-50")}>
          <span className="block truncate text-sm font-medium">{def.label}</span>
          {subtitle ? <span className="block truncate text-xs text-muted-foreground">{subtitle}</span> : null}
        </span>
      </button>
      {block.hidden ? <EyeOff className="size-4 shrink-0 text-muted-foreground" aria-label="Đang ẩn" /> : null}
    </li>
  )
}
