/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphProse, GraphRule } from './graph-frame.js'

export interface QuoteProps {
  by?: string
  source?: string
  title?: string
  corner?: string
  className?: string
}
export const Quote = defineComponent({
  name: 'Quote',
  inheritAttrs: false,
  props: { by: String, source: String, title: String, corner: String, className: String },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, null, () =>
            withDirectives(
              h('blockquote', { class: 'm-0 flex flex-col gap-5 p-0' }, [
                h('div', { class: 'grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-x-3' }, [
                  h(
                    'span',
                    {
                      'aria-hidden': 'true',
                      class:
                        'text-center text-base leading-relaxed text-graph-accent select-none sm:text-lg',
                    },
                    '“',
                  ),
                  h(
                    GraphProse,
                    { class: 'text-base leading-relaxed text-foreground sm:text-lg' },
                    slots.default,
                  ),
                ]),
                ...(props.by || props.source
                  ? [
                      h(GraphRule),
                      h('footer', { class: 'grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3' }, [
                        h('span', { 'aria-hidden': 'true', class: 'text-center select-none' }, '—'),
                        h('span', { class: 'flex min-w-0 flex-wrap gap-x-2' }, [
                          props.by
                            ? h('cite', { class: 'text-foreground not-italic' }, props.by)
                            : null,
                          props.source
                            ? h('span', { class: 'text-graph-muted' }, props.source)
                            : null,
                        ]),
                      ]),
                    ]
                  : []),
              ]),
              [[vReveal]],
            ),
          ),
      )
  },
})
