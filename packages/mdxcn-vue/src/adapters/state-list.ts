/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { h } from 'vue'
import type { VNode } from 'vue'
import { childrenOf, flattenNodes, textOf } from './items.js'
import { readerListItems } from './code-readers.js'
import { readProse } from './stack.js'
import type { ProseNode } from '../core/model.js'
import type { StateListItem } from '../core/state-list.js'
import { renderProse } from '../components/graph-frame.js'

/** Walk hosts only. Custom Vue components are opaque, as in the other adapters. */
export function hasStateHost(nodes: readonly VNode[], tags: readonly string[]): boolean {
  return flattenNodes(nodes).some(
    (node) =>
      typeof node.type === 'string' &&
      (tags.includes(node.type) || hasStateHost(childrenOf(node), tags)),
  )
}
export function stateList(nodes: readonly VNode[]) {
  return readerListItems(nodes).map((item) => {
    const children = childrenOf(item)
    const paragraphs = children.filter((node) => node.type === 'p')
    const description: StateListItem = {
      text: textOf(children.filter((node) => node.type !== 'ol' && node.type !== 'ul'))
        .replace(/\s+/g, ' ')
        .trim(),
      paragraphs: paragraphs.map((node) => readProse(childrenOf(node))),
      strong: hasStateHost(children, ['strong', 'b']),
      em: hasStateHost(children, ['em', 'i']),
    }
    return { description, paragraphs }
  })
}
export function proseParagraphs(paragraphs: readonly ProseNode[][]): VNode[] {
  return paragraphs.map((nodes) => h('p', renderProse(nodes)))
}
