/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { KpiData } from '../core/kpi.js'
import type { Glyphs, GraphPalette } from '../core/motion.js'
import { toneClass, resolveGlyphs, seriesDim } from '../core/motion.js'
import { numbers } from '../core/markdown.js'
import { kpiModel } from '../adapters/series.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphTrack, GraphTick } from './graph-frame.js'
const SPARK_DEFAULT = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
export interface GraphKpiProps {
  title: string
  value?: string | null
  label?: string | null
  hint?: string | null
  data?: readonly number[] | string | null
  written?: KpiData | null
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphKpi = /* @__PURE__ */ defineComponent({
  name: 'GraphKpi',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    value: String as PropType<GraphKpiProps['value']>,
    label: String as PropType<GraphKpiProps['label']>,
    hint: String as PropType<GraphKpiProps['hint']>,
    data: [String, Array] as PropType<GraphKpiProps['data']>,
    written: Object as PropType<GraphKpiProps['written']>,
    glyphs: [String, Array] as PropType<Glyphs>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const written = props.written ?? kpiModel(slots.default?.() ?? [])
      const value = props.value ?? written.value,
        label = props.label ?? written.label,
        hint = props.hint ?? written.hint
      const data = props.data == null ? written.data : numbers(props.data),
        max = Math.max(...data, 1)
      const set = props.glyphs == null ? SPARK_DEFAULT : resolveGlyphs(props.glyphs)
      const points = data.map(
        (entry) => set[Math.round((entry / max) * (set.length - 1))] ?? set[0] ?? '▁',
      )
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-4' }, () => [
            withDirectives(
              h('div', { class: 'flex flex-col gap-2' }, [
                h(
                  'p',
                  {
                    class: [
                      'text-3xl tracking-tight tabular-nums sm:text-4xl',
                      toneClass(props.palette, 'primary'),
                    ],
                  },
                  value,
                ),
                h('div', { class: 'flex items-baseline gap-3' }, [
                  h('p', { class: 'text-graph-muted' }, label),
                  hint ? h('p', { class: 'text-graph-muted tabular-nums' }, hint) : null,
                ]),
              ]),
              [[vReveal]],
            ),
            points.length
              ? h(GraphTrack, { class: 'justify-start gap-0.5' }, () =>
                  points.map((glyph, index) => {
                    const live = index === points.length - 1
                    return h(GraphTick, { key: `${glyph}-${index}`, class: 'flex-none' }, () =>
                      withDirectives(
                        h(
                          'span',
                          {
                            class: toneClass(props.palette, live ? 'primary' : 'secondary'),
                            style: seriesDim(props.palette, live),
                          },
                          glyph,
                        ),
                        [[vReveal, { delay: Math.min(240, index * 30) }]],
                      ),
                    )
                  }),
                )
              : null,
            h('span', { class: 'sr-only' }, `${value} ${label}${hint ? `. ${hint}` : ''}`),
          ]),
      )
    }
  },
})
