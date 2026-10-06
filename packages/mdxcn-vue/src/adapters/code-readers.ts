/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { normalizeClass } from 'vue'
import type { VNode } from 'vue'
import { childrenOf, flattenNodes } from './items.js'

/** Direct hosts only; unwrap one VitePress fence and omit its controls. */
export function codeReaderNodes(nodes: readonly VNode[]): VNode[] {
  return flattenNodes(nodes).flatMap((node) =>
    node.type === 'div' && /(?:^|\s)language-\S*/.test(normalizeClass(node.props?.class))
      ? childrenOf(node)
          .filter((child) => child.type === 'pre')
          .map((pre) => ({
            ...pre,
            props: {
              ...pre.props,
              'data-mdxcn-language':
                node.props?.['data-mdxcn-language'] ??
                normalizeClass(node.props?.class).match(/(?:^|\s)language-(\S+)/)?.[1],
            },
          }))
      : [node],
  )
}

export function codeLanguage(pre?: VNode): string | undefined {
  const code = pre && childrenOf(pre).find((node) => node.type === 'code')
  return (
    pre?.props?.['data-mdxcn-language'] ??
    normalizeClass(code?.props?.class).match(/(?:^|\s)language-(\S+)/)?.[1]
  )
}

export function readerListItems(nodes: readonly VNode[]): VNode[] {
  const elements = flattenNodes(nodes)
  const lists = elements.filter((node) => node.type === 'ol' || node.type === 'ul')
  return (lists.length ? lists.flatMap(childrenOf) : elements).filter((node) => node.type === 'li')
}
