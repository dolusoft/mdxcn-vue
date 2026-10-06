/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { cloneVNode, createTextVNode, Text } from 'vue'
import type { VNode, VNodeChild } from 'vue'
import { childrenOf, textOf } from './items.js'
import { readerListItems } from './code-readers.js'
import { speakerPrefix } from '../core/chat-keys.js'
import { itemParts } from './state-list.js'

export interface ChatTurn {
  by: string
  children?: VNodeChild
  aside?: boolean
}
/** Drop text offsets while preserving host attributes and opaque component boundaries. */
export function dropText(nodes: readonly VNode[], count: number): VNode[] {
  let left = count
  const walk = (items: readonly VNode[]): VNode[] =>
    items.flatMap((node) => {
      if (node.type === Text) {
        const text = String(node.children ?? '')
        const rest = text.slice(left)
        left = Math.max(0, left - text.length)
        return rest ? [createTextVNode(rest)] : []
      }
      // Past the cut nothing changes; keep the original so its compiled patch flags stay valid.
      if (typeof node.type !== 'string' || left === 0) return [node]
      const before = textOf(childrenOf(node))
      const inner = walk(childrenOf(node))
      if (before !== '' && textOf(inner) === '') return []
      const clone = cloneVNode(node)
      clone.children = inner
      clone.shapeFlag = (clone.shapeFlag & ~8) | 16
      // The compiler's TEXT/block hints describe the original children shape.
      clone.patchFlag = 0
      Reflect.set(clone, 'dynamicChildren', null)
      return [clone]
    })
  return walk(nodes)
}
export function chatModel(nodes: readonly VNode[]): ChatTurn[] {
  return readerListItems(nodes).flatMap((item) => {
    const { head, body } = itemParts(item)
    const match = speakerPrefix(textOf(head))
    if (!match) return []
    const rest = dropText(head, match[0].length)
    const parts = rest.filter((node) => textOf([node]).trim() !== '')
    return [
      {
        by: (match[1] ?? '').trim(),
        children: [...rest, ...body],
        aside:
          body.length === 0 && parts.length === 1 && ['em', 'i'].includes(String(parts[0]?.type)),
      },
    ]
  })
}
