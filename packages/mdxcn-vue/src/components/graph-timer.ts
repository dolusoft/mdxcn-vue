/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import { formatAgo, formatClock, formatHms, parseInstant } from '../core/clock'
import { splitDash } from '../core/markdown'
import type { GraphPalette } from '../core/motion'
import { toneClass } from '../core/motion'
import { textOf } from '../adapters/items'
import { useGraphNow } from '../composables/graph-now'
import { vReveal } from '../directives/reveal'
import { Graph, GraphBody } from './graph-frame'

export type TimerKind = 'elapsed' | 'ago' | 'clock'
export interface GraphTimerProps {
  title: string
  kind?: TimerKind
  at?: Date | number | string | null
  caption?: string | null
  palette?: GraphPalette
  corner?: string
  className?: string
}
export const GraphTimer = defineComponent({
  name: 'GraphTimer',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    kind: { type: String as PropType<TimerKind>, default: 'elapsed' },
    at: [Date, Number, String] as PropType<GraphTimerProps['at']>,
    caption: String as PropType<GraphTimerProps['caption']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    const now = useGraphNow()
    return () => {
      const written = splitDash(
        textOf(slots.default?.() ?? [])
          .replace(/\s+/g, ' ')
          .trim(),
      )
      const at = props.at ?? (written.label || undefined)
      const caption = props.caption ?? (written.rest || undefined)
      const origin = at == null ? Number.NaN : parseInstant(at)
      let value = props.kind === 'ago' ? '0s ago' : '00:00:00'
      let spoken = 'timer'
      if (now.value != null) {
        if (props.kind === 'clock') {
          value = formatClock(now.value)
          spoken = `local time ${value}`
        } else if (Number.isFinite(origin)) {
          const elapsed = Math.max(0, now.value - origin)
          value = props.kind === 'ago' ? formatAgo(elapsed) : formatHms(elapsed)
          spoken = props.kind === 'ago' ? value : `elapsed ${value}`
        }
      }
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
                    class: `text-3xl tracking-tight tabular-nums sm:text-4xl ${toneClass(props.palette, 'primary')}`,
                  },
                  value,
                ),
                caption ? h('p', { class: 'text-graph-muted' }, caption) : null,
              ]),
              [[vReveal]],
            ),
            h('span', { class: 'sr-only' }, spoken),
          ]),
      )
    }
  },
})
