/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { VNode } from 'vue'
import { normalizeStyle } from 'vue'
import type { ProseNode } from '../core/model'
import { sliceProse, proseText } from '../core/model'
import type { GraphAlign, TableCell, TableData, TableModel } from '../core/table'
import { cellText, resolveTable, splitCells, toLabeledTable } from '../core/table'
import { childItems, childrenOf, defineItem, flattenNodes, textOf } from './items'
import { readProse } from './stack'

export interface RowProps {
  label?: string
  cells?: TableCell<VNode>[]
}
export interface CellProps {
  align?: GraphAlign
}
export const Head = defineItem<object>('Head', {})
export const Row = defineItem<RowProps>('Row', {
  label: { type: 'string' },
  cells: { type: 'array' },
})
export const Foot = defineItem<RowProps>('Foot', {
  label: { type: 'string' },
  cells: { type: 'array' },
})
export const Cell = defineItem<CellProps>('Cell', { align: { type: 'string' } })

function inlineCell(nodes: readonly VNode[], trim = false): string | ProseNode[] {
  const prose = readProse(nodes)
  const text = proseText(prose)
  const content: ProseNode[] = trim
    ? sliceProse(prose, text.length - text.trimStart().length, text.trimEnd().length)
    : prose
  return content.some((node) => node.type !== 'text') ? content : proseText(content)
}

export function cellsOf<Rich = never>(
  value?: readonly TableCell<Rich>[] | string | null,
  nodes: readonly VNode[] = [],
): TableCell<Rich>[] {
  if (Array.isArray(value)) return [...value]
  const nested = childItems(nodes, Cell)
  if (nested.length) return nested.map((cell) => inlineCell(cell.children, true))
  return splitCells(typeof value === 'string' ? value : textOf(nodes))
}

export function alignsOf(nodes: readonly VNode[] = []): GraphAlign[] | undefined {
  const cells = childItems(nodes, Cell)
  if (!cells.some((cell) => cell.props.align)) return undefined
  return cells.map(
    (cell, index) => (cell.props.align ?? (index === 0 ? 'left' : 'right')) as GraphAlign,
  )
}

const rowsIn = (section?: VNode) =>
  section ? childrenOf(section).filter((node) => node.type === 'tr') : []
const hostCells = (row: VNode) =>
  childrenOf(row).filter((node) => node.type === 'th' || node.type === 'td')
function isTotal(row: VNode): boolean {
  const first = hostCells(row)[0]
  if (!first) return false
  const nodes = childrenOf(first).filter((node) => textOf([node]).trim() !== '')
  return (
    (nodes.length === 1 && ['strong', 'b'].includes(String(nodes[0]?.type))) ||
    /^total$/i.test(textOf(childrenOf(first)).trim())
  )
}

/** Read only the first direct host table, preserving supported inline prose. */
export function tableOf(nodes: readonly VNode[]): MarkdownTable | null {
  const table = flattenNodes(nodes).find((node) => node.type === 'table')
  if (!table) return null
  const sections = childrenOf(table)
  const heads = rowsIn(sections.find((node) => node.type === 'thead'))
  const bodies = rowsIn(sections.find((node) => node.type === 'tbody') ?? table)
  const foots = rowsIn(sections.find((node) => node.type === 'tfoot'))
  const head = heads[0] ?? bodies[0]
  if (!head) return null
  const rest = heads[0] ? bodies : bodies.slice(1)
  const last = rest.at(-1)
  const written = !foots[0] && last && rest.length > 1 && isTotal(last) ? last : undefined
  const values = (row: VNode) => hostCells(row).map((cell) => inlineCell(childrenOf(cell), true))
  const aligns = hostCells(head).map((cell): GraphAlign | undefined => {
    const style = normalizeStyle([cell.props?.style])
    const value =
      cell.props?.align ||
      (typeof style === 'object' ? (style.textAlign ?? style['text-align']) : undefined)
    return value === 'left' || value === 'right' ? value : undefined
  })
  const foot = foots[0] ?? written
  return {
    headers: values(head).map(cellText),
    rows: (written ? rest.slice(0, -1) : rest).map(values),
    ...(foot ? { footer: values(foot) } : {}),
    ...(aligns.some(Boolean)
      ? { align: aligns.map((value, index) => value ?? (index === 0 ? 'left' : 'right')) }
      : {}),
  }
}

/** Host-table readers never produce numeric, null, or framework-native data cells. */
export interface MarkdownTable extends TableModel {
  rows: (string | ProseNode[])[][]
  footer?: (string | ProseNode[])[]
}

export function labeledTable(nodes: readonly VNode[]) {
  return toLabeledTable(tableOf(nodes))
}

/** Invoke during render so keyed slot replacements are reparsed. */
export function tableModel(data: TableData<VNode>, nodes: readonly VNode[]): TableModel<VNode> {
  const head = childItems(nodes, Head)[0]
  const foot = childItems(nodes, Foot)[0]
  return resolveTable(
    data,
    {
      ...(head ? { head: cellsOf(undefined, head.children) } : {}),
      rows: childItems(nodes, Row).map((row) =>
        cellsOf(row.props.cells as TableCell<VNode>[] | undefined, row.children),
      ),
      ...(foot
        ? { foot: cellsOf(foot.props.cells as TableCell<VNode>[] | undefined, foot.children) }
        : {}),
      align: alignsOf(head?.children),
    },
    tableOf(nodes),
  )
}
