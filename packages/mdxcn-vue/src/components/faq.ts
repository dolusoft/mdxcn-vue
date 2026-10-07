/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType, VNode } from 'vue'
import type { FaqEntry } from '../core/sections.js'
import type { GraphPalette } from '../core/motion.js'
import { toneClass } from '../core/motion.js'
import { faqAnswer, faqEntries } from '../adapters/sections.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphProse, GraphRule } from './graph-frame.js'

export interface FaqProps {
  title?: string
  entries?: readonly FaqEntry<VNode | readonly VNode[]>[] | null
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const Faq = defineComponent({
  name: 'Faq',
  inheritAttrs: false,
  props: {
    title: { type: String, default: 'faq' },
    entries: Array as PropType<FaqProps['entries']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const entries = props.entries ?? faqEntries(slots.default?.() ?? [])
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, {}, () =>
            h(
              'ol',
              { class: 'flex flex-col gap-4', role: 'list' },
              entries.map((entry, index) => {
                const tone = entry.accent ? toneClass(props.palette, 'primary') : 'text-foreground'
                return withDirectives(
                  h('li', { key: index, class: 'flex flex-col gap-4' }, [
                    index > 0 ? h(GraphRule) : null,
                    h(
                      'div',
                      {
                        class:
                          'grid grid-cols-[1.25rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-2',
                      },
                      [
                        h(
                          'span',
                          {
                            'aria-hidden': 'true',
                            class: [
                              'text-center select-none',
                              entry.accent ? tone : 'text-graph-muted',
                            ],
                          },
                          '?',
                        ),
                        h('p', { class: ['text-pretty', tone] }, entry.question),
                        entry.answer
                          ? h(GraphProse, { class: 'col-start-2 text-foreground/80' }, () =>
                              faqAnswer(entry.answer),
                            )
                          : null,
                      ],
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
