/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { CellGrid } from '../core/grid-fraction.js'
import type { Glyphs, GraphPalette } from '../core/motion.js'
import { isMonoPalette, seriesClass, trackMarks } from '../core/motion.js'
import { cellsModel } from '../adapters/grid-fraction.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody } from './graph-frame.js'
export { Grid } from '../adapters/grid-fraction.js'
export interface GraphCellsProps {
  title: string
  items?: readonly CellGrid[] | null
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphCells = /* @__PURE__ */ defineComponent({
  name: 'GraphCells',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    items: Array as PropType<GraphCellsProps['items']>,
    glyphs: [String, Array] as PropType<Glyphs>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const items = props.items ?? cellsModel(slots.default?.() ?? [])
      const marks = trackMarks(props.glyphs, { empty: '·', rest: '░', fill: '█' })
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, {}, () =>
            h(
              'div',
              {
                class:
                  '@container flex flex-col items-center gap-10 @min-[28rem]:flex-row @min-[28rem]:justify-center @min-[28rem]:gap-12',
              },
              items.map((item, itemIndex) =>
                h('div', { class: 'flex flex-col items-center gap-4', key: itemIndex }, [
                  h(
                    'div',
                    { 'aria-hidden': 'true', class: 'flex flex-col gap-1' },
                    item.cells.map((row, rowIndex) =>
                      h(
                        'div',
                        { class: 'flex gap-1', key: rowIndex },
                        row.map((cell, cellIndex) => {
                          const filled = cell === 1
                          const node = h(
                            'span',
                            {
                              key: cellIndex,
                              class: [
                                'w-[1ch] text-center select-none',
                                filled
                                  ? isMonoPalette(props.palette)
                                    ? 'text-graph-accent'
                                    : seriesClass(props.palette, itemIndex)
                                  : 'text-graph-frame',
                              ],
                            },
                            filled ? marks.fill : marks.empty,
                          )
                          return filled
                            ? withDirectives(node, [
                                [
                                  vReveal,
                                  {
                                    delay: Math.min(
                                      240,
                                      (itemIndex * 8 + rowIndex * 5 + cellIndex) * 30,
                                    ),
                                  },
                                ],
                              ])
                            : node
                        }),
                      ),
                    ),
                  ),
                  h(
                    'p',
                    {
                      class: isMonoPalette(props.palette)
                        ? 'text-graph-muted'
                        : seriesClass(props.palette, itemIndex),
                    },
                    item.label,
                  ),
                ]),
              ),
            ),
          ),
      )
    }
  },
})
