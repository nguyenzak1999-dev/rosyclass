"use client"

import { useId, useState, type ReactNode } from "react"
import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploader } from "@/components/ui/image-uploader"
import { cn } from "@/lib/utils"
import type { AnyField, FieldMap, ListField, ToneField } from "@/lib/page-builder/fields"
import { BACKGROUND_SWATCHES, TONE_SWATCHES, labelForTone } from "@/lib/page-builder/styles"

export type FieldChange = (value: unknown, mergeKey?: string) => void

const LINK_SUGGESTIONS = [
  "/",
  "/dang-ky",
  "/kiem-tra-trinh-do",
  "/khoa-hoc",
  "/lich-khai-giang",
  "/giao-vien",
  "/goc-hoc-tap",
  "/hoi-dap",
  "/lien-he",
  "/ve-chung-toi",
]

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

function fieldError(field: AnyField, value: unknown): string | null {
  if (field.kind === "list") return null
  const result = field.schema.safeParse(value)
  return result.success ? null : (result.error.issues[0]?.message ?? "Giá trị không hợp lệ")
}

export function FieldControl({
  field,
  value,
  onChange,
  idPrefix,
}: {
  field: AnyField
  value: unknown
  onChange: FieldChange
  idPrefix: string
}) {
  const id = `${idPrefix}-${useId()}`
  const error = fieldError(field, value)
  const help = field.help ? <p className="text-xs text-muted-foreground">{field.help}</p> : null
  const errorNode = error ? <p className="text-xs font-medium text-destructive">{error}</p> : null

  switch (field.kind) {
    case "text":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={id}>{field.label}</Label>
          <Input
            id={id}
            value={String(value ?? "")}
            placeholder={field.placeholder}
            aria-invalid={Boolean(error)}
            onChange={(event) => onChange(event.target.value, "text")}
          />
          {help}
          {errorNode}
        </div>
      )

    case "textarea":
    case "markdown":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={id}>{field.label}</Label>
          <Textarea
            id={id}
            value={String(value ?? "")}
            rows={field.rows ?? (field.kind === "markdown" ? 8 : 3)}
            placeholder={field.kind === "textarea" ? field.placeholder : undefined}
            aria-invalid={Boolean(error)}
            className={cn("min-h-0", field.kind === "markdown" && "font-mono text-[13px]")}
            onChange={(event) => onChange(event.target.value, "text")}
          />
          {help}
          {errorNode}
        </div>
      )

    case "link":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={id}>{field.label}</Label>
          <Input
            id={id}
            value={String(value ?? "")}
            placeholder={field.placeholder}
            list={`${id}-suggestions`}
            aria-invalid={Boolean(error)}
            onChange={(event) => onChange(event.target.value.trim(), "text")}
          />
          <datalist id={`${id}-suggestions`}>
            {LINK_SUGGESTIONS.map((link) => (
              <option key={link} value={link} />
            ))}
          </datalist>
          {help}
          {errorNode}
        </div>
      )

    case "image":
      return (
        <div className="space-y-1.5">
          <ImageUploader
            label={field.label}
            value={String(value ?? "")}
            onChange={(url) => onChange(url)}
            folder={field.folder ?? "pages"}
            aspectRatio={field.aspectRatio ?? "16/9"}
          />
          {help}
          {errorNode}
        </div>
      )

    case "select":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={id}>{field.label}</Label>
          <select id={id} className={selectClass} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)}>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {help}
          {errorNode}
        </div>
      )

    case "tone":
      return <ToneControl field={field} value={String(value ?? "")} onChange={onChange} help={help} />

    case "number":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={id}>{field.label}</Label>
          <Input
            id={id}
            type="number"
            inputMode="numeric"
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            value={typeof value === "number" ? value : ""}
            onChange={(event) => {
              const next = Number(event.target.value)
              if (event.target.value === "" || !Number.isFinite(next)) return
              onChange(Math.min(field.max, Math.max(field.min, Math.round(next))), "text")
            }}
          />
          <p className="text-xs text-muted-foreground">
            Từ {field.min} đến {field.max}
          </p>
          {help}
        </div>
      )

    case "boolean":
      return (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
            <Label htmlFor={id} className="cursor-pointer">
              {field.label}
            </Label>
            <Switch id={id} checked={value === true} onCheckedChange={(checked) => onChange(Boolean(checked))} />
          </div>
          {help}
        </div>
      )

    case "list":
      return <ListControl field={field} value={Array.isArray(value) ? value : []} onChange={onChange} idPrefix={id} />
  }
}

