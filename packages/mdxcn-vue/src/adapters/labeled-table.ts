/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { VNode } from 'vue'
import { childItems, defineItem, textOf } from './items.js'
import { Row, tableOf } from './table.js'
import type { LabeledTableData } from '../core/labeled-table.js'
import { resolveLabeledTable } from '../core/labeled-table.js'

export const Col = /* @__PURE__ */ defineItem<object>('Col', {})
/** Read during render; no cloned or patched input VNodes. */
export function labeledModel<Values extends readonly unknown[]>(
  data: LabeledTableData<{ label: string; values: Values }>,
  nodes: readonly VNode[],
  parse: (row: { label: string; values: string[] }) => { label: string; values: Values },
  parseText: (text: string) => Values,
  withColumns = false,
) {
  return resolveLabeledTable(
    data,
    {
      ...(withColumns
        ? { columns: childItems(nodes, Col).map((col) => textOf(col.children)) }
        : {}),
      rows: childItems(nodes, Row).map((row) => ({
        label: String(row.props.label ?? ''),
        values: parseText(textOf(row.children)),
      })),
    },
    tableOf(nodes),
    parse,
  )
}
