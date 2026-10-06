/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphProse } from './graph-frame.js'

export type CalloutType = 'note' | 'tip' | 'warning' | 'danger'
export interface CalloutProps {
  type?: CalloutType
  title?: string
  corner?: string
  className?: string
}
const glyph = { note: 'i', tip: '+', warning: '!', danger: '×' }
const tone = {
  note: 'text-graph-muted',
  tip: 'text-graph-accent',
  warning: 'text-graph-accent',
  danger: 'text-destructive',
}

export const Callout = defineComponent({
  name: 'Callout',
  inheritAttrs: false,
  props: {
    type: { type: String as PropType<CalloutType>, default: 'note' },
    title: String,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        Graph,
        mergeProps(
          {
            title: props.title ?? props.type,
            corner: props.corner,
            className: props.className,
            role: 'note',
          },
          attrs,
        ),
        () =>
          // Resolve the upstream padding override locally; shared frame stays unchanged.
          h('div', { class: 'min-w-0 px-5 sm:px-8 py-6 sm:py-6' }, [
            withDirectives(
              h(
                'div',
                {
                  class: 'grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-x-3',
                },
                [
                  h(
                    'span',
                    {
                      'aria-hidden': 'true',
                      class: ['text-center leading-relaxed select-none', tone[props.type]],
                    },
                    glyph[props.type],
                  ),
                  h(GraphProse, { class: 'text-foreground' }, slots.default),
                ],
              ),
              [[vReveal]],
            ),
          ]),
      )
  },
})
