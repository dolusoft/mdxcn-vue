/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { SeriesData } from '../core/series.js'
import type { Glyphs, GraphPalette } from '../core/motion.js'
import { clamp01, toneClass, trackMarks } from '../core/motion.js'
import { numbers } from '../core/markdown.js'
import { sparkModel } from '../adapters/series.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphRule } from './graph-frame.js'

export interface GraphPlotProps {
  title: string
  data?: readonly number[] | string | null
  labels?: readonly string[] | null
  written?: SeriesData | null
  height?: number
  variant?: 'line' | 'area'
  progress?: number
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}
const formatTick = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1))
export const GraphPlot = defineComponent({
  name: 'GraphPlot',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    data: [String, Array] as PropType<GraphPlotProps['data']>,
    labels: Array as PropType<GraphPlotProps['labels']>,
    written: Object as PropType<GraphPlotProps['written']>,
    height: { type: Number, default: 7 },
    variant: { type: String as PropType<GraphPlotProps['variant']>, default: 'area' },
    progress: { type: Number, default: 1 },
    glyphs: [String, Array] as PropType<Glyphs>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const written = props.written ?? sparkModel(slots.default?.() ?? [])
      const data = props.data == null ? written.data : numbers(props.data)
      const labels = props.labels ?? (written.labels.length ? written.labels : undefined)
      const max = Math.max(...data, 0),
        min = Math.min(0, ...data),
        range = max - min || 1
      const start = labels?.[0],
        end = labels?.[labels.length - 1],
        yLabel = formatTick(max)
      const revealed = Math.round(clamp01(props.progress) * data.length),
        lastLive = Math.max(0, revealed - 1)
      const marks = trackMarks(props.glyphs)
      const spacer = () => h('span', { class: 'invisible w-[4ch] shrink-0 tabular-nums' }, yLabel)
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-3' }, () => [
            h('div', { class: 'flex gap-3' }, [
              h(
                'div',
                {
                  class:
                    'flex w-[4ch] shrink-0 flex-col justify-between py-px text-right text-graph-muted tabular-nums',
                  style: { height: `${props.height}em` },
                },
                [h('span', yLabel), h('span', formatTick(min))],
              ),
              h(
                'div',
                {
                  'aria-hidden': 'true',
                  class: 'flex min-w-0 flex-1 items-end select-none',
                  style: { height: `${props.height}em` },
                },
                data.map((value, column) => {
                  const level = Math.round(((value - min) / range) * (props.height - 1))
                  const shown = column < revealed,
                    live = column === lastLive && shown
                  return h(
                    'span',
                    { key: column, class: 'flex h-full min-w-[1ch] flex-1 flex-col justify-end' },
                    Array.from({ length: props.height }, (_, row) => {
                      const fromBottom = props.height - 1 - row
                      const isCap = shown && fromBottom === level,
                        isFill = shown && props.variant === 'area' && fromBottom < level
                      const glyph = isCap ? marks.fill : isFill ? marks.rest : ' '
                      const tone = isCap
                        ? live
                          ? toneClass(props.palette, 'primary')
                          : 'text-foreground'
                        : isFill
                          ? toneClass(props.palette, 'secondary')
                          : 'text-transparent'
                      const node = h(
                        'span',
                        { key: row, class: ['h-[1em] w-full text-center', tone] },
                        glyph,
                      )
                      return shown && glyph !== ' '
                        ? withDirectives(node, [[vReveal, { delay: Math.min(240, column * 30) }]])
                        : node
                    }),
                  )
                }),
              ),
            ]),
            ...(start || end
              ? [
                  h('div', { class: 'flex gap-3' }, [spacer(), h(GraphRule, { class: 'flex-1' })]),
                  h('div', { class: 'flex gap-3' }, [
                    spacer(),
                    h('div', { class: 'flex flex-1 justify-between text-graph-muted' }, [
                      h('span', start),
                      end && end !== start ? h('span', end) : null,
                    ]),
                  ]),
                ]
              : []),
            h(
              'span',
              { class: 'sr-only' },
              `${props.variant} plot, ${data.length} points, min ${formatTick(min)}, max ${formatTick(max)}`,
            ),
          ]),
      )
    }
  },
})
