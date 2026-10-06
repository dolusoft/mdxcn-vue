/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { Fragment, defineComponent, h, mergeProps, useId } from 'vue'
import type { PropType, VNode } from 'vue'
import type { ProseNode } from '../core/model'

function host(name: string, tag: string, classes: string, hidden = false) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        h(
          tag,
          mergeProps({ class: classes, ...(hidden ? { 'aria-hidden': 'true' } : {}) }, attrs),
          slots.default?.(),
        )
    },
  })
}

export const GraphBody = host('GraphBody', 'div', 'min-w-0 px-5 py-7 sm:px-8 sm:py-8')
export const GraphRule = host('GraphRule', 'div', 'graph-rule w-full', true)
export const GraphRuleY = host('GraphRuleY', 'div', 'graph-rule-y self-stretch', true)
export const GraphTrack = host('GraphTrack', 'span', 'flex w-full min-w-0 select-none', true)
export const GraphTick = host('GraphTick', 'span', 'min-w-0 flex-1 overflow-hidden text-center')

export const GraphTitle = defineComponent({
  name: 'GraphTitle',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        'figcaption',
        mergeProps(
          {
            class:
              'absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 bg-background px-2.5 tracking-wide whitespace-nowrap uppercase',
          },
          attrs,
        ),
        [
          h('span', { class: 'graph-title-ink text-graph-accent' }, [
            '[ ',
            ...(slots.default?.() ?? []),
            ' ]',
          ]),
        ],
      )
  },
})

export const GraphCorners = defineComponent({
  name: 'GraphCorners',
  props: { mark: { type: String, default: '+' } },
  setup(props) {
    const corner =
      'pointer-events-none absolute z-10 flex size-4 items-center justify-center bg-background font-mono text-sm leading-none text-graph-frame select-none'
    const positions = [
      'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
      'top-0 right-0 translate-x-1/2 -translate-y-1/2',
      'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
      'right-0 bottom-0 translate-x-1/2 translate-y-1/2',
    ]
    return () =>
      h(
        Fragment,
        positions.map((position) =>
          h('span', { 'aria-hidden': 'true', class: `${corner} ${position}` }, props.mark),
        ),
      )
  },
})

export const Graph = defineComponent({
  name: 'Graph',
  inheritAttrs: false,
  props: { title: String, corner: { type: String, default: '+' }, className: String },
  setup(props, { attrs, slots }) {
    const captionId = useId()
    return () =>
      h(
        'figure',
        mergeProps(
          {
            'aria-labelledby': props.title ? captionId : undefined,
            class: [
              'relative w-full min-w-0 graph-frame font-mono text-sm text-foreground',
              props.className,
            ],
          },
          attrs,
        ),
        [
          props.title ? h(GraphTitle, { id: captionId }, () => props.title) : null,
          h(GraphCorners, { mark: props.corner }),
          ...(slots.default?.({ captionId: props.title ? captionId : undefined }) ?? []),
        ],
      )
  },
})

export const graphProseClass = [
  'flex min-w-0 flex-col gap-3 leading-relaxed',
  '[&_p]:m-0 [&_p]:text-pretty',
  '[&_ul]:m-0 [&_ul]:flex [&_ul]:list-none [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:p-0',
  '[&_ol]:m-0 [&_ol]:flex [&_ol]:list-none [&_ol]:flex-col [&_ol]:gap-1 [&_ol]:p-0',
  "[&_li]:relative [&_li]:pl-4 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-graph-muted [&_li]:before:content-['-']",
  '[&_a]:text-foreground [&_a]:underline [&_a]:decoration-graph-frame [&_a]:decoration-dashed [&_a]:underline-offset-[0.2em]',
  '[&_code]:font-semibold [&_code]:text-foreground',
  '[&_pre]:m-0 [&_pre]:whitespace-pre-wrap [&_pre_code]:font-normal [&_pre_code]:text-inherit',
  '[&_strong]:font-semibold [&_strong]:text-foreground',
  '[&_em]:text-graph-muted [&_em]:not-italic',
].join(' ')

export function renderProse(nodes: readonly ProseNode[]): (VNode | string)[] {
  return nodes.map((node) =>
    node.type === 'text'
      ? node.value
      : h(
          node.type === 'link' ? 'a' : node.type,
          node.type === 'link' ? { href: node.href } : {},
          renderProse(node.children),
        ),
  )
}

export const GraphProse = defineComponent({
  name: 'GraphProse',
  inheritAttrs: false,
  props: { nodes: Array as PropType<ProseNode[]> },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'div',
        mergeProps({ class: graphProseClass }, attrs),
        props.nodes ? renderProse(props.nodes) : slots.default?.(),
      )
  },
})
