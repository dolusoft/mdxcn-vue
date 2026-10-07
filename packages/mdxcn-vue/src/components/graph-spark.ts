/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { SeriesData } from '../core/series.js'
import type { Glyphs, GraphPalette } from '../core/motion.js'
import { toneClass, resolveGlyphs, seriesDim } from '../core/motion.js'
import { numbers } from '../core/markdown.js'
import { sparkModel } from '../adapters/series.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphTrack, GraphTick } from './graph-frame.js'
const SPARK_DEFAULT = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
export interface GraphSparkProps {
  title: string
  data?: readonly number[] | string | null
  caption?: string | null
  written?: SeriesData | null
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphSpark = /* @__PURE__ */ defineComponent({
  name: 'GraphSpark',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    data: [String, Array] as PropType<GraphSparkProps['data']>,
    caption: String as PropType<GraphSparkProps['caption']>,
    written: Object as PropType<GraphSparkProps['written']>,
    glyphs: [String, Array] as PropType<Glyphs>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const written = props.written ?? sparkModel(slots.default?.() ?? [])
      const data = props.data == null ? written.data : numbers(props.data)
      const caption = props.caption ?? (props.data == null ? written.caption : undefined)
      const max = Math.max(...data, 1)
      const set = props.glyphs == null ? SPARK_DEFAULT : resolveGlyphs(props.glyphs)
      const points = data.map(
        (value) => set[Math.round((value / max) * (set.length - 1))] ?? set[0] ?? '▁',
      )
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col items-center gap-4' }, () => [
            h(GraphTrack, { class: 'justify-center gap-0.5' }, () =>
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
            ),
            caption ? h('p', { class: 'text-graph-muted' }, caption) : null,
            h(
              'span',
              { class: 'sr-only' },
              `Sparkline with ${data.length} points${caption ? `. ${caption}` : ''}`,
            ),
          ]),
      )
    }
  },
})
