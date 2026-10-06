/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { BarRow, SegmentRow, StackRow } from './model'

export const DEFAULT_STACK_GLYPHS = ['█', '▓', '▒', '░', '#', '=', '+', '-'] as const

export function numberOf(value: number | string | null | undefined, fallback = 0): number {
  if (value == null) return fallback
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : fallback
}

export function splitLabel(text: string): { label: string; rest: string } {
  const match = text.match(/^(.+?):\s+(.+)$/)
  return match
    ? { label: (match[1] ?? text).trim(), rest: (match[2] ?? '').trim() }
    : { label: text, rest: '' }
}

export function segmentsFromText(text: string): SegmentRow[] {
  return [...text.matchAll(/(\d[\d,.]*)\s+([^\s,]+)/g)].map((part) => ({
    label: part[2] ?? '',
    value: numberOf(part[1]),
  }))
}

export function normalizeRows(rows: readonly StackRow[]): BarRow[] {
  return rows.map((row) => ({
    ...row,
    segments: (row.segments ?? []).map((segment) => ({
      label: segment.label ?? '',
      value: numberOf(segment.value),
    })),
  }))
}

export interface Painted {
  label: string
  glyph: string
  count: number
  accent: boolean
}

export function paintRow(
  segments: readonly SegmentRow[],
  ticks: number,
  glyphs: readonly string[],
  accentLabel?: string,
): Painted[] {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1
  let left = ticks
  return segments.map((segment, index) => {
    const raw = Math.round((segment.value / total) * ticks)
    const count =
      index === segments.length - 1 ? Math.max(0, left) : Math.min(Math.max(0, raw), left)
    left -= count
    return {
      label: segment.label,
      glyph: glyphs[index % glyphs.length] ?? '█',
      count,
      accent: accentLabel ? segment.label === accentLabel : index === 0,
    }
  })
}

export function stackLegend(rows: readonly BarRow[]): string[] {
  return [...new Set(rows.flatMap((row) => row.segments.map((segment) => segment.label)))]
}

/** Empty arrays intentionally suppress fallback inputs, matching upstream. */
export function resolveStackRows(
  rows: readonly StackRow[] | null | undefined,
  listed: BarRow[],
  tagged: BarRow[],
): BarRow[] {
  return rows ? normalizeRows(rows) : listed.length ? listed : tagged
}
