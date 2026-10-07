/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { StateListItem } from '../core/state-list.js'
import type { GraphPalette } from '../core/motion.js'
import { toneClass } from '../core/motion.js'
import type { DiffRow, DiffSign, DiffLineProps } from '../core/gantt-diff-waterfall.js'
import { diffFromList } from '../core/gantt-diff-waterfall.js'
import { diffList, Line } from '../adapters/gantt-diff-waterfall.js'
import { metricItems } from '../adapters/stat-slope-bullet.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphRule } from './graph-frame.js'
export interface GraphDiffProps {
  title: string
  rows?: readonly DiffRow[] | null
  footer?: DiffRow | null
  list?: readonly StateListItem[] | null
  palette?: GraphPalette
  corner?: string
  className?: string
}
const signGlyph: Record<DiffSign, string> = { add: '+', remove: '-', keep: ' ' }
export const GraphDiff = /* @__PURE__ */ defineComponent({
  name: 'GraphDiff',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    rows: Array as PropType<GraphDiffProps['rows']>,
    footer: Object as PropType<GraphDiffProps['footer']>,
    list: Array as PropType<GraphDiffProps['list']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const nodes = slots.default?.() ?? []
      const listed = props.list != null ? props.list.flatMap(diffFromList) : diffList(nodes)
      const lines =
        listed.length || props.list != null ? listed : metricItems<DiffLineProps>(nodes, Line)
      const rows = props.rows ?? lines.filter((entry) => !entry.total)
      const footer = props.footer ?? lines.find((entry) => entry.total)
      const draw = (row: DiffRow, index: number) => {
        const sign = row.sign ?? 'keep'
        const tone =
          sign === 'add'
            ? toneClass(props.palette, 'primary')
            : sign === 'remove'
              ? toneClass(props.palette, 'secondary')
              : sign === 'keep'
                ? 'text-foreground'
                : toneClass(props.palette, 'empty')
        return withDirectives(
          h('div', { class: 'grid grid-cols-[1.25rem_minmax(0,1fr)_8ch] items-baseline gap-x-3' }, [
            h(
              'span',
              {
                'aria-hidden': 'true',
                class: [
                  'text-center select-none',
                  sign === 'keep' ? toneClass(props.palette, 'empty') : tone,
                ],
              },
              signGlyph[sign],
            ),
            h('span', { class: tone }, row.label ?? ''),
            h('span', { class: ['text-right tabular-nums', tone] }, row.value),
          ]),
          [[vReveal, { delay: Math.min(index, 5) * 40 }]],
        )
      }
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-3' }, () => [
            h(
              'ul',
              { role: 'list', class: 'flex flex-col gap-2' },
              rows.map((row, index) => h('li', { key: row.label ?? '' }, draw(row, index))),
            ),
            footer ? [h(GraphRule), h('div', [draw(footer, 0)])] : null,
          ]),
      )
    }
  },
})
export { Line } from '../adapters/gantt-diff-waterfall.js'
