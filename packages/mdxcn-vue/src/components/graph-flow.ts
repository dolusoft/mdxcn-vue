/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { FlowRow, FlowTone } from '../core/nested-flow.js'
import { flowModel } from '../adapters/nested-flow.js'
import type { GraphPalette } from '../core/motion.js'
import { toneClass } from '../core/motion.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody } from './graph-frame.js'
export { Path } from '../adapters/nested-flow.js'
export interface GraphFlowProps {
  title: string
  rows?: readonly FlowRow[] | null
  palette?: GraphPalette
  corner?: string
  className?: string
}
/** Upstream GraphArrow is local to this family; arrows are decorative. */
function arrow(accent: boolean, stretch?: boolean) {
  return h(
    'div',
    {
      'aria-hidden': 'true',
      class: [
        'flex min-w-6 items-center gap-1',
        stretch && 'min-w-10 flex-1',
        accent ? 'text-graph-accent' : 'text-graph-frame',
      ],
    },
    [
      stretch
        ? h('span', { class: 'h-px min-w-6 flex-1 border-t border-dashed border-current' })
        : h('span', '- - -'),
      h('span', { class: 'shrink-0' }, '▶'),
    ],
  )
}
export const GraphFlow = defineComponent({
  name: 'GraphFlow',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    rows: Array as PropType<GraphFlowProps['rows']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const rows = props.rows ?? flowModel(slots.default?.() ?? [])
      const tones: Record<FlowTone, string> = {
        default: 'text-foreground',
        accent: toneClass(props.palette, 'primary'),
        muted: toneClass(props.palette, 'secondary'),
      }
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-7' }, () =>
            h(
              'div',
              { class: 'flex flex-col gap-7' },
              rows.map((row, index) =>
                withDirectives(
                  h(
                    'div',
                    {
                      key: index,
                      class: 'flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap',
                    },
                    row.nodes.map((node, nodeIndex) =>
                      h(
                        'div',
                        {
                          key: `${node.label}-${nodeIndex}`,
                          class: [
                            'flex min-w-0 items-center gap-3',
                            node.stretch && 'min-w-16 flex-1',
                          ],
                        },
                        [
                          nodeIndex > 0 ? arrow(node.tone === 'accent', node.stretch) : null,
                          h(
                            'span',
                            {
                              class: ['shrink-0 whitespace-nowrap', tones[node.tone ?? 'default']],
                            },
                            node.label,
                          ),
                        ],
                      ),
                    ),
                  ),
                  [[vReveal, { delay: Math.min(index, 6) * 40 }]],
                ),
              ),
            ),
          ),
      )
    }
  },
})
