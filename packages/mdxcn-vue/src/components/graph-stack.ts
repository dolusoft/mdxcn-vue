/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { StackRow } from '../core/model'
import type { Glyphs, GraphPalette } from '../core/motion'
import { isMonoPalette, resolveGlyphs, seriesClass, seriesDim } from '../core/motion'
import { DEFAULT_STACK_GLYPHS, paintRow, stackLegend } from '../core/stack'
import { stackModel } from '../adapters/stack'
import { vReveal } from '../directives/reveal'
import { Graph, GraphBody, GraphTick, GraphTrack, renderProse } from './graph-frame'

export interface GraphStackProps {
  title: string
  rows?: StackRow[] | null
  accent?: string
  ticks?: number
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}

export const GraphStack = defineComponent({
  name: 'GraphStack',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    rows: Array as PropType<StackRow[] | null>,
    accent: String,
    ticks: { type: Number, default: 24 },
    glyphs: [String, Array] as PropType<Glyphs>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const rows = stackModel(props.rows, slots.default?.() ?? [])
      const legend = stackLegend(rows)
      const set = props.glyphs == null ? DEFAULT_STACK_GLYPHS : resolveGlyphs(props.glyphs)
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-6' }, () => [
            h(
              'ul',
              { class: 'flex flex-col gap-3', role: 'list' },
              rows.map((row, rowIndex) =>
                withDirectives(
                  h(
                    'li',
                    {
                      key: row.label,
                      'aria-label': `${row.label}: ${row.segments.map((segment) => `${segment.label} ${segment.value}`).join(', ')}`,
                      class:
                        'grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-center gap-x-2 sm:gap-x-4',
                    },
                    [
                      h(
                        'span',
                        { class: 'truncate text-foreground' },
                        row.labelContent ? renderProse(row.labelContent) : row.label,
                      ),
                      h(GraphTrack, null, () =>
                        paintRow(row.segments, props.ticks, set, props.accent).flatMap(
                          (piece, pieceIndex) =>
                            Array.from({ length: piece.count }, (_, index) =>
                              h(
                                GraphTick,
                                {
                                  key: `${pieceIndex}-${index}`,
                                  class: seriesClass(props.palette, legend.indexOf(piece.label)),
                                  style: seriesDim(
                                    props.palette,
                                    isMonoPalette(props.palette) ? piece.accent : true,
                                  ),
                                },
                                () => piece.glyph,
                              ),
                            ),
                        ),
                      ),
                    ],
                  ),
                  [[vReveal, { delay: rowIndex * 50 }]],
                ),
              ),
            ),
            h(
              'ul',
              { class: 'flex flex-wrap gap-x-4 gap-y-1', role: 'list' },
              legend.map((label, index) => {
                const highlighted = isMonoPalette(props.palette)
                  ? props.accent
                    ? label === props.accent
                    : index === 0
                  : true
                return h('li', { key: label, class: 'flex items-center gap-2' }, [
                  h(
                    'span',
                    {
                      'aria-hidden': 'true',
                      class: seriesClass(props.palette, index),
                      style: seriesDim(props.palette, highlighted),
                    },
                    set[index % set.length] ?? '█',
                  ),
                  // Keep normal text above the contrast floor; only decorative glyphs dim.
                  h('span', { class: highlighted ? 'text-foreground' : 'text-graph-muted' }, label),
                ])
              }),
            ),
          ]),
      )
    }
  },
})
