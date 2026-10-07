/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import { formatHms, parseInstant } from '../core/clock.js'
import type { CountdownWritten } from '../core/uptime-countdown.js'
import type { GraphPalette } from '../core/motion.js'
import { toneClass } from '../core/motion.js'
import { countdownModel } from '../adapters/uptime-countdown.js'
import { useGraphNow } from '../composables/graph-now.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody } from './graph-frame.js'
export interface GraphCountdownProps {
  title: string
  to?: Date | number | string | null
  done?: string
  caption?: string | null
  written?: CountdownWritten | null
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphCountdown = /* @__PURE__ */ defineComponent({
  name: 'GraphCountdown',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    to: [Date, Number, String] as PropType<GraphCountdownProps['to']>,
    done: { type: String, default: 'done' },
    caption: String as PropType<GraphCountdownProps['caption']>,
    written: Object as PropType<GraphCountdownProps['written']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    const now = useGraphNow()
    return () => {
      const written = props.written ?? countdownModel(slots.default?.() ?? [])
      const to = props.to ?? written.label
      const caption = props.caption ?? (written.rest || undefined)
      const target = to === '' ? Number.NaN : parseInstant(to, true)
      const remaining = now.value == null || !Number.isFinite(target) ? null : target - now.value
      const finished = remaining != null && remaining <= 0
      const value = remaining == null ? '00:00:00' : finished ? props.done : formatHms(remaining)
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, null, () => [
            withDirectives(
              h('div', { class: 'flex flex-col gap-2' }, [
                h(
                  'p',
                  {
                    class: [
                      'text-3xl tracking-tight tabular-nums sm:text-4xl',
                      finished ? 'text-graph-muted' : toneClass(props.palette, 'primary'),
                    ],
                  },
                  value,
                ),
                caption ? h('p', { class: 'text-graph-muted' }, caption) : null,
              ]),
              [[vReveal, { delay: 0 }]],
            ),
            h('span', { class: 'sr-only' }, finished ? props.done : `remaining ${value}`),
          ]),
      )
    }
  },
})
