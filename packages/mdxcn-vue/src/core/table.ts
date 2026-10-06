/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { ProseNode } from './model'
import { proseText } from './model'

export type GraphAlign = 'left' | 'right'
export type TableCell = string | number | null | undefined | readonly ProseNode[]
export interface TableModel {
  headers: string[]
  rows: TableCell[][]
  footer?: TableCell[]
  align?: GraphAlign[]
}
export interface TableData {
  headers?: readonly TableCell[] | string | null
  rows?: readonly (readonly TableCell[])[] | null
  footer?: readonly TableCell[] | null
  align?: readonly GraphAlign[] | string | null
}
export interface TableItems {
  head?: TableCell[]
  rows: TableCell[][]
  foot?: TableCell[]
  align?: GraphAlign[]
}

export function cellText(cell: TableCell): string {
  return Array.isArray(cell) ? proseText(cell) : String(cell ?? '')
}

/** Pipe text preserves empty cells; plain text uses whitespace-separated words. */
export function splitCells(text: string): string[] {
  const trimmed = text.trim()
  return trimmed
    ? trimmed.includes('|')
      ? trimmed.split('|').map((cell) => cell.trim())
      : trimmed.split(/\s+/)
    : []
}

/** Each field chooses its own source; the existence of an empty Head still wins. */
export function resolveTable(
  data: TableData,
  items: TableItems,
  markdown: TableModel | null,
): TableModel {
  const headers =
    data.headers == null
      ? (items.head ?? markdown?.headers ?? [])
      : typeof data.headers === 'string'
        ? splitCells(data.headers)
        : data.headers
  const rows = data.rows ?? (items.rows.length ? items.rows : markdown?.rows) ?? []
  const footer = data.footer ?? items.foot ?? markdown?.footer
  const align =
    (typeof data.align === 'string'
      ? (data.align.trim().split(/\s+/).filter(Boolean) as GraphAlign[])
      : data.align) ??
    items.align ??
    markdown?.align
  return {
    headers: headers.map(cellText),
    rows: rows.map((row) => [...row]),
    ...(footer === undefined ? {} : { footer: [...footer] }),
    ...(align === undefined ? {} : { align: [...align] }),
  }
}

/** Shared first-column projection for compare, matrix and heatmap readers. */
export function toLabeledTable(table: TableModel | null) {
  if (!table || table.headers.length < 2) return null
  const labeled = ['', '—', '-'].includes(table.headers[0] ?? '')
  return {
    columns: labeled ? table.headers.slice(1) : table.headers,
    rows: table.rows.map((row) => ({
      label: cellText(row[0]),
      values: row.slice(1).map(cellText),
    })),
    ...(table.align === undefined ? {} : { align: labeled ? table.align.slice(1) : table.align }),
  }
}
