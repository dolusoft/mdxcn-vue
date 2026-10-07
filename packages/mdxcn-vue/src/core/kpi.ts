/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { numbers, splitDash } from './markdown.js'
import { firstToken } from './numeric-list.js'

export interface KpiData {
  value: string
  label: string
  hint?: string
  data: number[]
}
/** KPI reads visible lines, unlike the source/list grammar of seriesOf. */
export function kpiOf(lines: readonly string[]): KpiData {
  const [head = '', ...tail] = lines
  const { token, rest } = firstToken(head)
  const written = splitDash(rest)
  return {
    value: token,
    label: written.label,
    hint: written.rest || undefined,
    data: numbers(tail.join(' ')),
  }
}
