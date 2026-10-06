import type { VNode, Component } from 'vue'
import { childItems, defineItem, textOf } from './items.js'
import type { StatItem, SlopeItem, BulletItem } from '../core/stat-slope-bullet.js'

// Stat values remain text, including comma separators and unit suffixes.
export const Stat = defineItem<StatItem>('Stat', {
  value: { type: 'string' },
  label: { type: 'string' },
  hint: { type: 'string' },
  accent: { type: 'boolean' },
})
export const Slope = defineItem<SlopeItem>('Slope', {
  label: { type: 'string' },
  from: { type: 'number' },
  to: { type: 'number' },
})
export const Target = defineItem<BulletItem>('Target', {
  label: { type: 'string' },
  value: { type: 'number' },
  target: { type: 'number' },
  max: { type: 'number' },
  display: { type: 'string' },
})
/** Read marker props and children into models without retaining or cloning VNodes. */
export function metricItems<T extends { label?: string }>(
  nodes: readonly VNode[],
  marker: Component,
): T[] {
  return childItems(nodes, marker).map((item) => {
    const entry = {
      ...item.props,
      label: item.props.label == null ? textOf(item.children) : item.props.label,
    }
    return entry as T
  })
}
