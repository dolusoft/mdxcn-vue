/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { normalizeClass } from 'vue'
import type { VNode } from 'vue'
import { childrenOf, flattenNodes, textOf } from './items.js'
import { parseTerminal } from '../core/terminal.js'

/** Omit VitePress fence controls while preserving highlighted code and indentation. */
export function terminalModel(
  text: string | null | undefined,
  nodes: readonly VNode[],
  prompt = '$',
) {
  const content = flattenNodes(nodes).flatMap((node) =>
    node.type === 'div' && /\blanguage-\S*/.test(normalizeClass(node.props?.class))
      ? childrenOf(node).filter((child) => child.type === 'pre')
      : [node],
  )
  return parseTerminal(text ?? textOf(content), prompt)
}
