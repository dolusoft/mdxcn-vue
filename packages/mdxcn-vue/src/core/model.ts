/** Framework-independent inline content shared by future Markdown adapters. */
export type ProseNode =
  | { type: 'text'; value: string }
  | { type: 'strong' | 'em' | 'code'; children: ProseNode[] }
  | {
      type: 'link'
      href: string
      title?: string
      target?: string
      rel?: string
      children: ProseNode[]
    }

export interface StackSegment {
  label?: string
  value: number | string
}

export interface StackRow {
  label: string
  segments?: StackSegment[]
  labelContent?: ProseNode[]
}

export interface SegmentRow {
  label: string
  value: number
}

export interface BarRow {
  label: string
  segments: SegmentRow[]
  labelContent?: ProseNode[]
}

export function proseText(nodes: readonly ProseNode[]): string {
  return nodes
    .map((node) => (node.type === 'text' ? node.value : proseText(node.children)))
    .join('')
}

/** Slice by text offsets while retaining inline nesting and link targets. */
export function sliceProse(nodes: readonly ProseNode[], start: number, end: number): ProseNode[] {
  let offset = 0
  return nodes.flatMap((node): ProseNode[] => {
    const length = node.type === 'text' ? node.value.length : proseText(node.children).length
    const from = Math.max(0, start - offset)
    const to = Math.min(length, end - offset)
    offset += length
    if (from >= to) return []
    return [
      node.type === 'text'
        ? { type: 'text', value: node.value.slice(from, to) }
        : { ...node, children: sliceProse(node.children, from, to) },
    ]
  })
}

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
