/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType, VNode } from 'vue'
import type { CheckItem } from '../core/nested-flow.js'
import { flattenChecks } from '../core/nested-flow.js'
import { checkModel } from '../adapters/nested-flow.js'
import type { GraphPalette } from '../core/motion.js'
import { toneClass } from '../core/motion.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody } from './graph-frame.js'
export { Task } from '../adapters/nested-flow.js'
export interface GraphCheckProps {
  title: string
  items?: readonly CheckItem[] | null
  palette?: GraphPalette
  corner?: string
  className?: string
}
function checkRow(entry: CheckItem, palette?: GraphPalette): VNode {
  const done = Boolean(entry.done)
  return h('li', { class: 'grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3' }, [
    h(
      'span',
      {
        'aria-hidden': 'true',
        class: ['select-none', done ? toneClass(palette, 'primary') : 'text-graph-muted'],
      },
      done ? '[x]' : '[ ]',
    ),
    h('span', { class: 'flex min-w-0 flex-col gap-1' }, [
      h('span', { class: done ? 'text-foreground' : 'text-graph-muted' }, entry.label),
      entry.note ? h('span', { class: 'text-graph-muted' }, entry.note) : null,
      entry.items?.length
        ? h(
            'ul',
            { class: 'mt-1 flex flex-col gap-2', role: 'list' },
            entry.items.map((child) => checkRow(child, palette)),
          )
        : null,
    ]),
  ])
}
export const GraphCheck = /* @__PURE__ */ defineComponent({
  name: 'GraphCheck',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    items: Array as PropType<GraphCheckProps['items']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const items = props.items ?? checkModel(slots.default?.() ?? [])
      const flat = flattenChecks(items)
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, null, () => [
            h(
              'ul',
              { class: 'flex flex-col gap-2', role: 'list' },
              items.map((entry, index) =>
                withDirectives(checkRow(entry, props.palette), [
                  [vReveal, { delay: Math.min(index, 6) * 40 }],
                ]),
              ),
            ),
            h(
              'span',
              { class: 'sr-only' },
              `${flat.filter((entry) => entry.done).length} of ${flat.length} done`,
            ),
          ]),
      )
    }
  },
})
