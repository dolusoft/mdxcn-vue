/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import { childItems, defineItem } from '../adapters/items.js'
import { stateList } from '../adapters/state-list.js'
import { changeFromList } from '../core/state-list.js'
import type { ChangeType, StateListItem } from '../core/state-list.js'
import type { GraphPalette } from '../core/motion.js'
import { toneClass } from '../core/motion.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphProse, GraphRule } from './graph-frame.js'

export interface ChangeProps {
  type?: ChangeType
}
export interface ChangelogProps {
  version: string
  date?: string
  title?: string
  /** Compiler input; runtime authors use lists or Change slots. */
  list?: readonly StateListItem[] | null
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const Change = /* @__PURE__ */ defineItem<ChangeProps>('Change', {
  type: { type: 'string', default: 'change' },
})
const glyph = { add: '+', change: '~', fix: '*', remove: '-' }
const label = { add: 'added', change: 'changed', fix: 'fixed', remove: 'removed' }
export const Changelog = /* @__PURE__ */ defineComponent({
  name: 'Changelog',
  inheritAttrs: false,
  props: {
    version: { type: String, required: true },
    date: String,
    title: String,
    list: Array as PropType<ChangelogProps['list']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const nodes = slots.default?.() ?? []
      const listed = stateList(nodes)
      const changes =
        props.list != null
          ? props.list.map(changeFromList)
          : listed.length
            ? listed.map((item) => changeFromList(item.description))
            : childItems(nodes, Change).map((item) => ({
                type: (item.props.type ?? 'change') as ChangeType,
                body: item.children,
              }))
      return h(
        Graph,
        mergeProps(
          { title: props.title ?? props.version, corner: props.corner, className: props.className },
          attrs,
        ),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-4' }, () => [
            ...(props.date || props.title
              ? [
                  h('div', { class: 'flex items-baseline justify-between gap-4' }, [
                    h(
                      'span',
                      { class: 'text-foreground tabular-nums' },
                      props.title ? props.version : '',
                    ),
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
              changes.map((change, index) => {
                const type = change.type
                const tone =
                  type === 'add'
                    ? toneClass(props.palette, 'primary')
                    : type === 'remove'
                      ? toneClass(props.palette, 'secondary')
                      : 'text-foreground'
                return withDirectives(
                  h(
                    'li',
                    {
                      class:
                        'grid grid-cols-[1.25rem_5.5rem_minmax(0,1fr)] items-baseline gap-x-3 max-sm:grid-cols-[1.25rem_minmax(0,1fr)]',
                      key: index,
                    },
                    [
                      h(
                        'span',
                        { 'aria-hidden': 'true', class: ['text-center select-none', tone] },
                        glyph[type],
                      ),
                      h('span', { class: 'text-graph-muted max-sm:hidden' }, label[type]),
                      h(
                        GraphProse,
                        { class: type === 'remove' ? 'text-graph-muted' : 'text-foreground' },
                        () => change.body,
                      ),
                    ],
                  ),
                  [[vReveal, { delay: Math.min(index, 5) * 50 }]],
                )
              }),
            ),
          ]),
      )
    }
  },
})
