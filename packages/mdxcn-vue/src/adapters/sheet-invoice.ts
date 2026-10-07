/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { VNode } from 'vue'
import type {
  SheetData,
  SheetSection,
  InvoiceData,
  InvoiceParty,
  InvoiceItem,
  InvoiceTotal,
} from '../core/sheet-invoice.js'
import { resolveSheet, invoiceItems, partyOf, moneyLine } from '../core/sheet-invoice.js'
import { headingSections } from '../core/sections.js'
import { splitLabel } from '../core/stack.js'
import { childItems, childrenOf, defineItem, flattenNodes, textOf } from './items.js'
import { Head, Row, Foot, cellsOf, alignsOf, tableOf } from './table.js'
import type { TableCell } from '../core/table.js'
import { readerListItems } from './code-readers.js'
import { hasStateHost } from './state-list.js'

export interface SectionProps {
  title: string
  rows?: SheetSection<VNode>['rows'] | null
}
export const Section = defineItem<SectionProps>('Section', {
  title: { type: 'string' },
  rows: { type: 'array' },
})
export const From = defineItem<InvoiceParty>('From', {
  name: { type: 'string' },
  lines: { type: 'array' },
})
export const To = defineItem<InvoiceParty>('To', {
  name: { type: 'string' },
  lines: { type: 'array' },
})
export interface MetaProps {
  label: string
  value?: string
}
export interface ItemProps {
  description?: string
  qty?: string
  rate?: string
  amount: string
}
export interface TotalProps {
  label?: string
  value?: string
  accent?: boolean
}
export const Meta = defineItem<MetaProps>('Meta', {
  label: { type: 'string' },
  value: { type: 'string' },
})
export const Item = defineItem<ItemProps>('Item', {
  description: { type: 'string' },
  qty: { type: 'string' },
  rate: { type: 'string' },
  amount: { type: 'string' },
})
export const Total = defineItem<TotalProps>('Total', {
  label: { type: 'string' },
  value: { type: 'string' },
  accent: { type: 'boolean' },
})
export function sheetModel(data: SheetData<VNode>, nodes: readonly VNode[]) {
  const markdown = headingSections(
    flattenNodes(nodes).filter((n) => typeof n.type !== 'symbol'),
    (n) =>
      /^h[1-6]$/.test(String(n.type))
        ? { title: textOf(childrenOf(n)).trim(), accent: false }
        : undefined,
  ).map((s) => ({ title: s.title, table: tableOf(s.children) }))
  const head = childItems(nodes, Head)[0]
  const foot = childItems(nodes, Foot)[0]
  return resolveSheet(
    data,
    {
      head: head ? cellsOf(undefined, head.children) : undefined,
      foot: foot
        ? cellsOf(foot.props.cells as TableCell<VNode>[] | undefined, foot.children)
        : undefined,
      align: alignsOf(head?.children),
      sections: childItems(nodes, Section).map((s) => ({
        title: s.props.title as string,
        rows:
          (s.props.rows as SheetSection<VNode>['rows']) ??
          childItems(s.children, Row).map((r) =>
            cellsOf(r.props.cells as TableCell<VNode>[] | undefined, r.children),
          ),
      })),
    },
    markdown,
  )
}
const linesOf = (nodes: readonly VNode[]): string[] => {
  const paragraphs = flattenNodes(nodes).filter((n) => n.type === 'p')
  return paragraphs.length
    ? paragraphs.flatMap((p) => linesOf(childrenOf(p)))
    : textOf(nodes)
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
}
export function invoiceModel(data: InvoiceData, nodes: readonly VNode[]) {
  const party = (component: typeof From) => {
    const entry = childItems(nodes, component)[0]
    if (!entry) return undefined
    const lines = (entry.props.lines as string[] | undefined) ?? linesOf(entry.children)
    return { name: entry.props.name as string, lines: lines.length ? lines : undefined }
  }
  const meta = childItems(nodes, Meta).map((e) => ({
    label: e.props.label as string,
    value: (e.props.value as string) ?? textOf(e.children),
  }))
  const items: InvoiceItem[] = childItems(nodes, Item).map((e) => ({
    description: (e.props.description as string | undefined) ?? textOf(e.children),
    qty: e.props.qty as string | undefined,
    rate: e.props.rate as string | undefined,
    amount: e.props.amount as string,
  }))
  const totals: InvoiceTotal[] = childItems(nodes, Total).map((e) => ({
    label: (e.props.label as string | undefined) ?? textOf(e.children),
    value: (e.props.value as string | undefined) ?? textOf(e.children),
    accent: e.props.accent as boolean,
  }))
  const paragraphs = flattenNodes(nodes).filter((n) => n.type === 'p')
  return {
    from: partyOf(data.from, party(From)),
    to: partyOf(data.to, party(To)),
    meta:
      data.meta ??
      (meta.length
        ? meta
        : readerListItems(nodes)
            .map((e) => splitLabel(textOf(childrenOf(e))))
            .filter((e) => e.rest)
            .map((e) => ({ label: e.label, value: e.rest }))),
    items: (data.items ?? (items.length ? items : invoiceItems(tableOf(nodes)))).map((e) => ({
      ...e,
      description: e.description ?? '',
    })),
    totals:
      data.totals ??
      (totals.length
        ? totals
        : paragraphs.flatMap((p) => {
            const parsed = moneyLine(textOf(childrenOf(p)).trim())
            return parsed
              ? [{ ...parsed, accent: hasStateHost(childrenOf(p), ['strong', 'b']) }]
              : []
          })),
    note:
      data.note ??
      paragraphs.map((p) => textOf(childrenOf(p)).trim()).find((t) => t && !moneyLine(t)),
  }
}
