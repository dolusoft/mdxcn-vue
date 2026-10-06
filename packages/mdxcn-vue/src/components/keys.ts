/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { KeyBinding } from '../core/chat-keys.js'
import { bindingFromList, chordsOf } from '../core/chat-keys.js'
import { stateList } from '../adapters/state-list.js'
import type { GraphPalette } from '../core/motion.js'
import { toneClass } from '../core/motion.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody } from './graph-frame.js'

export interface KeysProps {
  title?: string
  bindings?: readonly KeyBinding[] | null
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const Keys = defineComponent({
  name: 'Keys',
  inheritAttrs: false,
  props: {
    title: { type: String, default: 'keys' },
    bindings: Array as PropType<KeysProps['bindings']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const bindings =
        props.bindings ??
        stateList(slots.default?.() ?? []).map((item) => bindingFromList(item.description))
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, null, () =>
            h(
              'dl',
              { class: 'flex flex-col gap-3' },
              bindings.map((binding, index) => {
                const tone = binding.accent
                  ? toneClass(props.palette, 'primary')
                  : 'text-foreground'
                return withDirectives(
                  h(
                    'div',
                    {
                      key: `${binding.keys}-${index}`,
                      class:
                        'grid grid-cols-[minmax(0,13rem)_minmax(0,1fr)] items-baseline gap-x-3 sm:gap-x-6',
                    },
                    [
                      h('dt', { class: 'flex flex-wrap items-baseline gap-x-2 gap-y-1' }, [
                        h('span', { class: 'sr-only' }, binding.keys),
                        ...chordsOf(binding.keys).map((chord, chordIndex) =>
                          h(
                            'span',
                            {
                              key: chordIndex,
                              'aria-hidden': 'true',
                              class: 'flex items-baseline gap-x-2 select-none',
                            },
                            [
                              chordIndex > 0
                                ? h('span', { class: 'text-graph-muted' }, 'then')
                                : null,
                              h(
                                'span',
                                { class: 'flex items-baseline' },
                                chord.map((key, keyIndex) =>
                                  h('span', { key: keyIndex, class: 'whitespace-nowrap' }, [
                                    h('span', { class: 'text-graph-frame' }, '['),
                                    h('span', { class: tone }, key),
                                    h('span', { class: 'text-graph-frame' }, ']'),
                                  ]),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ]),
                      h('dd', { class: tone }, binding.action),
                    ],
                  ),
                  [[vReveal, { delay: Math.min(index, 5) * 40 }]],
                )
              }),
            ),
          ),
      )
    }
  },
})
