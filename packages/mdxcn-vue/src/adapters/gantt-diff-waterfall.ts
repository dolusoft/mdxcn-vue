/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { VNode } from 'vue'
import { defineItem, flattenNodes, textOf } from './items.js'
import { readerListItems } from './code-readers.js'
import { itemParts } from './state-list.js'
import { numericList } from './numeric-list.js'
import { diffRewrite, diffFromList } from '../core/gantt-diff-waterfall.js'
import type { GanttItem, DiffLineProps, WaterfallItem } from '../core/gantt-diff-waterfall.js'
export const Span = /* @__PURE__ */ defineItem<GanttItem>('Span', {
  label: { type: 'string' },
  start: { type: 'number' },
  end: { type: 'number' },
  complete: { type: 'number' },
  accent: { type: 'boolean' },
})
export const Line = /* @__PURE__ */ defineItem<DiffLineProps>('Line', {
  label: { type: 'string' },
  value: { type: 'string' },
  sign: { type: 'string' },
  total: { type: 'boolean' },
})
export const Delta = /* @__PURE__ */ defineItem<WaterfallItem>('Delta', {
  label: { type: 'string' },
  value: { type: 'number' },
  display: { type: 'string' },
  kind: { type: 'string' },
})
/** Preserve direct strike structure without cloning, retaining, or modifying VNodes. */
export function diffList(nodes: readonly VNode[]): DiffLineProps[] {
  const descriptions = numericList(nodes)
  return readerListItems(nodes).flatMap(
    (item, index) =>
      diffRewrite(
        flattenNodes(itemParts(item).head).map((node) => ({
          text: textOf([node]),
          struck: node.type === 'del' || node.type === 's',
        })),
      ) ?? diffFromList(descriptions[index]!),
  )
}
