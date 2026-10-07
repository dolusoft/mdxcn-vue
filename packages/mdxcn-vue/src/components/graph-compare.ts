/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { CompareRow, LabeledTableData } from '../core/labeled-table.js'
import { compareFromTable, compareValues } from '../core/labeled-table.js'
import type { GraphPalette } from '../core/motion.js'
import { DIM_OPACITY, isMonoPalette, seriesClass } from '../core/motion.js'
import { labeledModel } from '../adapters/labeled-table.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody } from './graph-frame.js'

export interface GraphCompareProps extends LabeledTableData<CompareRow> {
  title: string
  accent?: string
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphCompare = defineComponent({
  name: 'GraphCompare',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    columns: [String, Array] as PropType<GraphCompareProps['columns']>,
    rows: Array as PropType<GraphCompareProps['rows']>,
    table: Object as PropType<GraphCompareProps['table']>,
    accent: String,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const { columns, rows } = labeledModel(
        props,
        slots.default?.() ?? [],
        compareFromTable,
        compareValues,
        true,
      )
      const mono = isMonoPalette(props.palette)
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        ({ captionId }: { captionId?: string } = {}) =>
          h(GraphBody, {}, () =>
            h(
              'div',
              {
                class: 'graph-scroll-x',
                tabindex: 0,
                role: 'region',
                'aria-labelledby': captionId,
                'aria-label': captionId ? undefined : 'Comparison',
              },
              [
                h(
                  'table',
                  {
                    class:
                      'graph-table graph-labeled-table w-full min-w-lg border-separate border-spacing-0',
                    'aria-labelledby': captionId,
                  },
                  [
                    h('thead', [
                      h('tr', [
                        h('th', { scope: 'col', class: 'w-28 text-left' }, [
                          h('span', { class: 'sr-only' }, 'Feature'),
                        ]),
                        ...columns.map((column, index) =>
                          h(
                            'th',
                            {
                              key: index,
                              scope: 'col',
                              class: [
                                'text-right pb-3 pl-4',
                                mono
                                  ? props.accent && column === props.accent
                                    ? 'text-graph-accent'
                                    : 'text-graph-muted'
                                  : seriesClass(props.palette, index),
                              ],
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
                              { scope: 'row', class: 'truncate text-left text-foreground py-1' },
                              row.label,
                            ),
                            ...columns.map((column, index) => {
                              const value = row.values[index],
                                focused = Boolean(props.accent) && column === props.accent,
                                dim = Boolean(props.accent) && !focused,
                                mark = typeof value === 'boolean',
                                on = value === true
                              return h(
                                'td',
                                {
                                  key: index,
                                  class: [
                                    'text-right pl-4 py-1',
                                    !mark && 'tabular-nums',
                                    on &&
                                      (mono
                                        ? (focused || !props.accent) && 'text-graph-accent'
                                        : seriesClass(props.palette, index)),
                                    on && mono && dim && 'text-foreground',
                                    mark && !on && 'text-graph-frame',
                                    !mark && focused && 'text-foreground',
                                    !mark && dim && 'text-graph-muted',
                                  ],
                                  style: dim && !on && mono ? { opacity: DIM_OPACITY } : undefined,
                                },
                                value == null ? '' : mark ? (value ? '✓' : '–') : value,
                              )
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
          ),
      )
    }
  },
})
export { Col } from '../adapters/labeled-table.js'
export { Row } from '../adapters/table.js'
