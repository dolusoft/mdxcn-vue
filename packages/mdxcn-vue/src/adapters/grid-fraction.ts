import { Text, normalizeClass } from 'vue'
import type { VNode } from 'vue'
import { childItems, childrenOf, defineItem, flattenNodes } from './items.js'
import { readerListItems } from './code-readers.js'
import { fractionOf, gridCellsOf, gridsFromList } from '../core/grid-fraction.js'
import type { CellGrid, GridProps } from '../core/grid-fraction.js'

export const Grid = /* @__PURE__ */ defineItem<GridProps>('Grid', {
  label: { type: 'string' },
  cells: { type: 'array' },
})
// Compiled templates drop the whitespace between blocks; MDX keeps a newline there.
const BLOCK = /^(?:p|li|ul|ol|blockquote|h[1-6]|tr|td|th|table|thead|tbody|div|pre)$/
/** Host text only; fragments are transparent and permalink labels are excluded. */
export function gridFractionText(nodes: readonly VNode[]): string {
  return flattenNodes(nodes)
    .map((node) => {
      if (node.type === Text) return String(node.children ?? '')
      if (typeof node.type !== 'string') return ''
      if (
        node.type === 'a' &&
        /(?:^|\s)header-anchor(?:\s|$)/.test(normalizeClass(node.props?.class))
      )
        return ''
      const inner = gridFractionText(childrenOf(node))
      if (node.type === 'br') return `${inner}\n`
      return BLOCK.test(node.type) ? `\n${inner}\n` : inner
    })
    .join('')
}
function linesOf(nodes: readonly VNode[]): string[] {
  const paragraphs = flattenNodes(nodes).filter((node) => node.type === 'p')
  return paragraphs.length
    ? paragraphs.flatMap((node) => linesOf(childrenOf(node)))
    : gridFractionText(nodes)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
}
export function cellsModel(nodes: readonly VNode[]): CellGrid[] {
  const listed = gridsFromList(
    readerListItems(nodes).map((node) =>
      gridFractionText(
        childrenOf(node).filter((child) => child.type !== 'ul' && child.type !== 'ol'),
      )
        .replace(/\s+/g, ' ')
        .trim(),
    ),
  )
  return listed.length
    ? listed
    : childItems(nodes, Grid).map((item) => ({
        label: item.props.label as string,
        cells:
          (item.props.cells as GridProps['cells']) ??
          gridCellsOf(
            gridFractionText(item.children),
            flattenNodes(item.children)
              .filter((node) => typeof node.type === 'string')
              .map((node) => gridFractionText([node])),
            linesOf(item.children),
          ),
      }))
}
export function fractionModel(nodes: readonly VNode[]) {
  return fractionOf(gridFractionText(nodes))
}
