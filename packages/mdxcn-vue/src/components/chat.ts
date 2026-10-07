/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { ChatListItem } from '../core/chat-keys.js'
import { chatFromList } from '../core/chat-keys.js'
import type { ChatTurn } from '../adapters/chat.js'
import { chatModel } from '../adapters/chat.js'
import { proseParagraphs } from '../adapters/state-list.js'
import type { GraphPalette } from '../core/motion.js'
import { toneClass } from '../core/motion.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphProse, renderProse } from './graph-frame.js'

export interface ChatProps {
  title?: string
  you?: string
  prompt?: string
  turns?: readonly ChatTurn[] | null
  /** Compiler input; runtime lists come from the default slot. */
  list?: readonly ChatListItem[] | null
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const Chat = /* @__PURE__ */ defineComponent({
  name: 'Chat',
  inheritAttrs: false,
  props: {
    title: { type: String, default: 'chat' },
    you: String,
    prompt: { type: String, default: '>' },
    turns: Array as PropType<ChatProps['turns']>,
    list: Array as PropType<ChatProps['list']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const turns =
        props.turns ??
        (props.list != null
          ? props.list.flatMap(chatFromList).map((turn) => ({
              ...turn,
              children: [...renderProse(turn.head), ...proseParagraphs(turn.body)],
            }))
          : chatModel(slots.default?.() ?? []))
      const asker = (props.you ?? turns[0]?.by ?? '').toLowerCase()
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, null, () =>
            h(
              'ol',
              { class: 'flex flex-col', role: 'list' },
              turns.map((turn, index) => {
                const mine = turn.by.toLowerCase() === asker
                const same = index > 0 && turns[index - 1]?.by === turn.by
                return withDirectives(
                  h(
                    'li',
                    {
                      key: `${index}-${turn.by}`,
                      class: [
                        'grid grid-cols-[1.25rem_minmax(0,7rem)_minmax(0,1fr)] items-baseline gap-x-3 max-sm:grid-cols-[1.25rem_minmax(0,1fr)]',
                        index > 0 ? (same ? 'mt-1' : 'mt-4') : '',
                      ],
                    },
                    [
                      h(
                        'span',
                        {
                          'aria-hidden': 'true',
                          class: [
                            'text-center select-none',
                            mine && !same
                              ? toneClass(props.palette, 'primary')
                              : 'text-transparent',
                          ],
                        },
                        mine && !same ? props.prompt : ' ',
                      ),
                      h(
                        'span',
                        { class: ['truncate text-graph-muted', same ? 'max-sm:hidden' : ''] },
                        same ? h('span', { class: 'sr-only' }, turn.by) : turn.by,
                      ),
                      h(
                        GraphProse,
                        {
                          class: [
                            'max-sm:col-start-2',
                            turn.aside ? 'text-graph-muted' : 'text-foreground',
                          ],
                        },
                        () => turn.children,
                      ),
                    ],
                  ),
                  [[vReveal, { delay: Math.min(index, 5) * 60 }]],
                )
              }),
            ),
          ),
      )
    }
  },
})
