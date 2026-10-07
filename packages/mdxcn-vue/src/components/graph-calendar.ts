/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import { calendarWeeks, MONTH_NAMES } from '../core/dated-calendar.js'
import type { CalendarMark, CalendarWrittenMark } from '../core/dated-calendar.js'
import { numbers } from '../core/markdown.js'
import { toneClass, isMonoPalette } from '../core/motion.js'
import type { GraphPalette } from '../core/motion.js'
import { calendarModel } from '../adapters/dated-calendar.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphRule } from './graph-frame.js'
export interface GraphCalendarProps {
  title?: string
  year: number | string
  month: number | string
  weekStartsOn?: 0 | 1
  marks?: readonly CalendarMark[] | readonly number[] | string | null
  today?: number | string | null
  written?: readonly CalendarWrittenMark[] | null
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphCalendar = defineComponent({
  name: 'GraphCalendar',
  inheritAttrs: false,
  props: {
    title: String,
    year: { type: [Number, String], required: true },
    month: { type: [Number, String], required: true },
    weekStartsOn: { type: Number as PropType<0 | 1>, default: 1 },
    marks: [Array, String] as PropType<GraphCalendarProps['marks']>,
    today: [Number, String] as PropType<GraphCalendarProps['today']>,
    written: Array as PropType<GraphCalendarProps['written']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const listed = props.written ?? calendarModel(slots.default?.() ?? []),
        marks =
          typeof props.marks === 'string'
            ? numbers(props.marks)
            : (props.marks ?? (listed.length ? listed : []))
      const today =
        props.today == null ? listed.find((mark) => mark.today)?.day : Number(props.today)
      const notes = marks
        .filter((mark): mark is CalendarMark => typeof mark !== 'number')
        .filter((mark) => mark.label)
        .sort((a, b) => a.day - b.day)
      const highlighted = new Map<number, boolean>()
      for (const mark of marks)
        highlighted.set(
          typeof mark === 'number' ? mark : mark.day,
          typeof mark === 'number' ? true : (mark.accent ?? true),
        )
      const year = Number(props.year),
        month = Number(props.month),
        weeks = calendarWeeks(year, month, props.weekStartsOn),
        monthName = MONTH_NAMES[month - 1]
      const headers =
        props.weekStartsOn === 1
          ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
          : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
      return h(
        Graph,
        mergeProps(
          {
            title: props.title ?? `${monthName} ${year}`,
            corner: props.corner,
            className: props.className,
          },
          attrs,
        ),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-3' }, () => [
            h(
              'div',
              { 'aria-hidden': 'true', class: 'grid grid-cols-7 justify-items-center' },
              headers.map((header, index) =>
                h('span', { class: 'w-[4ch] text-center text-graph-muted', key: index }, header),
              ),
            ),
            h(
              'div',
              { 'aria-hidden': 'true', class: 'flex flex-col gap-1' },
              weeks.map((week, index) =>
                withDirectives(
                  h(
                    'div',
                    { class: 'grid grid-cols-7 justify-items-center', key: index },
                    week.map((day, dayIndex) => {
                      const inMonth = day != null,
                        accent = inMonth && highlighted.get(day) === true,
                        isToday = inMonth && today === day
                      return h(
                        'span',
                        {
                          class: [
                            'w-[4ch] text-center tabular-nums',
                            !inMonth && 'text-transparent',
                            inMonth && !accent && !isToday && 'text-foreground',
                            accent && toneClass(props.palette, 'primary'),
                            isToday &&
                              !accent &&
                              toneClass(
                                props.palette,
                                isMonoPalette(props.palette) ? 'primary' : 'secondary',
                              ),
                          ],
                          key: dayIndex,
                        },
                        inMonth ? (isToday ? `[${day}]` : String(day)) : '\u00a0',
                      )
                    }),
                  ),
                  [[vReveal, { delay: Math.min(240, index * 40) }]],
                ),
              ),
            ),
            ...(notes.length
              ? [
                  h(GraphRule, { class: 'mt-2' }),
                  h(
                    'ul',
                    { class: 'flex flex-col gap-2', role: 'list' },
                    notes.map((mark, index) =>
                      withDirectives(
                        h(
                          'li',
                          {
                            class: 'grid grid-cols-[4ch_minmax(0,1fr)] items-baseline gap-x-3',
                            key: index,
                          },
                          [
                            h(
                              'span',
                              {
                                class: [
                                  'text-right tabular-nums',
                                  mark.accent === false
                                    ? 'text-foreground'
                                    : toneClass(props.palette, 'primary'),
                                ],
                              },
                              mark.day === today ? `[${mark.day}]` : String(mark.day),
                            ),
                            h('span', { class: 'text-foreground' }, mark.label),
                          ],
                        ),
                        [[vReveal, { delay: Math.min(240, index * 40) }]],
                      ),
                    ),
                  ),
                ]
              : []),
            h(
              'span',
              { class: 'sr-only' },
              `${monthName ?? ''} ${year}${today ? `, today ${today}` : ''}${highlighted.size > 0 ? `, marked ${[...highlighted.keys()].join(', ')}` : ''}`,
            ),
          ]),
      )
    }
  },
})
