/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { StateListItem } from '../core/state-list.js'
import type { StatItem } from '../core/stat-slope-bullet.js'
import { statFromList } from '../core/stat-slope-bullet.js'
import { metricItems, Stat } from '../adapters/stat-slope-bullet.js'
import { numericList } from '../adapters/numeric-list.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody } from './graph-frame.js'
export interface GraphStatProps {
  title: string
  items?: readonly StatItem[] | null
  list?: readonly StateListItem[] | null
  corner?: string
  className?: string
}
export const GraphStat = defineComponent({
  name: 'GraphStat',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    items: Array as PropType<GraphStatProps['items']>,
    list: Array as PropType<GraphStatProps['list']>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const nodes = slots.default?.() ?? []
      const list = props.list ?? numericList(nodes)
      const items =
        props.items ??
        (list.length || props.list != null
          ? list.map(statFromList)
          : metricItems<StatItem>(nodes, Stat))
      const columns = Math.min(Math.max(items.length, 1), 4)
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, null, () =>
            h(
              'ul',
              {
                class: [
                  'grid gap-8',
                  ['sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3', 'sm:grid-cols-4'][
                    columns - 1
                  ],
                ],
                role: 'list',
              },
              items.map((entry, index) =>
                withDirectives(
                  h('li', { key: entry.label ?? index, class: 'flex flex-col gap-2' }, [
                    h(
                      'p',
                      {
                        class: [
                          'text-3xl tracking-tight tabular-nums sm:text-4xl',
                          entry.accent ? 'text-graph-accent' : 'text-foreground',
                        ],
                      },
                      // React renders null, undefined and booleans as nothing.
                      entry.value == null || typeof entry.value === 'boolean'
                        ? ''
                        : String(entry.value),
                    ),
                    h('p', { class: 'text-graph-muted' }, entry.label ?? ''),
                    ...(entry.hint ? [h('p', { class: 'text-graph-muted' }, entry.hint)] : []),
                  ]),
                  [[vReveal, { delay: Math.min(index, 5) * 60 }]],
                ),
              ),
            ),
          ),
      )
    }
  },
})
export { Stat } from '../adapters/stat-slope-bullet.js'
