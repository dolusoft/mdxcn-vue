/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { numbers, words } from './markdown.js'
import type { TableModel } from './table.js'
import { toLabeledTable } from './table.js'

export type CompareCell = string | boolean
export interface CompareRow {
  label: string
  values: readonly CompareCell[]
}
export interface MatrixRow {
  label: string
  values: readonly (number | string)[]
}
export interface HeatRow {
  label: string
  values: readonly number[]
}
export interface LabeledTableData<Row> {
  columns?: readonly string[] | string | null
  rows?: readonly Row[] | null
  table?: TableModel | null
}
export function compareCell(token: string): CompareCell {
  const value = token.trim(),
    key = value.toLowerCase()
  if (['true', 'yes', 'x'].includes(key) || value === '✓') return true
  if (['false', 'no', '–', '-', '—'].includes(key)) return false
  return value
}
export const compareValues = (text: string) => words(text).map(compareCell)
export const matrixValues = (text: string) =>
  words(text).map((token) => {
    const parsed = Number(token)
    return Number.isFinite(parsed) ? parsed : token
  })
export const formatMatrixCell = (value: number | string) =>
  typeof value === 'number'
    ? value.toLocaleString('en-US', { maximumFractionDigits: Number.isInteger(value) ? 0 : 1 })
    : value

/** Keep source precedence independent for columns and rows, including explicit empty data. */
export function resolveLabeledTable<Row extends { label: string }>(
  data: LabeledTableData<Row>,
  items: { columns?: string[]; rows: Row[] },
  runtime: TableModel | null,
  parse: (row: { label: string; values: string[] }) => Row,
) {
  const markdown = toLabeledTable(data.table ?? runtime)
  return {
    columns:
      data.columns == null
        ? items.columns?.length
          ? items.columns
          : (markdown?.columns ?? [])
        : words(data.columns),
    rows: (data.rows ?? (items.rows.length ? items.rows : markdown?.rows.map(parse)) ?? []).map(
      (row) => ({ ...row, label: row.label ?? '' }),
    ),
  }
}
export const compareFromTable = (row: { label: string; values: string[] }): CompareRow => ({
  label: row.label,
  values: row.values.map(compareCell),
})
export const matrixFromTable = (row: { label: string; values: string[] }): MatrixRow => ({
  label: row.label,
  values: matrixValues(row.values.join(' ')),
})
export const heatFromTable = (row: { label: string; values: string[] }): HeatRow => ({
  label: row.label,
  values: numbers(row.values.join(' ')),
})
