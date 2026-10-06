/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import { childItems, defineItem, textOf, childrenOf } from '../adapters/items.js'
import { stateList, proseParagraphs } from '../adapters/state-list.js'
import { stepFromList } from '../core/state-list.js'
import type { StateListItem, StepState } from '../core/state-list.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphProse } from './graph-frame.js'

export interface StepProps {
  title?: string
  state?: StepState
}
export interface StepsProps {
  title?: string
  /** Compiler input; runtime authors use lists or Step slots. */
  list?: readonly StateListItem[] | null
  corner?: string
  className?: string
}
export const Step = defineItem<StepProps>('Step', {
  title: { type: 'string' },
  state: { type: 'string', default: 'done' },
})
export const Steps = defineComponent({
  name: 'Steps',
  inheritAttrs: false,
  props: {
    title: String,
    list: Array as PropType<StepsProps['list']>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const nodes = slots.default?.() ?? []
      const listed = stateList(nodes)
      const steps =
        props.list != null
          ? props.list.map((item) => {
              const model = stepFromList(item)
              return {
                ...model,
                body: Array.isArray(model.body) ? proseParagraphs(model.body) : model.body,
              }
            })
          : listed.length
            ? listed.map(({ description, paragraphs }) => {
                const model = stepFromList(description)
                return {
                  ...model,
                  title: paragraphs.length ? textOf(childrenOf(paragraphs[0]!)) : model.title,
                  body:
                    paragraphs.length > 1
                      ? paragraphs.slice(1)
                      : paragraphs.length
                        ? undefined
                        : (model.body as string | undefined),
                }
              })
            : childItems(nodes, Step).map((item) => ({
                title: item.props.title as string | undefined,
                state: item.props.state as StepState,
                body: item.children.length ? item.children : undefined,
              }))
      const digits = Math.max(2, String(steps.length).length)
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, {}, () =>
            h(
              'ol',
              { class: 'flex flex-col', role: 'list' },
              steps.map((step, index) => {
                const live = step.state === 'now'
                const next = step.state === 'next'
                return withDirectives(
                  h('li', { class: 'flex flex-col', key: index }, [
                    h(
                      'div',
                      { class: 'grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3' },
                      [
                        h(
                          'span',
                          {
                            'aria-hidden': 'true',
                            class: [
                              'tabular-nums select-none',
                              live
                                ? 'text-graph-accent'
                                : next
                                  ? 'text-graph-frame'
                                  : 'text-graph-muted',
                            ],
                          },
                          String(index + 1).padStart(digits, '0'),
                        ),
                        h('div', { class: 'flex min-w-0 flex-col gap-2' }, [
                          step.title
                            ? h(
                                'p',
                                {
                                  class: [
                                    'text-pretty',
                                    live
                                      ? 'text-graph-accent'
                                      : next
                                        ? 'text-graph-muted'
                                        : 'text-foreground',
                                  ],
                                },
                                step.title,
                              )
                            : null,
                          step.body
                            ? h(
                                GraphProse,
                                { class: next ? 'text-graph-muted' : 'text-foreground/80' },
                                () => step.body,
                              )
                            : null,
                        ]),
                      ],
                    ),
                    index === steps.length - 1
                      ? null
                      : h(
                          'div',
                          {
                            'aria-hidden': 'true',
                            class: 'grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 py-2 select-none',
                          },
                          [h('span', { class: 'text-center text-graph-frame' }, '│')],
                        ),
                  ]),
                  [[vReveal, { delay: Math.min(index, 5) * 60 }]],
                )
              }),
            ),
          ),
      )
    }
  },
})
