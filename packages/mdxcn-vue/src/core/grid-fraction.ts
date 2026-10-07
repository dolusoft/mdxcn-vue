/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { firstToken } from './numeric-list.js'
import { splitLabel } from './stack.js'

export interface CellGrid {
  label: string
  cells: readonly (readonly number[])[]
}
export interface GridProps {
  label: string
  cells?: readonly (readonly number[])[] | null
}
export interface FractionData {
  token: string
  caption?: string
}
/** Numeric props deliberately retain NaN; invalid strings use the fallback. */
export function fraction(value: number | string | null | undefined, fallback = 0): number {
  if (value == null) return fallback
  if (typeof value === 'number') return value
  const text = value.trim(),
    parsed = Number.parseFloat(text)
  return Number.isFinite(parsed) ? (text.endsWith('%') ? parsed / 100 : parsed) : fallback
}
export function fractionOf(text: string): FractionData {
  const { token, rest } = firstToken(text.replace(/\s+/g, ' ').trim())
  return { token, caption: rest.replace(/^[—–-]\s*/, '') || undefined }
}
/** Multiple direct element blocks win over slash-separated rows and visible lines. */
export function gridCellsOf(
  text: string,
  blocks: readonly string[] = [],
  lines = text.split('\n'),
): number[][] {
  return (blocks.length > 1 ? blocks : text.includes('/') ? text.trim().split('/') : lines)
    .map((line) =>
      line
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number)
        .filter(Number.isFinite),
    )
    .filter((row) => row.length > 0)
}
export function gridsFromList(list: readonly string[]): CellGrid[] {
  return list.map((text) => {
    const { label, rest } = splitLabel(text)
    return { label, cells: gridCellsOf(rest) }
  })
}
