/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { StateListItem } from '../core/state-list.js'
import type { GraphPalette } from '../core/motion.js'
import { toneClass } from '../core/motion.js'
import type { SlopeItem } from '../core/stat-slope-bullet.js'
import { slopeFromList, normalizeSlope, formatNumber } from '../core/stat-slope-bullet.js'
import { metricItems, Slope } from '../adapters/stat-slope-bullet.js'
import { numericList } from '../adapters/numeric-list.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody } from './graph-frame.js'
export interface GraphSlopeProps {
  title: string
  fromLabel: string
  toLabel: string
  items?: readonly SlopeItem[] | null
  list?: readonly StateListItem[] | null
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphSlope = defineComponent({
  name: 'GraphSlope',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    fromLabel: { type: String, required: true },
    toLabel: { type: String, required: true },
    items: Array as PropType<GraphSlopeProps['items']>,
    list: Array as PropType<GraphSlopeProps['list']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const nodes = slots.default?.() ?? []
      const list = props.list ?? numericList(nodes)
      const rows = normalizeSlope(
        props.items ??
          (list.length || props.list != null
            ? list.map(slopeFromList)
            : metricItems<SlopeItem>(nodes, Slope)),
      )
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-3' }, () => [
            h(
              'div',
              { class: 'grid grid-cols-[minmax(0,1fr)_6.5rem_2rem_6.5rem] items-end gap-x-3' },
              [
                h('span'),
                h('span', { class: 'text-right text-graph-muted' }, props.fromLabel),
                h('span'),
                h('span', { class: 'text-right text-graph-muted' }, props.toLabel),
              ],
            ),
            h(
              'ul',
              { class: 'flex flex-col gap-2', role: 'list' },
              rows.map((row, index) => {
                const up = row.to > row.from,
                  down = row.to < row.from
                const tone = toneClass(props.palette, up ? 'primary' : down ? 'secondary' : 'empty')
                return withDirectives(
                  h(
                    'li',
                    {
                      key: row.label,
                      'aria-label': `${row.label} from ${formatNumber(row.from)} to ${formatNumber(row.to)}`,
                      class:
                        'grid grid-cols-[minmax(0,1fr)_6.5rem_2rem_6.5rem] items-baseline gap-x-3',
                    },
                    [
                      h('span', { class: 'truncate text-foreground' }, row.label),
                      h(
                        'span',
                        { class: 'text-right text-graph-muted tabular-nums' },
                        formatNumber(row.from),
                      ),
                      h(
                        'span',
                        { 'aria-hidden': 'true', class: ['text-center select-none', tone] },
                        up || down ? '→' : '–',
                      ),
                      h(
                        'span',
                        {
                          class: ['text-right tabular-nums', up || down ? tone : 'text-foreground'],
                        },
                        formatNumber(row.to),
                      ),
                    ],
                  ),
                  [[vReveal, { delay: Math.min(index, 5) * 50 }]],
                )
              }),
            ),
          ]),
      )
    }
  },
})
export { Slope } from '../adapters/stat-slope-bullet.js'
