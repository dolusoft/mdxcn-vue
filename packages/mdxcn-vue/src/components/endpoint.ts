/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, isVNode, mergeProps, withDirectives } from 'vue'
import type { PropType, VNode } from 'vue'
import type { ProseNode } from '../core/model.js'
import type { GraphPalette } from '../core/motion.js'
import { toneClass } from '../core/motion.js'
import type { EndpointData, EndpointParam } from '../adapters/endpoint.js'
import { endpointModel } from '../adapters/endpoint.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphProse, GraphRule, renderProse } from './graph-frame.js'

export interface EndpointProps extends EndpointData {
  title?: string
  palette?: GraphPalette
  corner?: string
  className?: string
}
function description(value: EndpointParam['description']) {
  if (Array.isArray(value)) {
    if (value.length && !isVNode(value[0]))
      return h(GraphProse, { class: 'text-foreground/80', nodes: value as ProseNode[] })
    return h(GraphProse, { class: 'text-foreground/80' }, () => [...value] as VNode[])
  }
  return h(GraphProse, { class: 'text-foreground/80' }, () => value)
}
const reveal = (node: VNode, delay = 0) => withDirectives(node, [[vReveal, { delay }]])

export const Endpoint = defineComponent({
  name: 'Endpoint',
  inheritAttrs: false,
  props: {
    title: { type: String, default: 'endpoint' },
    method: String as PropType<EndpointData['method']>,
    path: String as PropType<EndpointData['path']>,
    params: Array as PropType<EndpointData['params']>,
    blocks: Array as PropType<EndpointData['blocks']>,
    about: Array as PropType<EndpointData['about']>,
    palette: String as PropType<GraphPalette>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const model = endpointModel(props, slots.default?.() ?? [])
      const accent = toneClass(props.palette, 'primary')
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        ({ captionId }: { captionId?: string } = {}) =>
          h(GraphBody, { class: 'flex flex-col gap-4' }, () => [
            reveal(
              h('div', { class: 'flex flex-col gap-3' }, [
                h('p', { class: 'flex min-w-0 items-baseline gap-3' }, [
                  h('span', { class: `shrink-0 ${accent}` }, model.method),
                  h('span', { class: 'min-w-0 break-all text-foreground' }, model.path),
                ]),
                (props.about ?? model.about).length
                  ? h(GraphProse, { class: 'text-graph-muted' }, () =>
                      props.about != null
                        ? props.about.map((paragraph) => h('p', renderProse(paragraph)))
                        : model.about,
                    )
                  : null,
              ]),
            ),
            ...(model.params.length
              ? [
                  h(GraphRule),
                  h(
                    'ul',
                    { role: 'list', class: 'flex flex-col gap-2' },
                    model.params.map((param, index) =>
                      reveal(
                        h(
                          'li',
                          {
                            key: `${param.name}-${index}`,
                            class:
                              'grid grid-cols-[1.25rem_minmax(0,11rem)_minmax(0,7rem)_minmax(0,1fr)] items-baseline gap-x-3 max-sm:grid-cols-[1.25rem_minmax(0,1fr)_auto]',
                          },
                          [
                            h(
                              'span',
                              {
                                'aria-hidden': 'true',
                                class: `text-center select-none ${param.required ? accent : 'text-transparent'}`,
                              },
                              param.required ? '*' : ' ',
                            ),
                            h('span', { class: 'truncate text-foreground' }, [
                              param.name,
                              param.required
                                ? h('span', { class: 'sr-only' }, ' (required)')
                                : null,
                            ]),
                            h('span', { class: 'truncate text-graph-muted' }, param.type ?? ''),
                            param.description
                              ? h(
                                  'span',
                                  { class: 'min-w-0 max-sm:col-span-2 max-sm:col-start-2' },
                                  [description(param.description)],
                                )
                              : null,
                          ],
                        ),
                        index * 40,
                      ),
                    ),
                  ),
                  model.params.some((param) => param.required)
                    ? h('p', { 'aria-hidden': 'true', class: 'text-graph-muted' }, [
                        h('span', { class: accent }, '*'),
                        ' required',
                      ])
                    : null,
                ]
              : []),
            ...model.blocks.map((block, index) =>
              reveal(
                h('div', { key: index, class: 'flex min-w-0 flex-col gap-3' }, [
                  h(GraphRule),
                  block.label
                    ? h(
                        'p',
                        {
                          id: captionId ? `${captionId}-code-${index}` : undefined,
                          class: 'text-graph-muted',
                        },
                        block.label,
                      )
                    : null,
                  h(
                    'div',
                    {
                      class: 'graph-scroll-x',
                      tabindex: 0,
                      role: 'region',
                      'aria-labelledby': captionId
                        ? [captionId, ...(block.label ? [`${captionId}-code-${index}`] : [])].join(
                            ' ',
                          )
                        : undefined,
                      'aria-label': captionId ? undefined : block.label || 'Code',
                    },
                    [
                      h(
                        'pre',
                        {
                          class: 'm-0 min-w-max leading-relaxed whitespace-pre text-foreground/80',
                        },
                        [h('code', block.code)],
                      ),
                    ],
                  ),
                ]),
              ),
            ),
          ]),
      )
    }
  },
})
