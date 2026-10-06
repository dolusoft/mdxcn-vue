/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { VNode, VNodeChild } from 'vue'
import { childItems, defineItem, textOf } from './items.js'
import { stateList, hasStateHost } from './state-list.js'
import { dropText } from './chat.js'
import { splitLabel } from '../core/stack.js'
import { splitDash } from '../core/markdown.js'
import type { TimelineState } from '../core/timeline-spec.js'

export interface TimelineEvent {
  date: string
  label?: string
  state?: TimelineState
  note?: VNodeChild
}
export interface SpecRow {
  label: string
  value?: string
  accent?: boolean
  note?: VNodeChild
}
export interface SpecLine extends SpecRow {
  rich?: VNodeChild
}
export const Event = defineItem<TimelineEvent>('Event', {
  date: { type: 'string' },
  label: { type: 'string' },
  state: { type: 'string' },
  note: { type: 'node' },
})
export const Field = defineItem<SpecRow>('Field', {
  label: { type: 'string' },
  value: { type: 'string' },
  accent: { type: 'boolean' },
  note: { type: 'node' },
})
export function timelineModel(nodes: readonly VNode[]): TimelineEvent[] {
  const listed = stateList(nodes).map(({ head, body }) => {
    const { label: date, rest } = splitLabel(textOf(head).replace(/\s+/g, ' ').trim())
    const { label, rest: aside } = splitDash(rest || date)
    const now = hasStateHost(head, ['strong', 'b'])
    const next = !now && hasStateHost(head, ['em', 'i'])
    return {
      date,
      label,
      note: body.length ? body : aside || undefined,
      state: (now ? 'now' : next ? 'next' : 'done') as TimelineState,
    }
  })
  return listed.length
    ? listed
    : childItems(nodes, Event).map((item) => {
        const props = item.props as unknown as TimelineEvent
        return { ...props, label: props.label ?? textOf(item.children) }
      })
}
export function specModel(nodes: readonly VNode[]): SpecLine[] {
  const listed = stateList(nodes).map(({ head, body }) => {
    const raw = textOf(head)
    const { label, rest: value } = splitLabel(raw.replace(/\s+/g, ' ').trim())
    const rich = hasStateHost(head, ['code', 'a', 'del', 's'])
    return {
      label,
      value,
      rich: rich ? dropText(head, raw.match(/^\s*[^\n]+?:\s+/)?.[0].length ?? 0) : undefined,
      note: body.length ? body : undefined,
      accent: hasStateHost(head, ['strong', 'b']),
    }
  })
  return listed.length
    ? listed
    : childItems(nodes, Field).map((item) => {
        const props = item.props as unknown as SpecRow
        return { ...props, value: props.value ?? textOf(item.children) }
      })
}
