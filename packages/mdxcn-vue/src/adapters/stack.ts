import type { VNode } from 'vue'
import { Text } from 'vue'
import type { BarRow, ProseNode } from '../core/model'
import { proseText, sliceProse } from '../core/model'
import { numberOf, splitLabel, segmentsFromText, resolveStackRows } from '../core/stack'
import type { StackRow } from '../core/model'
import { childItems, childrenOf, defineItem, flattenNodes, textOf } from './items'

/** Collapse whitespace across inline boundaries, retaining the original nesting. */
export function normalizeProseWhitespace(nodes: readonly ProseNode[]): ProseNode[] {
  let inWhitespace = true
  const visit = (items: readonly ProseNode[]): ProseNode[] =>
    items.map((node) => {
      if (node.type !== 'text') return { ...node, children: visit(node.children) }
      let value = ''
      for (const character of node.value) {
        const whitespace = /\s/.test(character)
        if (!whitespace || !inWhitespace) value += whitespace ? ' ' : character
        inWhitespace = whitespace
      }
      return { type: 'text', value }
    })
  const normalized = visit(nodes)
  return sliceProse(normalized, 0, proseText(normalized).trimEnd().length)
}

export interface BarProps {
  label?: string
  segments?: StackRow['segments']
}
export interface SegmentProps {
  label?: string
  value?: number | string
}

export const Bar = defineItem<BarProps>('Bar', {
  label: { type: 'string', default: '' },
  segments: { type: 'array' },
})
export const Segment = defineItem<SegmentProps>('Segment', {
  label: { type: 'string' },
  value: { type: 'number', default: 0 },
})

/** Preserve supported inline markup, unwrap other host tags, and skip executable content. */
export function readProse(nodes: readonly VNode[]): ProseNode[] {
  return flattenNodes(nodes).flatMap((node): ProseNode[] => {
    if (node.type === Text) return [{ type: 'text', value: String(node.children ?? '') }]
    if (typeof node.type !== 'string') return []
    if (node.type === 'script' || node.type === 'style') return []
    if (node.type === 'img') return [{ type: 'text', value: String(node.props?.alt ?? '') }]
    const children =
      typeof node.children === 'string'
        ? [{ type: 'text' as const, value: node.children }]
        : readProse(childrenOf(node))
    if (node.type === 'a') return [{ type: 'link', href: String(node.props?.href ?? ''), children }]
    if (node.type === 'b') return [{ type: 'strong', children }]
    if (node.type === 'strong' || node.type === 'em' || node.type === 'code')
      return [{ type: node.type, children }]
    return children
  })
}

/** Only direct ul > li (with optional paragraph/inline hosts) is accepted. */
export function readStackList(nodes: readonly VNode[]): BarRow[] {
  return flattenNodes(nodes)
    .filter((node) => node.type === 'ul')
    .flatMap((list) =>
      childrenOf(list)
        .filter((node) => node.type === 'li')
        .map((item) => {
          const prose =
            typeof item.children === 'string'
              ? [{ type: 'text' as const, value: item.children }]
              : readProse(childrenOf(item))
          const normalized = normalizeProseWhitespace(prose)
          const text = proseText(normalized)
          const { label, rest } = splitLabel(text)
          const start = text.indexOf(label)
          const labelContent = sliceProse(normalized, start, start + label.length)
          return {
            label,
            ...(labelContent.some((node) => node.type !== 'text') ? { labelContent } : {}),
            segments: segmentsFromText(rest),
          }
        }),
    )
}

export function readStackItems(nodes: readonly VNode[]): BarRow[] {
  return childItems(nodes, Bar).map((row) => ({
    label: String(row.props.label ?? ''),
    segments: Array.isArray(row.props.segments)
      ? (row.props.segments as NonNullable<StackRow['segments']>).map((segment) => ({
          label: segment.label ?? '',
          value: numberOf(segment.value),
        }))
      : childItems(row.children, Segment).map((segment) => ({
          label:
            segment.props.label == null ? textOf(segment.children) : String(segment.props.label),
          value: numberOf(segment.props.value as number | string | undefined),
        })),
  }))
}

/** Call during render so parent slot updates are always observed. */
export function stackModel(
  rows: readonly StackRow[] | null | undefined,
  nodes: readonly VNode[],
): BarRow[] {
  return resolveStackRows(rows, readStackList(nodes), readStackItems(nodes))
}
