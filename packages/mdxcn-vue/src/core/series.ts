/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { numbers, splitDash } from './markdown.js'
import { numberOf, splitLabel } from './stack.js'

export interface SeriesData {
  data: number[]
  labels: string[]
  caption?: string
}
export interface BarSeries {
  label: string
  values: readonly number[]
  size?: 'sm' | 'lg'
}
export interface SeriesProps {
  label: string
  values?: readonly number[] | string
  size?: 'sm' | 'lg'
}
export interface SeriesListItem {
  text: string
  strong?: boolean
}
/** Shared Spark/Plot/KPI grammar; adapters provide visible list text or source text. */
export function seriesOf(list: readonly SeriesListItem[], source = ''): SeriesData {
  if (list.length) {
    const rows = list
      .map((item) => {
        const { label, rest } = splitLabel(item.text)
        return rest
          ? { label, value: numberOf(rest, Number.NaN) }
          : { label: '', value: numberOf(label, Number.NaN) }
      })
      .filter((row) => Number.isFinite(row.value))
    return {
      data: rows.map((row) => row.value),
      labels: rows.some((row) => row.label) ? rows.map((row) => row.label) : [],
    }
  }
  const { label, rest } = splitDash(source.replace(/\s+/g, ' ').trim())
  return { data: numbers(label), labels: [], caption: rest || undefined }
}
/** Bars has a distinct multi-value list grammar, rather than one value per label. */
export function barsFromList(list: readonly SeriesListItem[]): BarSeries[] {
  return list.map((item) => {
    const { label, rest } = splitLabel(item.text)
    return {
      label: label || item.text,
      values: numbers(rest),
      size: item.strong ? 'lg' : undefined,
    }
  })
}
