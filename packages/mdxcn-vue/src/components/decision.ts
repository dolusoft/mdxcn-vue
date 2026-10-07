/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { ProseNode } from '../core/model.js'
import type { DecisionOption } from '../core/state-list.js'
import { optionFromList } from '../core/state-list.js'
import { stateList, proseParagraphs } from '../adapters/state-list.js'
import { flattenNodes } from '../adapters/items.js'
import type { GraphPalette } from '../core/motion.js'
import { toneClass } from '../core/motion.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphProse, GraphRule } from './graph-frame.js'

export interface DecisionProps {
  title?: string
  status?: string
  date?: string
  options?: readonly DecisionOption[] | null
  /** Compiler input; runtime prose comes from the default slot. */
  after?: ProseNode[][] | null
  palette?: GraphPalette
  corner?: string
  className?: string
}
const glyph = { chosen: '●', open: '○', rejected: '×' }
export const Decision = /* @__PURE__ */ defineComponent({
  name: 'Decision',
  inheritAttrs: false,
  props: {
    title: { type: String, default: 'decision' },
    status: String,
    date: String,
    options: Array as PropType<DecisionProps['options']>,
    after: Array as PropType<DecisionProps['after']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const nodes = slots.default?.() ?? []
      const options =
        props.options ?? stateList(nodes).map((item) => optionFromList(item.description))
      const after =
        props.after != null
          ? proseParagraphs(props.after)
          : flattenNodes(nodes).filter(
              (node) => node.type !== 'ul' && node.type !== 'ol' && typeof node.type !== 'symbol',
            )
      const chosen = options.find((option) => option.state === 'chosen')
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-4' }, () => [
            ...(props.status || props.date
              ? [
                  h('div', { class: 'flex items-baseline justify-between gap-4' }, [
                    h('span', { class: 'text-foreground' }, props.status ?? ''),
                    props.date
                      ? h('span', { class: 'text-graph-muted tabular-nums' }, props.date)
                      : null,
                  ]),
                  h(GraphRule),
                ]
              : []),
            h(
              'ul',
              { class: 'flex flex-col gap-2', role: 'list' },
              options.map((option, index) => {
                const state = option.state ?? 'open'
                const tone =
                  state === 'chosen'
                    ? toneClass(props.palette, 'primary')
                    : state === 'rejected'
                      ? toneClass(props.palette, 'secondary')
                      : 'text-foreground'
                return withDirectives(
                  h(
                    'li',
                    {
                      key: index,
                      class:
                        'grid grid-cols-[1.25rem_minmax(0,11rem)_minmax(0,1fr)] items-baseline gap-x-3 max-sm:grid-cols-[1.25rem_minmax(0,1fr)]',
                    },
                    [
                      h(
                        'span',
                        {
                          'aria-hidden': 'true',
                          class: [
                            'text-center select-none',
                            state === 'open' ? 'text-graph-muted' : tone,
                          ],
                        },
                        glyph[state],
                      ),
                      h('span', { class: tone }, option.label),
                      option.reason
                        ? h('span', { class: 'text-graph-muted max-sm:col-start-2' }, option.reason)
                        : null,
                    ],
                  ),
                  [[vReveal, { delay: Math.min(index, 5) * 50 }]],
                )
              }),
            ),
            ...(after.length
              ? [
                  h(GraphRule),
                  withDirectives(
                    h('div', [h(GraphProse, { class: 'text-foreground/80' }, () => after)]),
                    [[vReveal]],
                  ),
                ]
              : []),
            chosen
              ? h(
                  'span',
                  { class: 'sr-only' },
                  `Chose ${chosen.label} over ${options.length - 1} other options.`,
                )
              : null,
          ]),
      )
    }
  },
})
