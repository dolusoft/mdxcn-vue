/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { numberOf, splitLabel } from './stack.js'
import { proseText } from './model.js'
import type { StateListItem } from './state-list.js'
export interface GanttItem {
  label?: string
  start: number | string
  end: number | string
  accent?: boolean
  complete?: number | string
}
export interface GanttRow {
  label: string
  start: number
  end: number
  accent?: boolean
  complete?: number
}
export function ganttFromList(item: StateListItem): GanttItem {
  const { label, rest } = splitLabel(item.text)
  const nums = (rest || item.text).match(/[\d.]+/g) ?? []
  return {
    label: rest
      ? label
      : item.text
          .replace(/[\d.]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim(),
    start: nums[0] ?? 0,
    end: nums[1] ?? nums[0] ?? 0,
    complete: nums[2],
    accent: item.strong,
  }
}
export function normalizeGantt(items: readonly GanttItem[]): GanttRow[] {
  return items.map((entry) => ({
    label: entry.label ?? '',
    start: numberOf(entry.start),
    end: numberOf(entry.end),
    accent: entry.accent,
    complete: entry.complete == null ? undefined : numberOf(entry.complete),
  }))
}
export type DiffSign = 'add' | 'remove' | 'keep'
export interface DiffRow {
  label?: string
  value: string
  sign?: DiffSign
}
export interface DiffLineProps extends DiffRow {
  total?: boolean
}
export interface DiffPart {
  text: string
  struck?: boolean
}
/** Only direct struck hosts in the first paragraph participate in a rewrite. */
export function diffRewrite(parts: readonly DiffPart[]): DiffLineProps[] | null {
  let before = '',
    struck = '',
    after = '',
    seen = false
  for (const part of parts) {
    if (part.struck) {
      struck += part.text
      seen = true
    } else if (seen) after += part.text
    else before += part.text
  }
  if (!seen) return null
  const clean = (text: string) => text.replace(/\s+/g, ' ').trim()
  const rows: DiffLineProps[] = []
  if (clean(struck)) rows.push({ label: clean(before + struck), value: '', sign: 'remove' })
  if (clean(after)) rows.push({ label: clean(before + after), value: '', sign: 'add' })
  return rows
}
export function diffFromList(item: StateListItem): DiffLineProps[] {
  const rewrite = diffRewrite(
    (item.head ?? []).map((node) => ({
      text: proseText([node]),
      struck: node.type === 'del',
    })),
  )
  if (rewrite) return rewrite
  const { label, rest } = splitLabel(item.text)
  return [
    {
      label,
      value: rest.replace(/^[+\-−]\s*/, '') || rest,
      sign: /^\+/.test(rest.trim()) ? 'add' : /^[−-]/.test(rest.trim()) ? 'remove' : undefined,
      total: item.strong,
    },
  ]
}
export type WaterfallKind = 'start' | 'in' | 'out' | 'end'
export interface WaterfallItem {
  label?: string
  value: number | string
  display?: string
  kind?: WaterfallKind
}
export interface WaterfallRow {
  label: string
  value: number
  display?: string
  kind?: WaterfallKind
}
export interface WaterfallSegment extends WaterfallRow {
  kind: WaterfallKind
  from: number
  to: number
}
export function waterfallFromList(item: StateListItem): WaterfallItem {
  const { label, rest } = splitLabel(item.text)
  const match = (rest || item.text).match(/([+\-−]?[\d,]+(?:\.\d+)?)\s*$/)
  return {
    label: rest ? label : item.text.replace(match?.[0] ?? '', '').trim(),
    value: match?.[1] ?? rest,
  }
}
export function normalizeWaterfall(items: readonly WaterfallItem[]): WaterfallRow[] {
  return items.map((entry) => ({
    label: entry.label ?? '',
    value: numberOf(entry.value),
    display: entry.display,
    kind: entry.kind,
  }))
}
export function waterfallSegments(items: readonly WaterfallRow[]): WaterfallSegment[] {
  let run = 0
  return items.map((entry, index) => {
    const kind =
      entry.kind ||
      (index === 0 ? 'start' : index === items.length - 1 ? 'end' : entry.value >= 0 ? 'in' : 'out')
    const magnitude = Math.abs(entry.value)
    const from = kind === 'start' || kind === 'end' ? 0 : kind === 'in' ? run : run - magnitude
    const to =
      kind === 'start' || kind === 'end' ? entry.value : kind === 'in' ? run + magnitude : run
    run = kind === 'out' ? from : to
    return { ...entry, kind, from, to }
  })
}
export function formatWaterfall(item: WaterfallRow, kind: WaterfallKind): string {
  if (item.display) return item.display
  const absolute = Math.abs(item.value).toLocaleString('en-US')
  return kind === 'in'
    ? `+${absolute}`
    : kind === 'out'
      ? `−${absolute}`
      : item.value.toLocaleString('en-US')
}
