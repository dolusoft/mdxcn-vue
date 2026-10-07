import { Text, normalizeClass } from 'vue'
import type { VNode } from 'vue'
import { childItems, childrenOf, defineItem, flattenNodes, textOf } from './items.js'
import { readerListItems } from './code-readers.js'
import { hasStateHost } from './state-list.js'
import { barsFromList, seriesOf } from '../core/series.js'
import type { SeriesProps, SeriesListItem, BarSeries } from '../core/series.js'
import { kpiOf } from '../core/kpi.js'
import { numbers } from '../core/markdown.js'

export const Series = /* @__PURE__ */ defineItem<SeriesProps>('Series', {
  label: { type: 'string' },
  // Preserve both numeric arrays and run strings for the shared numbers reader.
  values: { type: 'node' },
  size: { type: 'string' },
})
// Compiled templates drop the whitespace between blocks; MDX keeps it. Pad every block.
const BLOCK = /^(?:p|li|ul|ol|blockquote|h[1-6]|tr|td|th|div|pre)$/
// `lines` is for KPI, which splits on newlines: MDX keeps one at every block and `br` boundary.
export function visibleText(nodes: readonly VNode[], source = false, lines = false): string {
  return flattenNodes(nodes)
    .map((node) => {
      if (node.type === Text) return textOf([node])
      if (typeof node.type !== 'string') return ''
      if (
        node.type === 'a' &&
        /(?:^|\s)header-anchor(?:\s|$)/.test(normalizeClass(node.props?.class))
      )
        return ''
      const inner = visibleText(childrenOf(node), source, lines)
      if (source && ['strong', 'b', 'em', 'i', 'del', 's'].includes(node.type)) {
        const mark = ['strong', 'b'].includes(node.type)
          ? '**'
          : ['em', 'i'].includes(node.type)
            ? '*'
            : '~~'
        return `${mark}${inner}${mark}`
      }
      if (node.type === 'br') return source || lines ? `${inner}\n` : ' '
      if (!BLOCK.test(node.type)) return inner
      return source ? `${inner}\n` : lines ? `\n${inner}\n` : ` ${inner} `
    })
    .join('')
}
export function seriesList(nodes: readonly VNode[]): SeriesListItem[] {
  return readerListItems(nodes).map((item) => {
    const children = childrenOf(item)
    return {
      text: visibleText(children.filter((n) => n.type !== 'ul' && n.type !== 'ol'))
        .replace(/\s+/g, ' ')
        .trim(),
      strong: hasStateHost(children, ['strong', 'b']),
    }
  })
}
export function sparkModel(nodes: readonly VNode[]) {
  return seriesOf(seriesList(nodes), visibleText(nodes, true))
}
export function barsModel(nodes: readonly VNode[]): BarSeries[] {
  const listed = barsFromList(seriesList(nodes))
  return listed.length
    ? listed
    : childItems(nodes, Series).map((item) => ({
        label: item.props.label as string,
        values: numbers((item.props.values ?? visibleText(item.children)) as SeriesProps['values']),
        size: item.props.size as SeriesProps['size'],
      }))
}

/** Direct paragraphs break visible lines; source emphasis is not part of KPI values. */
export function kpiModel(nodes: readonly VNode[]) {
  const lines = (input: readonly VNode[]): string[] => {
    const paragraphs = flattenNodes(input).filter((node) => node.type === 'p')
    return paragraphs.length
      ? paragraphs.flatMap((node) => lines(childrenOf(node)))
      : visibleText(input, false, true)
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
  }
  return kpiOf(lines(nodes))
}
