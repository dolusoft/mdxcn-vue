/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { ProseNode } from './model.js'
import { proseText, sliceProse } from './model.js'
import { splitLabel } from './stack.js'
import { splitDash } from './markdown.js'
import type { StateListItem, StepState } from './state-list.js'

export type TimelineState = StepState
const has = (nodes: readonly ProseNode[], types: readonly string[]): boolean =>
  nodes.some(
    (node) => node.type !== 'text' && (types.includes(node.type) || has(node.children, types)),
  )
function parts(item: StateListItem) {
  return {
    head: item.head ?? item.paragraphs[0] ?? [{ type: 'text' as const, value: item.text }],
    body: item.body ?? item.paragraphs.slice(1),
  }
}
export function timelineFromList(item: StateListItem) {
  const { head, body } = parts(item)
  const { label: date, rest } = splitLabel(proseText(head).replace(/\s+/g, ' ').trim())
  const { label, rest: aside } = splitDash(rest || date)
  const now = has(head, ['strong'])
  const next = !now && has(head, ['em'])
  return {
    date,
    label,
    note: body.length ? body : aside || undefined,
    state: (now ? 'now' : next ? 'next' : 'done') as TimelineState,
  }
}
export function specFromList(item: StateListItem) {
  const { head, body } = parts(item)
  const raw = proseText(head)
  const { label, rest: value } = splitLabel(raw.replace(/\s+/g, ' ').trim())
  const match = raw.match(/^\s*[^\n]+?:\s+/)
  return {
    label,
    value,
    rich: has(head, ['code', 'link'])
      ? sliceProse(head, match?.[0].length ?? 0, raw.length)
      : undefined,
    note: body.length ? body : undefined,
    accent: has(head, ['strong']),
  }
}
