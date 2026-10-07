/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { Fragment, h } from 'vue'
import type { VNode } from 'vue'
import type { BoardColumn, FaqEntry, ProseBlock } from '../core/sections.js'
import { boardFromList, headingSections } from '../core/sections.js'
import { childrenOf, flattenNodes, textOf } from './items.js'
import { hasStateHost } from './state-list.js'
import { readerListItems } from './code-readers.js'
import { renderProse } from '../components/graph-frame.js'

function hostSections(nodes: readonly VNode[]) {
  return headingSections(
    flattenNodes(nodes).filter((node) => typeof node.type !== 'symbol'),
    (node) =>
      /^h[1-6]$/.test(String(node.type))
        ? {
            title: textOf(childrenOf(node)).trim(),
            accent: hasStateHost(childrenOf(node), ['strong', 'b']),
          }
        : undefined,
  )
}
export function faqEntries(nodes: readonly VNode[]): FaqEntry<readonly VNode[]>[] {
  return hostSections(nodes).map((section) => ({
    question: section.title,
    accent: section.accent,
    answer: section.children.length ? section.children : undefined,
  }))
}
export function boardColumns(nodes: readonly VNode[]): BoardColumn[] {
  return hostSections(nodes).map((section) => ({
    title: section.title,
    items: readerListItems(section.children).map((item) => {
      const children = childrenOf(item)
      return boardFromList(
        textOf(children.filter((node) => node.type !== 'ul' && node.type !== 'ol'))
          .replace(/\s+/g, ' ')
          .trim(),
        hasStateHost(children, ['strong', 'b']),
        hasStateHost(children, ['em', 'i']),
      )
    }),
  }))
}
export function renderBlocks(blocks: readonly ProseBlock[]): VNode[] {
  return blocks.map((block) => {
    const children = block.content ? renderProse(block.content) : renderBlocks(block.children ?? [])
    return block.tag === 'inline'
      ? h(Fragment, children)
      : h(block.tag, block.start === undefined ? {} : { start: block.start }, children)
  })
}
export function faqAnswer(answer: FaqEntry<VNode | readonly VNode[]>['answer']) {
  if (Array.isArray(answer) && answer[0] && 'tag' in answer[0])
    return renderBlocks(answer as ProseBlock[])
  return answer
}
