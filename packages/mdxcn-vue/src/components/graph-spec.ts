/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { SpecRow, SpecLine } from '../adapters/timeline-spec.js'
import { specModel } from '../adapters/timeline-spec.js'
import type { StateListItem } from '../core/state-list.js'
import { specFromList } from '../core/timeline-spec.js'
import { proseParagraphs } from '../adapters/state-list.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphProse, renderProse } from './graph-frame.js'
export { Field } from '../adapters/timeline-spec.js'
export interface GraphSpecProps {
  title: string
  rows?: readonly SpecRow[] | null
  /** Compiler input; runtime authors use lists or Field slots. */
  list?: readonly StateListItem[] | null
  corner?: string
  className?: string
}
export const GraphSpec = defineComponent({
  name: 'GraphSpec',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    rows: Array as PropType<GraphSpecProps['rows']>,
    list: Array as PropType<GraphSpecProps['list']>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const rows: readonly SpecLine[] =
        props.rows ??
        (props.list != null
          ? props.list.map((item) => {
              const model = specFromList(item)
              return {
                ...model,
                rich: model.rich ? renderProse(model.rich) : undefined,
                note: model.note ? proseParagraphs(model.note) : undefined,
              }
            })
          : specModel(slots.default?.() ?? []))
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, null, () =>
            h(
              'dl',
              { class: 'flex flex-col gap-3' },
              rows.map((row, index) => {
                const color = row.accent ? 'text-graph-accent' : 'text-foreground'
                return withDirectives(
                  h(
                    'div',
                    {
                      key: index,
                      class:
                        'grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] items-baseline gap-x-3 sm:gap-x-6',
                    },
                    [
                      h('dt', { class: 'text-graph-muted' }, row.label),
                      h('dd', { class: 'flex min-w-0 flex-col gap-1' }, [
                        row.rich
                          ? h(
                              GraphProse,
                              { class: ['tabular-nums [overflow-wrap:anywhere]', color] },
                              () => h('span', [row.rich]),
                            )
                          : h('span', { class: ['tabular-nums', color] }, row.value ?? ''),
                        row.note
                          ? h(GraphProse, { class: 'text-graph-muted' }, () => row.note)
                          : null,
                      ]),
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
