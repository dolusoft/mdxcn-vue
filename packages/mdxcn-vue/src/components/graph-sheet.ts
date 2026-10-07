/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, isVNode, mergeProps, withDirectives } from 'vue'
import type { PropType, VNode } from 'vue'
import type { SheetData } from '../core/sheet-invoice.js'
import type { TableCell } from '../core/table.js'
import { sheetModel } from '../adapters/sheet-invoice.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphRule, renderProse } from './graph-frame.js'

export interface GraphSheetProps extends SheetData<VNode> {
  title: string
  corner?: string
  className?: string
}
const ruleY = () =>
  h('span', {
    'aria-hidden': 'true',
    class: 'pointer-events-none absolute inset-y-0 left-0 graph-rule-y',
  })
export const GraphSheet = defineComponent({
  name: 'GraphSheet',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    headers: [String, Array] as PropType<GraphSheetProps['headers']>,
    sections: Array as PropType<GraphSheetProps['sections']>,
    footer: Array as PropType<GraphSheetProps['footer']>,
    align: [String, Array] as PropType<GraphSheetProps['align']>,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const model = sheetModel(props, slots.default?.() ?? [])
      const right = (i: number) => (model.align?.[i] ?? (i === 0 ? 'left' : 'right')) === 'right'
      const cells = (row: readonly TableCell<VNode>[]) =>
        row.map((cell, i) =>
          h(
            'td',
            {
              key: i,
              class: `relative px-3 py-2.5 ${right(i) ? 'text-right tabular-nums' : 'text-left'} whitespace-nowrap`,
            },
            [
              i > 0 ? ruleY() : null,
              ...[
                isVNode(cell)
                  ? cell
                  : Array.isArray(cell)
                    ? renderProse([...cell])
                    : String(cell ?? ''),
              ].flat(),
            ],
          ),
        )
      const rule = (tag: string, cls: string) =>
        h('tr', [h(tag, { colspan: model.headers.length, class: cls }, [h(GraphRule)])])
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h('div', { class: 'min-w-0 px-3 py-6 sm:px-6 sm:py-8' }, [
            h('div', { class: '@container graph-scroll-x' }, [
              h(
                'table',
                { class: 'graph-sheet-table w-full min-w-lg border-separate border-spacing-0' },
                [
                  h('thead', [
                    h(
                      'tr',
                      model.headers.map((header, i) =>
                        h(
                          'th',
                          {
                            key: i,
                            class: `relative px-3 pb-3 font-normal whitespace-nowrap text-foreground ${right(i) ? 'text-right' : 'text-left'}`,
                          },
                          [i > 0 ? ruleY() : null, header],
                        ),
                      ),
                    ),
                    rule('th', 'p-0'),
                  ]),
                  ...model.sections.map((section, si) =>
                    h('tbody', { key: si }, [
                      si > 0 ? rule('td', 'pt-4 pb-1') : null,
                      h('tr', [
                        h(
                          'td',
                          {
                            colspan: model.headers.length,
                            class: 'px-3 pt-3 pb-1 text-graph-muted',
                          },
                          section.title,
                        ),
                      ]),
                      ...section.rows.map((row, i) =>
                        withDirectives(h('tr', { key: i }, cells(row)), [
                          [vReveal, { delay: Math.min(i, 6) * 40 }],
                        ]),
                      ),
                    ]),
                  ),
                  model.footer
                    ? h('tfoot', [rule('td', 'pt-3 pb-3'), h('tr', cells(model.footer))])
                    : null,
                ],
              ),
            ]),
          ]),
      )
    }
  },
})
