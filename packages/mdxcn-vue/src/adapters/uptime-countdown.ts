import type { VNode } from 'vue'
import { visibleText } from './series.js'
import { uptimeDays, countdownWritten } from '../core/uptime-countdown.js'
export function uptimeModel(nodes: readonly VNode[]) {
  return uptimeDays(visibleText(nodes, true))
}
export function countdownModel(nodes: readonly VNode[]) {
  return countdownWritten(visibleText(nodes))
}
