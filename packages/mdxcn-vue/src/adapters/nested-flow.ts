/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { Text, normalizeClass } from 'vue'
import type { VNode, VNodeChild } from 'vue'
import { childItems, childrenOf, defineItem, flattenNodes, textOf } from './items.js'
import { hasStateHost } from './state-list.js'
import { readerListItems } from './code-readers.js'
import { nestedList, treesFromList, checksFromList, flowNodes } from '../core/nested-flow.js'
import type { TreeNode, CheckItem, FlowRow } from '../core/nested-flow.js'
import type { ProseNode } from '../core/model.js'

export interface NodeProps {
  label?: string
  meta?: string
  accent?: boolean
}
export interface PathProps {
  children?: VNodeChild
}
export const Node = /* @__PURE__ */ defineItem<NodeProps>('Node', {
  label: { type: 'string' },
  meta: { type: 'string' },
  accent: { type: 'boolean' },
})
export const Task = /* @__PURE__ */ defineItem<CheckItem>('Task', {
  label: { type: 'string' },
  done: { type: 'boolean' },
  note: { type: 'string' },
  items: { type: 'array' },
})
export const Path = /* @__PURE__ */ defineItem<PathProps>('Path', {})
const list = (node: VNode) => node.type === 'ul' || node.type === 'ol'
const permalink = (node: VNode) =>
  node.type === 'a' && /(?:^|\s)header-anchor(?:\s|$)/.test(normalizeClass(node.props?.class))
/** Read fresh model values without copying or mutating any VNode. */
function visibleText(nodes: readonly VNode[], spaceParagraphs = false): string {
  return flattenNodes(nodes)
    .filter((node) => !permalink(node))
    .map((node) =>
      node.type === Text
        ? textOf([node])
        : typeof node.type === 'string'
          ? node.type === 'p' && spaceParagraphs
            ? ` ${visibleText(childrenOf(node), spaceParagraphs)} `
            : visibleText(childrenOf(node), spaceParagraphs)
          : '',
    )
    .join('')
}
export function hostNestedList(nodes: readonly VNode[]) {
  return nestedList(flattenNodes(nodes), {
    tag: (node) => String(node.type),
    children: childrenOf,
    describe: (item) => {
      const children = childrenOf(item)
      return {
        text: visibleText(
          children.filter((node) => !list(node)),
          true,
        )
          .replace(/\s+/g, ' ')
          .trim(),
        // A strong descendant also accents its parent, matching upstream hasHost.
        strong: hasStateHost(children, ['strong', 'b']),
        // Only a direct checkbox counts; a checkbox in a loose paragraph does not.
        checked: !!children.find((node) => node.type === 'input' && node.props?.type === 'checkbox')
          ?.props?.checked,
      }
    },
  })
}
export function treeModel(nodes: readonly VNode[]): TreeNode[] {
  const listed = treesFromList(hostNestedList(nodes))
  return listed.length
    ? listed
    : childItems(nodes, Node).map((item) => {
        const children = treeModel(item.children)
        const props = item.props as unknown as NodeProps
        return {
          ...props,
          label: props.label ?? (children.length ? '' : visibleText(item.children)),
          children: children.length ? children : undefined,
        }
      })
}
export function checkModel(nodes: readonly VNode[]): CheckItem[] {
  const listed = checksFromList(hostNestedList(nodes))
  return listed.length
    ? listed
    : childItems(nodes, Task).map((item) => {
        const props = item.props as unknown as CheckItem
        return { ...props, label: props.label ?? visibleText(item.children) }
      })
}
function flowProse(nodes: readonly VNode[]): ProseNode[] {
  return flattenNodes(nodes).flatMap((node): ProseNode[] => {
    if (permalink(node)) return []
    if (node.type === Text) return [{ type: 'text', value: textOf([node]) }]
    if (typeof node.type !== 'string') return []
    const children = flowProse(childrenOf(node))
    if (['strong', 'b', 'em', 'i'].includes(node.type))
      return [{ type: ['strong', 'b'].includes(node.type) ? 'strong' : 'em', children }]
    return children
  })
}
export function flowModel(nodes: readonly VNode[]): FlowRow[] {
  const paths = childItems(nodes, Path)
  if (paths.length) return paths.map((path) => ({ nodes: flowNodes(flowProse(path.children)) }))
  const listed = readerListItems(nodes)
  if (listed.length)
    return listed.map((item) => ({ nodes: flowNodes(flowProse(childrenOf(item))) }))
  const paragraphs = flattenNodes(nodes).filter((node) => node.type === 'p')
  if (paragraphs.length)
    return paragraphs.map((p) => ({ nodes: flowNodes(flowProse(childrenOf(p))) }))
  const text = visibleText(nodes).trim()
  return text
    ? text.split(/\n+/).map((line) => ({ nodes: flowNodes([{ type: 'text', value: line }]) }))
    : []
}
