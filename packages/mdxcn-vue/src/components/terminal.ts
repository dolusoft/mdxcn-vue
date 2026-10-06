/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { PropType } from 'vue'
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import { terminalModel } from '../adapters/terminal.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody } from './graph-frame.js'

export interface TerminalProps {
  title?: string
  prompt?: string
  /** Compiler input; an explicit empty string suppresses slot text. */
  text?: string | null
  corner?: string
  className?: string
}
const tone = {
  command: 'text-foreground',
  comment: 'text-graph-muted',
  ok: 'text-graph-accent',
  output: 'text-graph-muted',
}
export const Terminal = defineComponent({
  name: 'Terminal',
  inheritAttrs: false,
  props: {
    title: { type: String, default: 'shell' },
    prompt: { type: String, default: '$' },
    text: String as PropType<TerminalProps['text']>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const lines = terminalModel(props.text, slots.default?.() ?? [], props.prompt)
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'graph-scroll-x' }, () =>
            h(
              'pre',
              { class: 'm-0 flex min-w-max flex-col gap-0.5 leading-relaxed whitespace-pre' },
              lines.map((line, index) =>
                withDirectives(
                  h(
                    'code',
                    {
                      key: `${index}-${line.text}`,
                      class: ['grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-2', tone[line.kind]],
                    },
                    [
                      h(
                        'span',
                        {
                          'aria-hidden': 'true',
                          class: [
                            'text-center select-none',
                            line.kind === 'command' ? 'text-graph-accent' : 'text-transparent',
                          ],
                        },
                        line.kind === 'command' ? props.prompt : ' ',
                      ),
                      h('span', line.text || ' '),
                    ],
                  ),
                  [[vReveal, { delay: Math.min(index, 5) * 40 }]],
                ),
              ),
            ),
          ),
      )
    }
  },
})
