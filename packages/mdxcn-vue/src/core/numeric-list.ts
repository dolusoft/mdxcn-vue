/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { numberOf, splitLabel } from './stack.js'
import type { StateListItem } from './state-list.js'
export interface ScoreRow {
  label: string
  value: number
  max?: number
  accent?: boolean
}
export interface RankItem {
  label?: string
  value: number | string
  display?: string
}
export type FunnelStep = RankItem
export interface NumericRow {
  label: string
  value: number
  display?: string
}
/** Upstream keeps the first token verbatim for display, including units and percent. */
export function firstToken(text: string): { token: string; rest: string } {
  const match = text.match(/^(\S+)\s*(.*)$/)
  return match ? { token: match[1] ?? text, rest: match[2] ?? '' } : { token: text, rest: '' }
}
export function numericFromList(item: StateListItem): NumericRow {
  const { token, rest } = firstToken(item.text)
  return { label: rest, value: numberOf(token), display: token }
}
export function scoreFromList(item: StateListItem): ScoreRow {
  const { label, rest } = splitLabel(item.text)
  const [value = '', out] = rest.split('/')
  return {
    label,
    value: numberOf(value),
    max: out ? numberOf(out) : undefined,
    accent: item.strong,
  }
}
export function normalizeNumeric(items: readonly RankItem[]): NumericRow[] {
  return items.map((item) => ({
    label: item.label ?? '',
    value: numberOf(item.value),
    display: item.display,
  }))
}
