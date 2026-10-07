/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, isVNode, mergeProps, withDirectives } from 'vue'
import type { PropType, VNode } from 'vue'
import type { TableCell, TableData, GraphAlign } from '../core/table.js'
import { tableModel } from '../adapters/table.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphRule, renderProse } from './graph-frame.js'

export interface GraphTableProps extends TableData<VNode> {
  title: string
  corner?: string
  className?: string
}

const ruleY = () =>
  h('span', {
    'aria-hidden': 'true',
    class: 'pointer-events-none absolute inset-y-0 left-0 graph-rule-y',
  })
const cellContent = (cell: TableCell<VNode>) =>
  isVNode(cell) ? cell : Array.isArray(cell) ? renderProse([...cell]) : String(cell ?? '')

export const GraphTable = /* @__PURE__ */ defineComponent({
  name: 'GraphTable',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    headers: [String, Array] as PropType<TableData['headers']>,
    rows: Array as PropType<TableData<VNode>['rows']>,
    footer: Array as PropType<TableData<VNode>['footer']>,
    align: [String, Array] as PropType<TableData['align']>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const model = tableModel(props, slots.default?.() ?? [])
      const alignment = (index: number): GraphAlign =>
        model.align?.[index] ?? (index === 0 ? 'left' : 'right')
      const cells = (values: TableCell<VNode>[], footer = false) =>
        values.map((cell, index) =>
          h(
            'td',
            {
              key: index,
              class: `relative px-3 ${footer ? 'pt-1' : 'py-2.5'} whitespace-nowrap ${alignment(index) === 'right' ? 'text-right tabular-nums' : 'text-left'}`,
            },
            [index > 0 ? ruleY() : null, ...[cellContent(cell)].flat()],
          ),
        )
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        ({ captionId }: { captionId?: string } = {}) =>
          h('div', { class: 'min-w-0 px-3 py-6 sm:px-6 sm:py-8' }, [
            h(
              'div',
              {
                class: '@container graph-scroll-x',
                tabindex: 0,
                role: 'region',
                'aria-labelledby': captionId,
                'aria-label': captionId ? undefined : 'Table',
              },
              [
                h(
                  'table',
                  {
                    class: 'graph-table w-full min-w-lg border-separate border-spacing-0',
                    'aria-labelledby': captionId,
                  },
                  [
                    h('thead', [
                      h(
                        'tr',
                        model.headers.map((header, index) =>
                          h(
                            'th',
                            {
                              key: index,
                              scope: 'col',
                              class: `relative px-3 pb-3 font-normal whitespace-nowrap text-foreground ${alignment(index) === 'right' ? 'text-right' : 'text-left'}`,
                            },
                            [index > 0 ? ruleY() : null, header],
                          ),
                        ),
                      ),
                      h('tr', { 'aria-hidden': 'true' }, [
                        h('th', { colspan: model.headers.length, class: 'p-0' }, [h(GraphRule)]),
                      ]),
                    ]),
                    h(
                      'tbody',
                      model.rows.map((row, index) =>
                        withDirectives(h('tr', { key: index }, cells(row)), [
                          [vReveal, { delay: Math.min(index, 6) * 40 }],
                        ]),
                      ),
                    ),
                    model.footer
                      ? h('tfoot', [
                          h('tr', { 'aria-hidden': 'true' }, [
                            h('td', { colspan: model.headers.length, class: 'pt-2 pb-3' }, [
                              h(GraphRule),
                            ]),
                          ]),
                          h('tr', cells(model.footer, true)),
                        ])
                      : null,
                  ],
                ),
              ],
            ),
          ]),
      )
    }
  },
})
