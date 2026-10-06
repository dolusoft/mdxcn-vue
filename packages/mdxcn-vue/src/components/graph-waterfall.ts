/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { StateListItem } from '../core/state-list.js'
import type { Glyphs, GraphPalette } from '../core/motion.js'
import { toneClass, trackMarks } from '../core/motion.js'
import { numberOf } from '../core/stack.js'
import type { WaterfallItem } from '../core/gantt-diff-waterfall.js'
import {
  waterfallFromList,
  normalizeWaterfall,
  waterfallSegments,
  formatWaterfall,
} from '../core/gantt-diff-waterfall.js'
import { numericList } from '../adapters/numeric-list.js'
import { metricItems } from '../adapters/stat-slope-bullet.js'
import { Delta } from '../adapters/gantt-diff-waterfall.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphTrack, GraphTick, GraphRule } from './graph-frame.js'
export interface GraphWaterfallProps {
  title: string
  items?: readonly WaterfallItem[] | null
  list?: readonly StateListItem[] | null
  ticks?: number | string
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphWaterfall = defineComponent({
  name: 'GraphWaterfall',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    items: Array as PropType<GraphWaterfallProps['items']>,
    list: Array as PropType<GraphWaterfallProps['list']>,
    ticks: { type: [Number, String], default: 24 },
    glyphs: [String, Array] as PropType<Glyphs>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const nodes = slots.default?.() ?? [],
        list = props.list ?? numericList(nodes)
      const segments = waterfallSegments(
        normalizeWaterfall(
          props.items ??
            (list.length || props.list != null
              ? list.map(waterfallFromList)
              : metricItems<WaterfallItem>(nodes, Delta)),
        ),
      )
      const low = Math.min(0, ...segments.map((s) => Math.min(s.from, s.to)))
      const high = Math.max(1, ...segments.map((s) => Math.max(s.from, s.to)))
      const ticks = numberOf(props.ticks, 24),
        marks = trackMarks(props.glyphs)
      const column = (value: number) => Math.round(((value - low) / (high - low || 1)) * ticks)
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-3' }, () => [
            h(
              'ul',
              { class: 'flex w-full flex-col gap-2', role: 'list' },
              segments.map((segment, index) => {
                const start = Math.min(column(segment.from), column(segment.to))
                const end = Math.max(column(segment.from), column(segment.to), start + 1)
                return h('li', { key: segment.label, class: 'flex flex-col gap-2' }, [
                  segment.kind === 'end' && index > 0 ? h(GraphRule) : null,
                  withDirectives(
                    h(
                      'div',
                      {
                        class:
                          'grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)_minmax(0,5.5rem)] items-center gap-x-2 sm:gap-x-4',
                      },
                      [
                        h('span', { class: 'truncate text-foreground' }, segment.label),
                        h(GraphTrack, null, () =>
                          Array.from({ length: ticks }, (_, cell) => {
                            const filled = cell >= start && cell < end
                            const tone = !filled
                              ? toneClass(props.palette, 'empty')
                              : segment.kind === 'out'
                                ? toneClass(props.palette, 'secondary')
                                : segment.kind === 'start'
                                  ? 'text-foreground'
                                  : toneClass(props.palette, 'primary')
                            return h(GraphTick, { key: cell, class: tone }, () =>
                              filled ? marks.fill : marks.empty,
                            )
                          }),
                        ),
                        h(
                          'span',
                          {
                            class: [
                              'text-right tabular-nums',
                              segment.kind === 'out'
                                ? toneClass(props.palette, 'secondary')
                                : segment.kind === 'end'
                                  ? toneClass(props.palette, 'primary')
                                  : 'text-foreground',
                            ],
                          },
                          formatWaterfall(segment, segment.kind),
                        ),
                      ],
                    ),
                    [[vReveal, { delay: Math.min(index, 5) * 50 }]],
                  ),
                ])
              }),
            ),
            h(
              'span',
              { class: 'sr-only' },
              segments.map((s) => `${s.label} ${formatWaterfall(s, s.kind)}`).join(', '),
            ),
          ]),
      )
    }
  },
})
export { Delta } from '../adapters/gantt-diff-waterfall.js'
