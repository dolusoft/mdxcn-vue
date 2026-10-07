/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { BoardColumn } from '../core/sections.js'
import { normalizeBoard } from '../core/sections.js'
import { boardColumns } from '../adapters/sections.js'
import type { GraphPalette } from '../core/motion.js'
import { toneClass } from '../core/motion.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphRule, GraphRuleY } from './graph-frame.js'

export interface GraphBoardProps {
  title: string
  columns?: readonly BoardColumn[] | null
  palette?: GraphPalette
  corner?: string
  className?: string
}
const columnGrid: Record<number, string> = {
  1: 'sm:grid-cols-[minmax(0,1fr)]',
  2: 'sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]',
  3: 'sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]',
  4: 'sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]',
}
export const GraphBoard = defineComponent({
  name: 'GraphBoard',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    columns: Array as PropType<GraphBoardProps['columns']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const columns = normalizeBoard(props.columns ?? boardColumns(slots.default?.() ?? []))
      const total = columns.reduce((sum, column) => sum + column.items.length, 0)
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, {}, () => [
            h(
              'div',
              { class: ['grid grid-cols-1 gap-y-5 sm:gap-x-5', columnGrid[columns.length]] },
              columns.flatMap((column, columnIndex) => [
                columnIndex > 0
                  ? h('div', { 'aria-hidden': 'true', key: `rule-${columnIndex}` }, [
                      h(GraphRule, { class: 'sm:hidden' }),
                      h(GraphRuleY, { class: 'hidden h-full sm:block' }),
                    ])
                  : null,
                h(
                  'section',
                  {
                    'aria-label': column.title,
                    key: columnIndex,
                    class: 'flex min-w-0 flex-col gap-3',
                  },
                  [
                    withDirectives(
                      h(
                        'p',
                        { class: 'flex items-baseline justify-between gap-3 text-graph-muted' },
                        [
                          h('span', { class: 'truncate' }, column.title),
                          h('span', { class: 'tabular-nums' }, String(column.items.length)),
                        ],
                      ),
                      [[vReveal]],
                    ),
                    h(
                      'ul',
                      { class: 'flex flex-col gap-2', role: 'list' },
                      column.items.map((entry, index) => {
                        const state = entry.state ?? 'done'
                        return withDirectives(
                          h(
                            'li',
                            {
                              key: index,
                              class: 'grid grid-cols-[1ch_minmax(0,1fr)] items-baseline gap-x-2',
                            },
                            [
                              h(
                                'span',
                                {
                                  'aria-hidden': 'true',
                                  class: [
                                    'select-none',
                                    state === 'now'
                                      ? toneClass(props.palette, 'primary')
                                      : 'text-graph-frame',
                                  ],
                                },
                                '-',
                              ),
                              h('span', { class: 'flex min-w-0 flex-col gap-1' }, [
                                h(
                                  'span',
                                  {
                                    class: [
                                      'text-pretty',
                                      state === 'now' && toneClass(props.palette, 'primary'),
                                      state === 'next' && toneClass(props.palette, 'secondary'),
                                      state === 'done' && 'text-foreground',
                                    ],
                                  },
                                  entry.label,
                                ),
                                entry.note
                                  ? h('span', { class: 'text-graph-muted' }, entry.note)
                                  : null,
                              ]),
                            ],
                          ),
                          [[vReveal, { delay: Math.min(index + 1, 5) * 40 }]],
                        )
                      }),
                    ),
                  ],
                ),
              ]),
            ),
            h(
              'span',
              { class: 'sr-only' },
              `${columns.map((column) => `${column.title}: ${column.items.length}`).join(', ')}. ${total} items.`,
            ),
          ]),
      )
    }
  },
})
