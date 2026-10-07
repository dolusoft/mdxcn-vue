/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { EnvVar } from '../core/env.js'
import type { GraphPalette } from '../core/motion.js'
import { toneClass } from '../core/motion.js'
import { envModel } from '../adapters/env.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody } from './graph-frame.js'

export interface EnvProps {
  title?: string
  vars?: readonly EnvVar[] | null
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const Env = /* @__PURE__ */ defineComponent({
  name: 'Env',
  inheritAttrs: false,
  props: {
    title: { type: String, default: '.env' },
    vars: Array as PropType<EnvProps['vars']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const vars = envModel(props.vars, slots.default?.() ?? [])
      const accent = toneClass(props.palette, 'primary')
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-4' }, () => [
            h(
              'ul',
              { role: 'list', class: 'flex flex-col gap-3' },
              vars.map((entry, index) =>
                withDirectives(
                  h(
                    'li',
                    {
                      key: `${entry.name}-${index}`,
                      class:
                        'grid grid-cols-[1.25rem_minmax(0,14rem)_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 max-sm:grid-cols-[1.25rem_minmax(0,1fr)]',
                    },
                    [
                      h(
                        'span',
                        {
                          'aria-hidden': 'true',
                          class: [
                            'text-center select-none',
                            entry.required ? accent : 'text-transparent',
                          ],
                        },
                        entry.required ? '*' : ' ',
                      ),
                      h('span', { class: 'truncate text-foreground' }, [
                        entry.name,
                        entry.required ? h('span', { class: 'sr-only' }, ' (required)') : null,
                      ]),
                      h(
                        'span',
                        {
                          class: [
                            'min-w-0 break-all tabular-nums max-sm:col-start-2',
                            entry.value ? 'text-graph-muted' : 'text-graph-frame',
                          ],
                        },
                        entry.value || '—',
                      ),
                      entry.note
                        ? h(
                            'span',
                            { class: 'col-start-2 text-pretty text-graph-muted sm:col-span-2' },
                            entry.note,
                          )
                        : null,
                    ],
                  ),
                  [[vReveal, { delay: Math.min(index, 5) * 40 }]],
                ),
              ),
            ),
            vars.some((entry) => entry.required)
              ? h('p', { 'aria-hidden': 'true', class: 'text-graph-muted' }, [
                  h('span', { class: accent }, '*'),
                  ' required',
                ])
              : null,
          ]),
      )
    }
  },
})
