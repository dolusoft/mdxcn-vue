/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { TableCell, TableModel, GraphAlign } from './table.js'
import { cellText, resolveTable } from './table.js'

export interface SheetSection<Rich = never> {
  title: string
  rows: readonly (readonly TableCell<Rich>[])[]
}
export interface SheetData<Rich = never> {
  headers?: readonly TableCell[] | string | null
  sections?: readonly SheetSection<Rich>[] | null
  footer?: readonly TableCell<Rich>[] | null
  align?: readonly GraphAlign[] | string | null
}
export interface SheetModel<Rich = never> {
  headers: string[]
  sections: readonly SheetSection<Rich>[]
  footer?: TableCell<Rich>[]
  align?: GraphAlign[]
}
export function resolveSheet<Rich = never>(
  data: SheetData<Rich>,
  items: {
    head?: TableCell[]
    sections: SheetSection<Rich>[]
    foot?: TableCell<Rich>[]
    align?: GraphAlign[]
  },
  markdown: { title: string; table: TableModel | null }[],
): SheetModel<Rich> {
  // Sheet deliberately ignores Markdown footers, including detected Total rows.
  const first = markdown[0]?.table
  const { headers, footer, align } = resolveTable(
    data,
    { ...items, rows: [] },
    first ? { ...first, footer: undefined } : null,
  )
  return {
    headers,
    footer,
    align,
    sections:
      data.sections ??
      (items.sections.length
        ? items.sections
        : markdown.map((s) => ({
            title: s.title,
            rows: s.table?.rows.map((row) => row.map(cellText)) ?? [],
          }))),
  }
}

export interface InvoiceParty {
  name: string
  lines?: readonly string[]
}
export interface InvoiceMeta {
  label: string
  value: string
}
export interface InvoiceItem {
  description: string
  qty?: string
  rate?: string
  amount: string
}
export interface InvoiceTotal {
  label: string
  value: string
  accent?: boolean
}
export interface InvoiceData {
  from?: InvoiceParty | string | null
  to?: InvoiceParty | string | null
  meta?: readonly InvoiceMeta[] | null
  items?: readonly InvoiceItem[] | null
  totals?: readonly InvoiceTotal[] | null
  note?: string | null
}
export function partyOf(
  value: InvoiceData['from'],
  entry?: InvoiceParty,
): InvoiceParty | undefined {
  if (typeof value === 'string') {
    const [name, ...lines] = value
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean)
    return name ? { name, lines: lines.length ? lines : undefined } : undefined
  }
  return value || entry
}
/** Amounts are literal text; upstream performs no arithmetic or locale formatting. */
export function moneyLine(text: string): { label: string; value: string } | null {
  const match = text.match(/^(.*?)\s+([+\-−]?[\d,]+(?:\.\d+)?)\s*$/)
  return match ? { label: match[1]?.trim() ?? '', value: match[2] ?? '' } : null
}
export function invoiceItems(table: TableModel | null): InvoiceItem[] {
  if (!table) return []
  const headers = table.headers.map((h) => h.toLowerCase())
  const qtyAt = headers.findIndex((h) => /qty|qty\.|quantity/.test(h))
  const rateAt = headers.findIndex((h) => /rate|price/.test(h))
  const amountAt = headers.findIndex((h) => /amount|total|sum/.test(h))
  return table.rows.map((cells) => {
    const row = cells.map(cellText)
    const qty =
      qtyAt >= 0
        ? row[qtyAt]
        : row.length >= 4
          ? row[1]
          : row.length === 3 && rateAt < 0
            ? row[1]
            : undefined
    const rate = rateAt >= 0 ? row[rateAt] : row.length >= 4 ? row[2] : undefined
    return {
      description: row[0] ?? '',
      qty: qty || undefined,
      rate: rate || undefined,
      amount: row[amountAt >= 0 ? amountAt : row.length - 1] ?? '',
    }
  })
}
