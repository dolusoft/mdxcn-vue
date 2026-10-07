/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import { childrenOf, flattenNodes, textOf } from '../adapters/items.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphProse } from './graph-frame.js'

export interface FootnotesProps {
  title?: string
  corner?: string
  className?: string
}

/** Preserve host heading IDs, note IDs and backlink VNodes without cloning. */
export const Footnotes = /* @__PURE__ */ defineComponent({
  name: 'Footnotes',
  inheritAttrs: false,
  props: { title: String, corner: String, className: String },
  setup(props, { slots, attrs }) {
    return () => {
      const roots = flattenNodes(slots.default?.() ?? [])
      // VitePress wraps notes in a native section; direct GFM slots are also supported.
      const section = roots.find((node) => node.type === 'section')
      const nodes = section ? childrenOf(section) : roots
      const heading = nodes.find((node) => node.type === 'h2' || node.type === 'h3')
      const notes = nodes
        .filter((node) => node.type === 'ol' || node.type === 'ul')
        .flatMap((node) => childrenOf(node).filter((child) => child.type === 'li'))
      const digits = Math.max(2, String(notes.length).length)
      return h(
        Graph,
        mergeProps(
          {
            title:
              props.title ??
              ((heading ? textOf([heading]).trim().toLowerCase() : '') || 'footnotes'),
            corner: props.corner,
            className: props.className,
          },
          attrs,
        ),
        () =>
          h(GraphBody, null, () => {
            const content = [
              heading,
              h(
                'ol',
                { class: 'flex flex-col gap-3', role: 'list' },
                notes.map((note, index) =>
                  withDirectives(
                    h(
                      'li',
                      {
                        ...note.props,
                        key: note.props?.id ?? index,
                        class: [
                          'grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3',
                          note.props?.class,
                        ],
                      },
                      [
                        h(
                          'span',
                          {
                            'aria-hidden': 'true',
                            class: 'text-graph-muted tabular-nums select-none',
                          },
                          String(index + 1).padStart(digits, '0'),
                        ),
                        h(GraphProse, { class: 'text-foreground/80' }, () => childrenOf(note)),
                      ],
                    ),
                    [[vReveal, { delay: Math.min(index * 40, 240) }]],
                  ),
                ),
              ),
            ]
            return section ? h('section', section.props, content) : content
          }),
      )
    }
  },
})
