/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { ProseNode } from './model.js'
import { splitDash } from './markdown.js'

export interface ProseBlock {
  tag: 'inline' | 'p' | 'ul' | 'ol' | 'li' | 'blockquote'
  content?: ProseNode[]
  children?: ProseBlock[]
  start?: number
}
export interface FaqEntry<Rich = never> {
  question: string
  answer?: string | readonly ProseBlock[] | Rich
  accent?: boolean
}
export type BoardState = 'done' | 'now' | 'next'
export interface BoardItem {
  label: string
  note?: string
  state?: BoardState
}
export interface BoardColumn {
  title: string
  items: readonly (BoardItem | string)[]
}

/** Only direct headings begin sections; leading bodies and raw text are ignored. */
export function headingSections<Node>(
  nodes: readonly Node[],
  heading: (node: Node) => { title: string; accent: boolean } | undefined,
) {
  const sections: { title: string; accent: boolean; children: Node[] }[] = []
  for (const node of nodes) {
    const head = heading(node)
    if (head) sections.push({ ...head, children: [] })
    else sections.at(-1)?.children.push(node)
  }
  return sections
}

export function boardFromList(text: string, strong: boolean, em: boolean): BoardItem {
  const { label, rest } = splitDash(text)
  return { label, note: rest || undefined, state: strong ? 'now' : em ? 'next' : 'done' }
}
export function normalizeBoard(columns: readonly BoardColumn[]) {
  return columns.slice(0, 4).map((column) => ({
    title: column.title,
    items: column.items.map((item) => (typeof item === 'string' ? { label: item } : item)),
  }))
}
