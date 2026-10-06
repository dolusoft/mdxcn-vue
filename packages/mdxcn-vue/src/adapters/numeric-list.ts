import type { VNode } from 'vue'
import { childItems, defineItem, textOf, childrenOf } from './items.js'
import { readerListItems } from './code-readers.js'
import { hasStateHost } from './state-list.js'
import type { StateListItem } from '../core/state-list.js'
import type { RankItem, FunnelStep } from '../core/numeric-list.js'
export const Rank = defineItem<RankItem>('Rank', {
  label: { type: 'string' },
  value: { type: 'number' },
  display: { type: 'string' },
})
export const Stage = defineItem<FunnelStep>('Stage', {
  label: { type: 'string' },
  value: { type: 'number' },
  display: { type: 'string' },
})
/** Read into plain models without cloning compiled template VNodes. */
export function numericList(nodes: readonly VNode[]): StateListItem[] {
  return readerListItems(nodes).map((item) => {
    const children = childrenOf(item)
    return {
      text: textOf(children.filter((node) => node.type !== 'ul' && node.type !== 'ol'))
        .replace(/\s+/g, ' ')
        .trim(),
      paragraphs: [],
      strong: hasStateHost(children, ['strong', 'b']),
      em: false,
    }
  })
}
export function numericItems(nodes: readonly VNode[], marker: typeof Rank): RankItem[] {
  return childItems(nodes, marker).map((item) => ({
    label: item.props.label == null ? textOf(item.children) : String(item.props.label),
    value: item.props.value as number | string,
    display: item.props.display as string | undefined,
  }))
}
