/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { ProseNode } from './model.js'
import { proseText } from './model.js'
import { splitDash } from './markdown.js'

export interface TreeNode {
  label: string
  meta?: string
  accent?: boolean
  children?: readonly TreeNode[]
}
export interface CheckItem {
  label?: string
  done?: boolean
  note?: string
  items?: readonly CheckItem[]
}
export type FlowTone = 'default' | 'accent' | 'muted'
export interface FlowNode {
  label: string
  tone?: FlowTone
  stretch?: boolean
}
export interface FlowRow {
  nodes: readonly FlowNode[]
}
export interface NestedListItem {
  text: string
  strong: boolean
  checked: boolean
  children: NestedListItem[]
}
/** Both adapters supply direct hosts; all recursion and list precedence live here. */
export function nestedList<Node>(
  nodes: readonly Node[],
  reader: {
    tag: (node: Node) => string
    children: (node: Node) => readonly Node[]
    describe: (item: Node) => Omit<NestedListItem, 'children'>
  },
): NestedListItem[] {
  const lists = nodes.filter((node) => ['ul', 'ol'].includes(reader.tag(node)))
  return (lists.length ? lists.flatMap((node) => [...reader.children(node)]) : nodes)
    .filter((node) => reader.tag(node) === 'li')
    .map((item) => ({
      ...reader.describe(item),
      children: nestedList(reader.children(item), reader),
    }))
}
export function treesFromList(items: readonly NestedListItem[]): TreeNode[] {
  return items.map((item) => {
    const [name, extra] = item.text.split(/\s+[—–]\s+/)
    const children = treesFromList(item.children)
    return {
      label: name || item.text,
      meta: extra,
      accent: item.strong,
      children: children.length ? children : undefined,
    }
  })
}
export function checksFromList(items: readonly NestedListItem[]): CheckItem[] {
  return items.map((item) => {
    const done = /^\s*\[x\]/i.test(item.text) || item.checked
    const { label, rest } = splitDash(item.text.replace(/^\s*\[[xX ]\]\s*/, ''))
    const children = checksFromList(item.children)
    return { label, done, note: rest || undefined, items: children.length ? children : undefined }
  })
}
export function flattenTree(
  nodes: readonly TreeNode[],
  prefix = '',
  trail = 'root',
  isRoot = true,
) {
  const singleRoot = isRoot && nodes.length === 1
  const rows: { key: string; branch: string; label: string; meta?: string; accent?: boolean }[] = []
  nodes.forEach((node, index) => {
    const last = index === nodes.length - 1
    const key = `${trail}/${node.label}-${index}`
    rows.push({
      key,
      branch: singleRoot ? '' : prefix + (last ? '└─ ' : '├─ '),
      label: node.label,
      meta: node.meta,
      accent: node.accent,
    })
    rows.push(
      ...flattenTree(
        node.children ?? [],
        singleRoot ? '' : prefix + (last ? '   ' : '│  '),
        key,
        false,
      ),
    )
  })
  return rows
}
export function flattenChecks(items: readonly CheckItem[]): CheckItem[] {
  return items.flatMap((item) => [item, ...flattenChecks(item.items ?? [])])
}
/** Upstream splits each text node separately; inline emphasis is a whole node. */
export function flowNodes(nodes: readonly ProseNode[]): FlowNode[] {
  return nodes.flatMap((node): FlowNode[] => {
    if (node.type === 'text')
      return node.value
        .split(/\s*(?:→|->|—>|=>)\s*/)
        .map((label) => label.trim())
        .filter(Boolean)
        .map((label) => ({ label }))
    if (node.type === 'strong' || node.type === 'em')
      return [
        {
          label: proseText(node.children).trim(),
          tone: node.type === 'strong' ? 'accent' : 'muted',
        },
      ]
    return flowNodes(node.children)
  })
}
