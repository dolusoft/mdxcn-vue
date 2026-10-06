/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { firstToken } from './numeric-list.js'
import { splitDash } from './markdown.js'
import { numberOf, splitLabel } from './stack.js'
import type { StateListItem } from './state-list.js'

export interface StatItem {
  value: string | number
  label?: string
  hint?: string
  accent?: boolean
}
export interface SlopeItem {
  label?: string
  from: number | string
  to: number | string
}
export interface BulletItem {
  label?: string
  value: number | string
  target?: number | string
  max?: number | string
  display?: string
}
export interface BulletRow {
  label: string
  value: number
  target?: number
  max?: number
  display?: string
}
export function statFromList(item: StateListItem): StatItem {
  const { token, rest } = firstToken(item.text)
  const { label, rest: hint } = splitDash(rest)
  return { value: token, label, hint: hint || undefined, accent: item.strong }
}
export function slopeFromList(item: StateListItem): SlopeItem {
  const { label, rest } = splitLabel(item.text)
  const [from = '', to = ''] = rest.split(/\s*(?:→|->|—>|=>)\s*/)
  return { label, from, to }
}
export function bulletFromList(item: StateListItem): BulletItem {
  const { label, rest } = splitLabel(item.text)
  const [value = '', restMax] = rest.split(/\s*\/\s*/)
  const [target, max] = (restMax ?? '').split(/\s+of\s+/i)
  return { label, value, target: target || undefined, max: max || undefined, display: undefined }
}
export function normalizeSlope(items: readonly SlopeItem[]) {
  return items.map((item) => ({
    label: item.label ?? '',
    from: numberOf(item.from),
    to: numberOf(item.to),
  }))
}
export function normalizeBullet(items: readonly BulletItem[]): BulletRow[] {
  return items.map((item) => ({
    label: item.label ?? '',
    value: numberOf(item.value),
    target: item.target == null ? undefined : numberOf(item.target),
    max: item.max == null ? undefined : numberOf(item.max),
    display: item.display,
  }))
}
export function formatNumber(value: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: Number.isInteger(value) ? 0 : 1 })
}
export function formatBullet(item: BulletRow) {
  return (
    item.display ||
    (item.target == null
      ? formatNumber(item.value)
      : `${formatNumber(item.value)} / ${formatNumber(item.target)}`)
  )
}
