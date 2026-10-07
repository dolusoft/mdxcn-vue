/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import { buildWeeks, activityMonths } from '../core/dated-calendar.js'
import type { ActivityDay } from '../core/dated-calendar.js'
import { intensityClass, intensityGlyph, intensityLevel, resolveGlyphs } from '../core/motion.js'
import type { Glyphs, GraphPalette } from '../core/motion.js'
import { activityModel } from '../adapters/dated-calendar.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody } from './graph-frame.js'
export interface GraphActivityProps {
  title: string
  days?: readonly ActivityDay[] | null
  weekStartsOn?: 0 | 1 | '0' | '1'
  max?: number | string
  legend?: boolean
  caption?: string | false | null
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphActivity = /* @__PURE__ */ defineComponent({
  name: 'GraphActivity',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    days: Array as PropType<GraphActivityProps['days']>,
    weekStartsOn: { type: [Number, String] as PropType<0 | 1 | '0' | '1'>, default: 0 },
    max: [Number, String],
    legend: { type: Boolean, default: true },
    caption: {
      type: [String, Boolean] as PropType<GraphActivityProps['caption']>,
      default: undefined,
    },
    glyphs: [String, Array] as PropType<Glyphs>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      // A static template attribute (`week-starts-on="1"`) arrives as a string.
      const weekStart = (
        typeof props.weekStartsOn === 'string' ? Number(props.weekStartsOn) : props.weekStartsOn
      ) as 0 | 1
      const days = props.days ?? activityModel(slots.default?.() ?? []),
        weeks = buildWeeks(days, weekStart),
        months = activityMonths(weeks)
      const labels =
        weekStart === 1 ? ['M', '', 'W', '', 'F', '', ''] : ['', 'M', '', 'W', '', 'F', '']
      const peak =
        props.max == null ? Math.max(0, ...days.map((day) => day.count), 0) : Number(props.max)
      const total = days.reduce((sum, day) => sum + day.count, 0),
        set = resolveGlyphs(props.glyphs),
        quiet = set[0] ?? '·'
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-4' }, () => [
            h('div', { class: 'scrollbar-graph overflow-x-auto' }, [
              h(
                'div',
                {
                  class: 'flex w-full flex-col gap-1 pr-[2ch]',
                  style: { minWidth: `max(100%, ${weeks.length + 4}ch)` },
                },
                [
                  h('div', { class: 'flex h-[1.25em] w-full' }, [
                    h('span', { class: 'w-[2ch] shrink-0' }),
                    ...months.map((month, index) =>
                      h(
                        'span',
                        { class: 'relative min-w-[1ch] flex-1', key: index },
                        month
                          ? [
                              h(
                                'span',
                                {
                                  class:
                                    'absolute bottom-0 left-0 whitespace-nowrap text-graph-muted',
                                },
                                month,
                              ),
                            ]
                          : [],
                      ),
                    ),
                  ]),
                  h('div', { class: 'flex w-full' }, [
                    h(
                      'div',
                      { class: 'flex w-[2ch] shrink-0 flex-col' },
                      labels.map((label, index) =>
                        h(
                          'span',
                          { class: 'flex h-[1.15em] items-center text-graph-muted', key: index },
                          label,
                        ),
                      ),
                    ),
                    h(
                      'div',
                      { class: 'flex flex-1' },
                      weeks.map((week, index) =>
                        withDirectives(
                          h(
                            'div',
                            { class: 'flex min-w-[1ch] flex-1 flex-col', key: week[0]?.date },
                            week.map((cell) => {
                              const level = cell.inRange ? intensityLevel(cell.count, peak) : 0
                              return h(
                                'span',
                                {
                                  'aria-hidden': 'true',
                                  class: [
                                    'flex h-[1.15em] w-full items-center justify-center leading-none select-none',
                                    cell.inRange
                                      ? intensityClass(level, props.palette)
                                      : 'text-transparent',
                                  ],
                                  key: cell.date,
                                },
                                cell.inRange ? intensityGlyph(level, set) : quiet,
                              )
                            }),
                          ),
                          [[vReveal, { delay: Math.min(240, index * 10) }]],
                        ),
                      ),
                    ),
                  ]),
                ],
              ),
            ]),
            props.caption === false && !props.legend
              ? null
              : h(
                  'div',
                  {
                    class: [
                      'flex flex-wrap items-center gap-3',
                      props.caption === false ? 'justify-end' : 'justify-between',
                    ],
                  },
                  [
                    props.caption === false
                      ? null
                      : h(
                          'p',
                          { class: 'text-graph-muted tabular-nums' },
                          props.caption ?? `${total.toLocaleString('en-US')} contributions`,
                        ),
                    props.legend
                      ? h('p', { class: 'flex items-center gap-2 text-graph-muted' }, [
                          h('span', 'Less'),
                          h(
                            'span',
                            { 'aria-hidden': 'true', class: 'flex select-none' },
                            set.map((glyph, index) =>
                              h(
                                'span',
                                {
                                  class: [
                                    'w-[1ch] text-center',
                                    intensityClass(
                                      Math.round((index / Math.max(set.length - 1, 1)) * 4),
                                      props.palette,
                                    ),
                                  ],
                                  key: index,
                                },
                                glyph,
                              ),
                            ),
                          ),
                          h('span', 'More'),
                        ])
                      : null,
                  ],
                ),
            h(
              'span',
              { class: 'sr-only' },
              `${total} contributions across ${days.length} days${props.caption ? `. ${props.caption}` : ''}`,
            ),
          ]),
      )
    }
  },
})
