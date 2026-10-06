/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, isVNode, mergeProps, withDirectives } from 'vue'
import type { PropType, VNode } from 'vue'
import type { ProseNode } from '../core/model.js'
import type { GraphPalette } from '../core/motion.js'
import { toneClass } from '../core/motion.js'
import type { AnnotateData, AnnotateNote } from '../adapters/annotate.js'
import { annotateModel } from '../adapters/annotate.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphProse, GraphRule } from './graph-frame.js'

export interface AnnotateProps extends AnnotateData {
  title?: string
  palette?: GraphPalette
  corner?: string
  className?: string
}
function noteBody(note: AnnotateNote) {
  if (Array.isArray(note) && note.length && !isVNode(note[0]))
    return h(GraphProse, { class: 'text-foreground', nodes: note as ProseNode[] })
  return h(GraphProse, { class: 'text-foreground' }, () => note)
}
const reveal = (node: VNode, delay = 0) => withDirectives(node, [[vReveal, { delay }]])

export const Annotate = defineComponent({
  name: 'Annotate',
  inheritAttrs: false,
  props: {
    title: String,
    code: String as PropType<AnnotateData['code']>,
    notes: Array as PropType<AnnotateData['notes']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const model = annotateModel(props, slots.default?.() ?? [])
      const marked = new Set(model.lines.flatMap((line) => line.mark ?? []))
      const width = Math.max(
        1,
        ...[...marked, model.notes.length].map(String).map((value) => value.length),
      )
      const tag = (index: number) => `[${String(index).padStart(width, ' ')}]`
      const accent = toneClass(props.palette, 'primary')
      return h(
        Graph,
        mergeProps(
          {
            title: props.title ?? model.language ?? 'code',
            corner: props.corner,
            className: props.className,
          },
          attrs,
        ),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-5' }, () => [
            reveal(
              h('div', { class: 'graph-scroll-x' }, [
                h(
                  'pre',
                  { class: 'm-0 flex min-w-max flex-col gap-0.5 leading-relaxed whitespace-pre' },
                  model.lines.map((line, index) =>
                    h(
                      'code',
                      {
                        key: index,
                        class: [
                          'grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3',
                          line.mark ? 'text-foreground' : 'text-graph-muted',
                        ],
                      },
                      [
                        h(
                          'span',
                          {
                            'aria-hidden': 'true',
                            class: [
                              'tabular-nums select-none',
                              line.mark ? accent : 'text-transparent',
                            ],
                          },
                          line.mark ? tag(line.mark) : ' ',
                        ),
                        h('span', line.text || ' '),
                      ],
                    ),
                  ),
                ),
              ]),
            ),
            ...(model.notes.length
              ? [
                  h(GraphRule),
                  h(
                    'ol',
                    { role: 'list', class: 'flex flex-col gap-3' },
                    model.notes.map((note, index) =>
                      reveal(
                        h(
                          'li',
                          {
                            key: index,
                            class: 'grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3',
                          },
                          [
                            h(
                              'span',
                              {
                                'aria-hidden': 'true',
                                class: [
                                  'tabular-nums select-none',
                                  marked.has(index + 1) ? accent : 'text-graph-muted',
                                ],
                              },
                              tag(index + 1),
                            ),
                            noteBody(note),
                          ],
                        ),
                        Math.min(index, 5) * 50,
                      ),
                    ),
                  ),
                ]
              : []),
          ]),
      )
    }
  },
})
