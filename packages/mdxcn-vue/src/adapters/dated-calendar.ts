import type { VNode } from 'vue'
import { childrenOf } from './items.js'
import { readerListItems } from './code-readers.js'
import { gridFractionText } from './grid-fraction.js'
import { visibleText } from './series.js'
import { hasStateHost } from './state-list.js'
import { activityDays, calendarMark } from '../core/dated-calendar.js'
const itemContent = (node: VNode) =>
  childrenOf(node).filter((child) => child.type !== 'ul' && child.type !== 'ol')
export function activityModel(nodes: readonly VNode[]) {
  return activityDays(
    readerListItems(nodes).map((node) => visibleText(itemContent(node), true).trim()),
    visibleText(nodes, true),
  )
}
export function calendarModel(nodes: readonly VNode[]) {
  return readerListItems(nodes).flatMap((node) =>
    calendarMark(
      gridFractionText(itemContent(node)).replace(/\s+/g, ' ').trim(),
      hasStateHost(childrenOf(node), ['strong', 'b']),
    ),
  )
}
