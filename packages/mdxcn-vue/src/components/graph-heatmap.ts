/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { HeatRow, LabeledTableData } from '../core/labeled-table.js'
import { heatFromTable } from '../core/labeled-table.js'
import { numbers } from '../core/markdown.js'
import type { Glyphs, GraphPalette } from '../core/motion.js'
import { intensityClass, intensityGlyph, intensityLevel, resolveGlyphs } from '../core/motion.js'
import { labeledModel } from '../adapters/labeled-table.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody } from './graph-frame.js'
export interface GraphHeatmapProps extends LabeledTableData<HeatRow> {
  title: string
  max?: number
  legend?: boolean
  caption?: string
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphHeatmap = /* @__PURE__ */ defineComponent({
  name: 'GraphHeatmap',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    columns: [String, Array] as PropType<GraphHeatmapProps['columns']>,
    rows: Array as PropType<GraphHeatmapProps['rows']>,
    table: Object as PropType<GraphHeatmapProps['table']>,
    max: Number,
    legend: { type: Boolean, default: true },
    caption: String,
    glyphs: [String, Array] as PropType<Glyphs>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const { columns, rows } = labeledModel(props, slots.default?.() ?? [], heatFromTable, numbers)
      const peak = props.max ?? Math.max(0, ...rows.flatMap((row) => row.values), 0),
        set = resolveGlyphs(props.glyphs)
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        ({ captionId }: { captionId?: string } = {}) =>
          h(GraphBody, { class: 'flex flex-col gap-4' }, () => [
            h(
              'div',
              {
                class: 'graph-scroll-x',
                tabindex: 0,
                role: 'region',
                'aria-labelledby': captionId,
                'aria-label': captionId ? undefined : 'Heatmap',
              },
              [
                h(
                  'table',
                  {
                    class:
                      'graph-table graph-labeled-table w-full table-fixed border-separate border-spacing-0',
                    'aria-labelledby': captionId,
                  },
                  [
                    h('thead', [
                      h('tr', [
                        h('th', { scope: 'col', class: 'w-28 text-left' }, [
                          h('span', { class: 'sr-only' }, 'Row'),
                        ]),
                        ...columns.map((column, index) =>
                          h(
                            'th',
                            {
                              key: index,
                              scope: 'col',
                              class: 'truncate text-center text-graph-muted pb-2',
                            },
                            column,
                          ),
                        ),
                      ]),
                    ]),
                    h(
                      'tbody',
                      rows.map((row, rowIndex) =>
                        withDirectives(
                          h('tr', { key: rowIndex }, [
                            h(
                              'th',
                              { scope: 'row', class: 'truncate text-left text-foreground py-0.5' },
                              row.label,
                            ),
                            ...columns.map((column, index) => {
                              const value = row.values[index] ?? 0,
                                level = intensityLevel(value, peak)
                              return h('td', { key: index, class: 'text-center py-0.5' }, [
                                h('span', { class: 'sr-only' }, `${column} ${value}`),
                                h(
                                  'span',
                                  {
                                    'aria-hidden': 'true',
                                    class: [
                                      'text-center leading-none select-none',
                                      intensityClass(level, props.palette),
                                    ],
                                  },
                                  intensityGlyph(level, set),
                                ),
                              ])
                            }),
                          ]),
                          [[vReveal, { delay: Math.min(rowIndex, 5) * 40 }]],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            props.legend || props.caption
              ? h('div', { class: 'flex flex-wrap items-center justify-between gap-3' }, [
                  props.caption ? h('p', { class: 'text-graph-muted' }, props.caption) : h('span'),
                  props.legend
                    ? h('p', { class: 'flex items-center gap-2 text-graph-muted' }, [
                        h('span', 'Less'),
                        h(
                          'span',
                          { 'aria-hidden': 'true', class: 'flex select-none' },
                          set.map((glyph, index) =>
                            h(
                              'span',
                              {
                                key: index,
                                class: [
                                  'w-[1ch] text-center',
                                  intensityClass(
                                    Math.round((index / Math.max(set.length - 1, 1)) * 4),
                                    props.palette,
                                  ),
                                ],
                              },
                              glyph,
                            ),
                          ),
                        ),
                        h('span', 'More'),
                      ])
                    : null,
                ])
              : null,
          ]),
      )
    }
  },
})
export { Row } from '../adapters/table.js'
