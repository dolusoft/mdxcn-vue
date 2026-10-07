/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import { uptimeDays } from '../core/uptime-countdown.js'
import type { UptimeStatus } from '../core/uptime-countdown.js'
import { resolveGlyphs, toneClass } from '../core/motion.js'
import type { Glyphs, GraphPalette } from '../core/motion.js'
import { uptimeModel } from '../adapters/uptime-countdown.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphTick, GraphTrack } from './graph-frame.js'
export interface GraphUptimeProps {
  title: string
  days?: readonly UptimeStatus[] | string | null
  from?: string
  to?: string
  columns?: number | string
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphUptime = defineComponent({
  name: 'GraphUptime',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    days: [Array, String] as PropType<GraphUptimeProps['days']>,
    from: String,
    to: String,
    columns: { type: [Number, String], default: 30 },
    glyphs: [String, Array] as PropType<Glyphs>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const days =
        props.days == null ? uptimeModel(slots.default?.() ?? []) : uptimeDays(props.days)
      const known = days.filter((day) => day !== 'empty')
      const percent = known.length
        ? Math.round((known.filter((day) => day === 'ok').length / known.length) * 100)
        : 0
      const input = Number(props.columns)
      const cols = Number.isFinite(input) ? Math.max(1, Math.trunc(input)) : 30
      const rows: UptimeStatus[][] = []
      for (let index = 0; index < days.length; index += cols)
        rows.push(days.slice(index, index + cols))
      const set = resolveGlyphs(props.glyphs),
        last = set.length - 1
      const mark = {
        ok: set[last] ?? '█',
        degraded: set[Math.min(2, last)] ?? '▒',
        down: set[0] ?? '·',
        empty: '-',
      }
      const tone = {
        ok: toneClass(props.palette, 'primary'),
        degraded: toneClass(props.palette, 'secondary'),
        down: toneClass(props.palette, 'empty'),
        empty: toneClass(props.palette, 'empty'),
      }
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col items-center gap-4' }, () => [
            h(
              'div',
              { class: 'flex scrollbar-graph w-fit max-w-full flex-col gap-4 overflow-x-auto' },
              [
                h(
                  'div',
                  { 'aria-hidden': 'true', class: 'flex flex-col gap-1 select-none' },
                  rows.map((row, index) =>
                    withDirectives(
                      h('div', { key: index }, [
                        h(GraphTrack, { class: 'w-auto justify-start gap-0.5' }, () =>
                          row.map((day, i) =>
                            h(
                              GraphTick,
                              { class: ['flex-none', tone[day]], key: i },
                              () => mark[day],
                            ),
                          ),
                        ),
                      ]),
                      [[vReveal, { delay: Math.min(240, index * 50) }]],
                    ),
                  ),
                ),
                h('div', { class: 'flex flex-wrap items-baseline justify-between gap-3' }, [
                  h('p', { class: ['tabular-nums', tone.ok] }, `${percent}%`),
                  props.from || props.to
                    ? h('p', { class: 'flex gap-3 text-graph-muted' }, [
                        props.from ? h('span', props.from) : null,
                        props.to ? h('span', props.to) : null,
                      ])
                    : null,
                ]),
              ],
            ),
            h(
              'p',
              { class: 'flex flex-wrap justify-center gap-x-4 gap-y-1 text-graph-muted' },
              (['ok', 'degraded', 'down'] as const).map((day, i) =>
                h('span', [
                  h('span', { class: tone[day] }, mark[day]),
                  ` ${['up', 'slow', 'down'][i]}`,
                ]),
              ),
            ),
            h(
              'span',
              { class: 'sr-only' },
              `${percent} percent uptime over ${known.length} days${props.from && props.to ? `, ${props.from} to ${props.to}` : ''}`,
            ),
          ]),
      )
    }
  },
})
