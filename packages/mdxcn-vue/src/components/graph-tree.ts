/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { TreeNode } from '../core/nested-flow.js'
import { flattenTree } from '../core/nested-flow.js'
import { treeModel } from '../adapters/nested-flow.js'
import { DIM_OPACITY } from '../core/motion.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody } from './graph-frame.js'
export { Node } from '../adapters/nested-flow.js'
export interface GraphTreeProps {
  title: string
  nodes?: readonly TreeNode[] | null
  corner?: string
  className?: string
}
export const GraphTree = /* @__PURE__ */ defineComponent({
  name: 'GraphTree',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    nodes: Array as PropType<GraphTreeProps['nodes']>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const rows = flattenTree(props.nodes ?? treeModel(slots.default?.() ?? []))
      const hasAccent = rows.some((row) => row.accent)
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'graph-scroll-x' }, () => [
            h(
              'ul',
              { role: 'list', class: 'flex min-w-max flex-col gap-1' },
              rows.map((row, index) =>
                withDirectives(
                  h(
                    'li',
                    {
                      key: row.key,
                      class: 'grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6',
                      style: hasAccent && !row.accent ? { opacity: DIM_OPACITY } : undefined,
                    },
                    [
                      h('span', { class: 'whitespace-nowrap' }, [
                        h(
                          'span',
                          { 'aria-hidden': 'true', class: 'text-graph-frame select-none' },
                          row.branch,
                        ),
                        h(
                          'span',
                          { class: row.accent ? 'text-graph-accent' : 'text-foreground' },
                          row.label,
                        ),
                      ]),
                      row.meta
                        ? h('span', { class: 'text-graph-muted tabular-nums' }, row.meta)
                        : h('span'),
                    ],
                  ),
                  [[vReveal, { delay: Math.min(index, 6) * 40 }]],
                ),
              ),
            ),
            h('span', { class: 'sr-only' }, `Tree with ${rows.length} nodes`),
          ]),
      )
    }
  },
})
