/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { LabeledTableData, MatrixRow } from '../core/labeled-table.js'
import { formatMatrixCell, matrixFromTable, matrixValues } from '../core/labeled-table.js'
import type { GraphPalette } from '../core/motion.js'
import { DIM_OPACITY, toneClass } from '../core/motion.js'
import { labeledModel } from '../adapters/labeled-table.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphRule } from './graph-frame.js'
export interface GraphMatrixProps extends LabeledTableData<MatrixRow> {
  title: string
  accent?: string
  palette?: GraphPalette
  corner?: string
  className?: string
}
const ruleY = () =>
  h('span', {
    'aria-hidden': 'true',
    class: 'pointer-events-none absolute inset-y-0 left-0 graph-rule-y',
  })
export const GraphMatrix = /* @__PURE__ */ defineComponent({
  name: 'GraphMatrix',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    columns: [String, Array] as PropType<GraphMatrixProps['columns']>,
    rows: Array as PropType<GraphMatrixProps['rows']>,
    table: Object as PropType<GraphMatrixProps['table']>,
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
        matrixFromTable,
        matrixValues,
      )
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        ({ captionId }: { captionId?: string } = {}) =>
          h(GraphBody, {}, () => [
            h(
              'div',
              {
                class: 'graph-scroll-x',
                tabindex: 0,
                role: 'region',
                'aria-labelledby': captionId,
                'aria-label': captionId ? undefined : 'Matrix',
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
                        h('th', { scope: 'col', class: 'w-24 text-left' }, [
                          h('span', { class: 'sr-only' }, 'Row'),
                        ]),
                        ...columns.map((column, index) =>
                          h(
                            'th',
                            {
                              key: index,
                              scope: 'col',
                              class: 'relative px-3 pb-3 text-right text-graph-muted',
                            },
                            [ruleY(), column],
                          ),
                        ),
                      ]),
                      h('tr', { 'aria-hidden': 'true' }, [
                        h('th', { colspan: columns.length + 1, class: 'p-0' }, [h(GraphRule)]),
                      ]),
                    ]),
                    h(
                      'tbody',
                      rows.map((row, rowIndex) => {
                        const live = Boolean(props.accent) && row.label === props.accent,
                          dim = Boolean(props.accent) && !live,
                          tone = live ? toneClass(props.palette, 'primary') : 'text-foreground',
                          style = dim ? { opacity: DIM_OPACITY } : undefined
                        return withDirectives(
                          h('tr', { key: rowIndex }, [
                            h(
                              'th',
                              {
                                scope: 'row',
                                class: ['truncate py-2.5 pr-3 text-left', tone],
                                style,
                              },
                              row.label,
                            ),
                            ...columns.map((_column, index) =>
                              h(
                                'td',
                                {
                                  key: index,
                                  class: ['relative px-3 py-2.5 text-right tabular-nums', tone],
                                  style,
                                },
                                [ruleY(), formatMatrixCell(row.values[index] ?? '')],
                              ),
                            ),
                          ]),
                          [[vReveal, { delay: Math.min(rowIndex, 5) * 40 }]],
                        )
                      }),
                    ),
                  ],
                ),
              ],
            ),
            h(
              'span',
              { class: 'sr-only' },
              `Matrix with ${rows.length} rows and ${columns.length} columns`,
            ),
          ]),
      )
    }
  },
})
export { Row } from '../adapters/table.js'
