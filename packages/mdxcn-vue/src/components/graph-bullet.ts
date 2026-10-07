/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { StateListItem } from '../core/state-list.js'
import type { Glyphs, GraphPalette } from '../core/motion.js'
import { toneClass, trackMarks } from '../core/motion.js'
import { numberOf } from '../core/stack.js'
import type { BulletItem } from '../core/stat-slope-bullet.js'
import { bulletFromList, normalizeBullet, formatBullet } from '../core/stat-slope-bullet.js'
import { metricItems, Target } from '../adapters/stat-slope-bullet.js'
import { numericList } from '../adapters/numeric-list.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphTrack, GraphTick } from './graph-frame.js'
export interface GraphBulletProps {
  title: string
  items?: readonly BulletItem[] | null
  list?: readonly StateListItem[] | null
  ticks?: number | string
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphBullet = /* @__PURE__ */ defineComponent({
  name: 'GraphBullet',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    items: Array as PropType<GraphBulletProps['items']>,
    list: Array as PropType<GraphBulletProps['list']>,
    ticks: { type: [Number, String], default: 20 },
    glyphs: [String, Array] as PropType<Glyphs>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const nodes = slots.default?.() ?? []
      const list = props.list ?? numericList(nodes)
      const rows = normalizeBullet(
        props.items ??
          (list.length || props.list != null
            ? list.map(bulletFromList)
            : metricItems<BulletItem>(nodes, Target)),
      )
      const ticks = numberOf(props.ticks, 20)
      const marks = trackMarks(props.glyphs, { empty: '-', rest: '=', fill: '=' })
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-3' }, () =>
            h(
              'ul',
              { class: 'flex w-full flex-col gap-2', role: 'list' },
              rows.map((entry, index) => {
                const peak = entry.max ?? Math.max(entry.value, entry.target ?? 0, 1)
                const filled = Math.min(
                  ticks,
                  Math.round((Math.max(entry.value, 0) / peak) * ticks),
                )
                const mark =
                  entry.target == null
                    ? null
                    : Math.min(
                        ticks - 1,
                        Math.max(0, Math.round((Math.max(entry.target, 0) / peak) * ticks)),
                      )
                const bracket = (text: string) =>
                  h('span', { 'aria-hidden': 'true', class: 'text-graph-frame' }, text)
                return withDirectives(
                  h(
                    'li',
                    {
                      key: entry.label,
                      'aria-label': `${entry.label} ${formatBullet(entry)}`,
                      class:
                        'grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)_minmax(0,7rem)] items-center gap-x-2 sm:gap-x-4',
                    },
                    [
                      h('span', { class: 'truncate text-foreground' }, entry.label),
                      h('span', { class: 'flex min-w-0 items-center' }, [
                        bracket('['),
                        h(GraphTrack, null, () =>
                          Array.from({ length: ticks }, (_, cell) => {
                            const isMark = mark != null && cell === mark,
                              isFill = cell < filled
                            return h(
                              GraphTick,
                              {
                                key: cell,
                                class: isMark
                                  ? toneClass(props.palette, 'secondary')
                                  : isFill
                                    ? toneClass(
                                        props.palette,
                                        mark != null && cell > mark ? 'secondary' : 'primary',
                                      )
                                    : 'text-graph-frame',
                              },
                              () => (isMark ? '|' : isFill ? marks.fill : marks.empty),
                            )
                          }),
                        ),
                        bracket(']'),
                      ]),
                      h(
                        'span',
                        { class: 'text-right text-graph-muted tabular-nums' },
                        formatBullet(entry),
                      ),
                    ],
                  ),
                  [[vReveal, { delay: Math.min(index, 5) * 50 }]],
                )
              }),
            ),
          ),
      )
    }
  },
})
export { Target } from '../adapters/stat-slope-bullet.js'
