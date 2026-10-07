/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { BarSeries } from '../core/series.js'
import type { Glyphs, GraphPalette } from '../core/motion.js'
import { toneClass, trackMarks } from '../core/motion.js'
import { barsModel } from '../adapters/series.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody } from './graph-frame.js'

export interface GraphBarsProps {
  title: string
  from?: BarSeries | null
  to?: BarSeries | null
  series?: readonly BarSeries[] | null
  processor?: string
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphBars = /* @__PURE__ */ defineComponent({
  name: 'GraphBars',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    from: Object as PropType<GraphBarsProps['from']>,
    to: Object as PropType<GraphBarsProps['to']>,
    series: Array as PropType<GraphBarsProps['series']>,
    processor: String,
    glyphs: [String, Array] as PropType<Glyphs>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const series = props.series ?? barsModel(slots.default?.() ?? [])
      const empty: BarSeries = { label: '', values: [] }
      const from = props.from ?? series[0] ?? empty
      const to = props.to ?? series[1] ?? empty
      const fill = trackMarks(props.glyphs).fill
      const mini = (entry: BarSeries, muted: boolean) => {
        const height = entry.size === 'lg' ? 8 : 5
        const max = Math.max(...entry.values, 1)
        return h('div', { class: 'flex flex-col items-center gap-3' }, [
          h(
            'div',
            { class: 'flex items-end gap-1' },
            entry.values.map((value, index) => {
              const level = Math.round((value / max) * (height - 1))
              return h(
                'span',
                { key: index, class: 'flex w-[1ch] flex-col justify-end' },
                Array.from({ length: height }, (_, row) => {
                  const on = height - 1 - row <= level
                  const cell = h(
                    'span',
                    {
                      class: [
                        'h-[1em] w-full text-center',
                        on
                          ? toneClass(props.palette, muted ? 'secondary' : 'primary')
                          : 'text-transparent',
                      ],
                    },
                    on ? fill : ' ',
                  )
                  return on
                    ? withDirectives(cell, [
                        [vReveal, { delay: Math.min(240, (muted ? 40 : 160) + index * 30) }],
                      ])
                    : cell
                }),
              )
            }),
          ),
          h(
            'p',
            { class: muted ? toneClass(props.palette, 'secondary') : 'text-foreground' },
            entry.label,
          ),
        ])
      }
      const arrow = () =>
        h(
          'div',
          { 'aria-hidden': 'true', class: 'flex min-w-6 items-center gap-1 text-graph-frame' },
          [h('span', '- - -'), h('span', { class: 'shrink-0' }, '▶')],
        )
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, null, () =>
            h(
              'div',
              {
                class:
                  'flex flex-col items-center gap-8 sm:flex-row sm:items-end sm:justify-center sm:gap-8',
              },
              [
                mini(from, true),
                h(
                  'div',
                  {
                    class:
                      'flex items-center justify-center gap-3 text-graph-muted max-sm:rotate-90',
                  },
                  [arrow(), props.processor ? h('span', props.processor) : null, arrow()],
                ),
                mini(to, false),
              ],
            ),
          ),
      )
    }
  },
})
export { Series } from '../adapters/series.js'
