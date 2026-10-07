/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import { fraction } from '../core/grid-fraction.js'
import type { FractionData } from '../core/grid-fraction.js'
import type { Glyphs, GraphPalette } from '../core/motion.js'
import { toneClass, trackMarks } from '../core/motion.js'
import { fractionModel } from '../adapters/grid-fraction.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphTrack, GraphTick } from './graph-frame.js'
export interface GraphMeterProps {
  title: string
  value?: number | string | null
  ticks?: number | string
  caption?: string | null
  written?: FractionData | null
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphMeter = defineComponent({
  name: 'GraphMeter',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    value: [Number, String] as PropType<GraphMeterProps['value']>,
    ticks: { type: [Number, String], default: 14 },
    caption: String as PropType<GraphMeterProps['caption']>,
    written: Object as PropType<GraphMeterProps['written']>,
    glyphs: [String, Array] as PropType<Glyphs>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const written = props.written ?? fractionModel(slots.default?.() ?? [])
      const value = Math.min(1, Math.max(0, fraction(props.value ?? written.token)))
      const caption = props.caption ?? (props.value == null ? written.caption : undefined)
      const ticks = Number(props.ticks),
        filled = Math.round(value * ticks),
        percent = Math.round(value * 100)
      const marks = trackMarks(props.glyphs, { empty: '-', rest: '=', fill: '=' })
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-4' }, () => [
            h('p', { class: 'flex w-full items-center gap-3 tabular-nums' }, [
              h('span', { 'aria-hidden': 'true', class: 'text-graph-frame select-none' }, '['),
              h(GraphTrack, {}, () =>
                Array.from({ length: ticks }, (_, index) => {
                  const isFilled = index < filled
                  return h(
                    GraphTick,
                    {
                      key: index,
                      class: isFilled ? toneClass(props.palette, 'primary') : 'text-graph-frame',
                    },
                    () => {
                      const node = h(
                        'span',
                        { class: 'block w-full' },
                        isFilled ? marks.fill : marks.empty,
                      )
                      return isFilled
                        ? withDirectives(node, [[vReveal, { delay: Math.min(240, index * 30) }]])
                        : node
                    },
                  )
                }),
              ),
              h('span', { 'aria-hidden': 'true', class: 'text-graph-frame select-none' }, ']'),
              h(
                'span',
                { class: ['w-[4ch] shrink-0 text-right', toneClass(props.palette, 'primary')] },
                `${percent}%`,
              ),
            ]),
            caption ? h('p', { class: 'text-graph-muted' }, caption) : null,
            h('span', { class: 'sr-only' }, `${percent} percent${caption ? ` ${caption}` : ''}`),
          ]),
      )
    }
  },
})
