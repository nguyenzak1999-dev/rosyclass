"use client"

import { MousePointerClick } from "lucide-react"
import type { Block } from "@/lib/page-builder/document"
import { getBlockDefinition } from "@/lib/page-builder/registry"
import { FieldControl } from "./field-controls"

// Nhóm các field chung xuống cuối inspector
const STYLE_KEYS = new Set(["accent", "tone", "background", "anchor"])

export function BlockInspector({
  block,
  onChangeProp,
}: {
  block: Block | null
  onChangeProp: (blockId: string, key: string, value: unknown, mergeKey?: string) => void
}) {
  if (!block) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center text-muted-foreground">
        <MousePointerClick className="size-8 opacity-50" />
        <p className="text-sm">Chọn một khối trên trang để chỉnh sửa nội dung, hoặc thêm khối mới từ thư viện bên trái.</p>
      </div>
    )
  }

  const definition = getBlockDefinition(block.type)
  const Icon = definition.icon
  const props = block.props as Record<string, unknown>
  const entries = Object.entries(definition.fields)
  const contentFields = entries.filter(([key]) => !STYLE_KEYS.has(key))
  const styleFields = entries.filter(([key]) => STYLE_KEYS.has(key))

  return (
    <div className="space-y-5 p-4" key={block.id}>
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold">{definition.label}</p>
          <p className="text-xs text-muted-foreground">{definition.description}</p>
        </div>
      </div>

      {contentFields.map(([key, field]) => (
        <FieldControl
          key={key}
          field={field}
          value={props[key]}
          idPrefix={`${block.id}-${key}`}
          onChange={(value, mergeKey) => onChangeProp(block.id, key, value, mergeKey)}
        />
      ))}

      {styleFields.length > 0 ? (
        <div className="space-y-4 border-t pt-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Giao diện</p>
          {styleFields.map(([key, field]) => (
            <FieldControl
              key={key}
              field={field}
              value={props[key]}
              idPrefix={`${block.id}-${key}`}
              onChange={(value, mergeKey) => onChangeProp(block.id, key, value, mergeKey)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