function ToneControl({
  field,
  value,
  onChange,
  help,
}: {
  field: ToneField
  value: string
  onChange: FieldChange
  help: ReactNode
}) {
  const swatches: Record<string, string> = field.palette === "background" ? BACKGROUND_SWATCHES : TONE_SWATCHES
  const labelId = useId()
  return (
    <div className="space-y-1.5">
      <p id={labelId} className="text-sm leading-none font-medium">
        {field.label}
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-2">
        {field.options.map((option) => {
          const selected = option === value
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              title={labelForTone(option)}
              aria-label={labelForTone(option)}
              onClick={() => onChange(option)}
              className={cn(
                "h-8 w-8 rounded-full border-2 border-[#2b2140]/70 transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:scale-105"
              )}
              style={{ backgroundColor: swatches[option] }}
            />
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">Đang chọn: {labelForTone(value)}</p>
      {help}
    </div>
  )
}

type ListItem = Record<string, unknown>

function ListControl({
  field,
  value,
  onChange,
  idPrefix,
}: {
  field: ListField
  value: ListItem[]
  onChange: FieldChange
  idPrefix: string
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(value.length > 0 ? 0 : null)
  const canAdd = value.length < field.maxItems
  const canRemove = value.length > field.minItems

  const update = (next: ListItem[], mergeKey?: string) => onChange(next, mergeKey)

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= value.length) return
    const next = [...value]
    ;[next[index], next[target]] = [next[target], next[index]]
    update(next)
    setOpenIndex(target)
  }

  const itemTitle = (item: ListItem, index: number) => {
    const raw = field.titleKey ? item[field.titleKey] : undefined
    const title = typeof raw === "string" ? raw.trim() : ""
    return title || `${field.itemLabel} #${index + 1}`
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm leading-none font-medium">{field.label}</p>
        <span className="text-xs text-muted-foreground">
          {value.length}/{field.maxItems}
        </span>
      </div>
      {field.help ? <p className="text-xs text-muted-foreground">{field.help}</p> : null}

      <ol className="space-y-2">
        {value.map((item, index) => {
          const open = openIndex === index
          return (
            <li key={index} className="rounded-lg border bg-muted/30">
              <div className="flex items-center gap-1 px-2 py-1.5">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1 text-left text-sm font-medium hover:bg-muted"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : index)}
                >
                  <ChevronDown className={cn("size-4 shrink-0 transition-transform", !open && "-rotate-90")} />
                  <span className="truncate">{itemTitle(item, index)}</span>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Chuyển lên"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ChevronUp />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Chuyển xuống"
                  disabled={index === value.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ChevronDown />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Nhân bản"
                  disabled={!canAdd}
                  onClick={() => {
                    const next = [...value]
                    next.splice(index + 1, 0, JSON.parse(JSON.stringify(item)) as ListItem)
                    update(next)
                    setOpenIndex(index + 1)
                  }}
                >
                  <Copy />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Xoá"
                  disabled={!canRemove}
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    update(value.filter((_, i) => i !== index))
                    setOpenIndex(null)
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
              {open ? (
                <div className="space-y-4 border-t px-3 py-3">
                  <SubFields
                    fields={field.fields}
                    item={item}
                    idPrefix={`${idPrefix}-${index}`}
                    onChange={(key, next, mergeKey) =>
                      update(
                        value.map((current, i) => (i === index ? { ...current, [key]: next } : current)),
                        mergeKey ? `${index}.${key}.${mergeKey}` : undefined
                      )
                    }
                  />
                </div>
              ) : null}
            </li>
          )
        })}
      </ol>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        disabled={!canAdd}
        onClick={() => {
          update([...value, JSON.parse(JSON.stringify(field.newItem)) as ListItem])
          setOpenIndex(value.length)
        }}
      >
        <Plus /> Thêm {field.itemLabel.toLowerCase()}
      </Button>
    </div>
  )
}

function SubFields({
  fields,
  item,
  idPrefix,
  onChange,
}: {
  fields: FieldMap
  item: ListItem
  idPrefix: string
  onChange: (key: string, value: unknown, mergeKey?: string) => void
}) {
  return (
    <>
      {Object.entries(fields).map(([key, field]) => (
        <FieldControl
          key={key}
          field={field}
          value={item[key]}
          idPrefix={`${idPrefix}-${key}`}
          onChange={(next, mergeKey) => onChange(key, next, mergeKey)}
        />
      ))}
    </>
  )
}
