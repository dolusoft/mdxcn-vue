/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { TimelineEvent } from '../adapters/timeline-spec.js'
import { timelineModel } from '../adapters/timeline-spec.js'
import type { StateListItem } from '../core/state-list.js'
import { timelineFromList } from '../core/timeline-spec.js'
import type { GraphPalette } from '../core/motion.js'
import { toneClass } from '../core/motion.js'
import { proseParagraphs } from '../adapters/state-list.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphProse } from './graph-frame.js'
export { Event } from '../adapters/timeline-spec.js'
export interface GraphTimelineProps {
  title: string
  events?: readonly TimelineEvent[] | null
  /** Compiler input; runtime authors use lists or Event slots. */
  list?: readonly StateListItem[] | null
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphTimeline = /* @__PURE__ */ defineComponent({
  name: 'GraphTimeline',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    events: Array as PropType<GraphTimelineProps['events']>,
    list: Array as PropType<GraphTimelineProps['list']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const events =
        props.events ??
        (props.list != null
          ? props.list.map((item) => {
              const model = timelineFromList(item)
              return {
                ...model,
                note: Array.isArray(model.note) ? proseParagraphs(model.note) : model.note,
              }
            })
          : timelineModel(slots.default?.() ?? []))
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, null, () =>
            h(
              'ol',
              { class: 'flex flex-col', role: 'list' },
              events.map((event, index) => {
                const state = event.state ?? 'done'
                const live = state === 'now'
                const color = live
                  ? toneClass(props.palette, 'primary')
                  : state === 'next'
                    ? toneClass(props.palette, 'secondary')
                    : 'text-foreground'
                return withDirectives(
                  h('li', { key: index, class: 'flex flex-col' }, [
                    h(
                      'div',
                      {
                        class: 'grid grid-cols-[1.25rem_7rem_minmax(0,1fr)] items-baseline gap-x-4',
                      },
                      [
                        h(
                          'span',
                          {
                            'aria-hidden': 'true',
                            class: ['text-center leading-none select-none', color],
                          },
                          state === 'next' ? '○' : '●',
                        ),
                        h(
                          'span',
                          {
                            class: [
                              'tabular-nums',
                              state === 'next'
                                ? toneClass(props.palette, 'secondary')
                                : 'text-foreground',
                            ],
                          },
                          event.date,
                        ),
                        h('span', { class: 'flex min-w-0 flex-col gap-1' }, [
                          h('span', { class: color }, event.label ?? ''),
                          event.note
                            ? h(GraphProse, { class: 'text-graph-muted' }, () => event.note)
                            : null,
                        ]),
                      ],
                    ),
                    index === events.length - 1
                      ? null
                      : h(
                          'div',
                          {
                            'aria-hidden': 'true',
                            class:
                              'grid grid-cols-[1.25rem_7rem_minmax(0,1fr)] gap-x-4 py-1 select-none',
                          },
                          [h('span', { class: 'text-center text-graph-frame' }, '│')],
                        ),
                  ]),
                  [[vReveal, { delay: Math.min(index, 5) * 50 }]],
                )
              }),
            ),
          ),
      )
    }
  },
})
