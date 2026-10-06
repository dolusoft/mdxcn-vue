/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { StateListItem } from '../core/state-list.js'
import type { Glyphs, GraphPalette } from '../core/motion.js'
import { clamp01, seriesDim, toneClass, trackMarks } from '../core/motion.js'
import { numberOf } from '../core/stack.js'
import type { GanttItem } from '../core/gantt-diff-waterfall.js'
import { ganttFromList, normalizeGantt } from '../core/gantt-diff-waterfall.js'
import { numericList } from '../adapters/numeric-list.js'
import { metricItems } from '../adapters/stat-slope-bullet.js'
import { Span } from '../adapters/gantt-diff-waterfall.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphTrack, GraphTick } from './graph-frame.js'
export interface GraphGanttProps {
  title: string
  items?: readonly GanttItem[] | null
  list?: readonly StateListItem[] | null
  ticks?: readonly string[]
  columns?: number | string
  stage?: string
  progress?: number
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphGantt = defineComponent({
  name: 'GraphGantt',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    items: Array as PropType<GraphGanttProps['items']>,
    list: Array as PropType<GraphGanttProps['list']>,
    ticks: Array as PropType<GraphGanttProps['ticks']>,
    columns: { type: [Number, String], default: 24 },
    stage: String,
    progress: Number,
    glyphs: [String, Array] as PropType<Glyphs>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const nodes = slots.default?.() ?? [],
        list = props.list ?? numericList(nodes)
      const rows = normalizeGantt(
        props.items ??
          (list.length || props.list != null
            ? list.map(ganttFromList)
            : metricItems<GanttItem>(nodes, Span)),
      )
      const columns = numberOf(props.columns, 24)
      const playhead =
        props.progress == null ? null : Math.round(clamp01(props.progress) * (columns - 1))
      const marks = trackMarks(props.glyphs)
      const axisClass = 'grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-x-2 sm:gap-x-4'
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-4' }, () => [
            playhead != null
              ? h('div', { class: axisClass }, [
                  h('span'),
                  h(GraphTrack, null, () =>
                    Array.from({ length: columns }, (_, index) =>
                      h(
                        GraphTick,
                        {
                          key: index,
                          class:
                            index === playhead
                              ? toneClass(props.palette, 'primary')
                              : 'text-transparent',
                        },
                        () => '▾',
                      ),
                    ),
                  ),
                ])
              : null,
            h(
              'ul',
              { class: 'flex flex-col gap-2', role: 'list' },
              rows.map((entry, rowIndex) => {
                const start = Math.round(clamp01(entry.start) * columns)
                const end = Math.max(start + 1, Math.round(clamp01(entry.end) * columns))
                const done = Math.round(clamp01(entry.complete ?? 1) * (end - start))
                const focused = props.stage ? entry.label === props.stage : Boolean(entry.accent)
                const dim = Boolean(props.stage) && !focused
                return withDirectives(
                  h(
                    'li',
                    {
                      key: entry.label,
                      'aria-label': `${entry.label} from ${Math.round(entry.start * 100)}% to ${Math.round(entry.end * 100)}%${entry.complete != null ? `, ${Math.round(entry.complete * 100)}% complete` : ''}`,
                      class:
                        'grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-center gap-x-2 sm:gap-x-4',
                      style: seriesDim(props.palette, !dim),
                    },
                    [
                      h(
                        'span',
                        {
                          class: [
                            'truncate',
                            focused ? toneClass(props.palette, 'primary') : 'text-foreground',
                          ],
                        },
                        entry.label,
                      ),
                      h(GraphTrack, null, () =>
                        Array.from({ length: columns }, (_, index) => {
                          const inBar = index >= start && index < end,
                            filled = inBar && index < start + done,
                            rest = inBar && !filled
                          return h(
                            GraphTick,
                            {
                              key: index,
                              class: filled
                                ? focused
                                  ? toneClass(props.palette, 'primary')
                                  : 'text-foreground'
                                : rest
                                  ? toneClass(props.palette, 'secondary')
                                  : toneClass(props.palette, 'empty'),
                            },
                            () => (filled ? marks.fill : rest ? marks.rest : marks.empty),
                          )
                        }),
                      ),
                    ],
                  ),
                  [[vReveal, { delay: Math.min(rowIndex, 5) * 50 }]],
                )
              }),
            ),
            props.ticks?.length
              ? h('div', { class: axisClass }, [
                  h('span'),
                  h(
                    'div',
                    { class: 'flex justify-between text-graph-muted' },
                    props.ticks.map((tick) => h('span', { key: tick }, tick)),
                  ),
                ])
              : null,
          ]),
      )
    }
  },
})
export { Span } from '../adapters/gantt-diff-waterfall.js'
