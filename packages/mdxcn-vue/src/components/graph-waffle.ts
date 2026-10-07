/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import { fraction } from '../core/grid-fraction.js'
import type { FractionData } from '../core/grid-fraction.js'
import type { Glyphs, GraphPalette } from '../core/motion.js'
import { toneClass, trackMarks } from '../core/motion.js'
import { fractionModel } from '../adapters/grid-fraction.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody } from './graph-frame.js'
export interface GraphWaffleProps {
  title: string
  value?: number | string | null
  cells?: number | string
  columns?: number | string
  caption?: string | null
  written?: FractionData | null
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphWaffle = defineComponent({
  name: 'GraphWaffle',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    value: [Number, String] as PropType<GraphWaffleProps['value']>,
    cells: { type: [Number, String], default: 100 },
    columns: { type: [Number, String], default: 10 },
    caption: String as PropType<GraphWaffleProps['caption']>,
    written: Object as PropType<GraphWaffleProps['written']>,
    glyphs: [String, Array] as PropType<Glyphs>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const written = props.written ?? fractionModel(slots.default?.() ?? [])
      const value = Math.min(1, Math.max(0, fraction(props.value ?? written.token)))
      const caption = props.caption ?? (props.value == null ? written.caption : undefined)
      const cells = Number(props.cells),
        columns = Number(props.columns),
        filled = Math.round(value * cells),
        rows = Math.ceil(cells / columns),
        percent = Math.round(value * 100)
      const marks = trackMarks(props.glyphs, { empty: '░', rest: '░', fill: '█' })
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-4' }, () => [
            h(
              'div',
              { 'aria-hidden': 'true', class: 'flex w-full flex-col gap-1 select-none' },
              Array.from({ length: rows }, (_, row) =>
                h(
                  'div',
                  { class: 'flex w-full', key: row },
                  Array.from({ length: columns }, (_, column) => {
                    const index = row * columns + column
                    if (index >= cells)
                      return h('span', { class: 'min-w-[1ch] flex-1', key: column })
                    const isFilled = index < filled
                    const node = h(
                      'span',
                      {
                        key: column,
                        class: [
                          'min-w-[1ch] flex-1 text-center',
                          isFilled ? toneClass(props.palette, 'primary') : 'text-graph-frame',
                        ],
                      },
                      isFilled ? marks.fill : marks.empty,
                    )
                    return isFilled
                      ? withDirectives(node, [[vReveal, { delay: Math.min(240, index * 6) }]])
                      : node
                  }),
                ),
              ),
            ),
            h('p', { class: ['tabular-nums', toneClass(props.palette, 'primary')] }, `${percent}%`),
            caption ? h('p', { class: 'text-graph-muted' }, caption) : null,
            h('span', { class: 'sr-only' }, `${percent} percent${caption ? `. ${caption}` : ''}`),
          ]),
      )
    }
  },
})
