/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { InvoiceData, InvoiceParty } from '../core/sheet-invoice.js'
import { invoiceModel } from '../adapters/sheet-invoice.js'
import { Graph, GraphBody, GraphRule } from './graph-frame.js'
import { vReveal } from '../directives/reveal.js'

export interface GraphInvoiceProps extends InvoiceData {
  title: string
  corner?: string
  className?: string
}
const party = (label: string, value: InvoiceParty) =>
  h('div', { class: 'flex flex-col gap-1' }, [
    h('p', { class: 'font-mono tracking-wide text-graph-muted uppercase' }, label),
    h('p', { class: 'text-foreground' }, value.name),
    ...(value.lines?.map((line, i) => h('p', { key: i, class: 'text-graph-muted' }, line)) ?? []),
  ])
export const GraphInvoice = /* @__PURE__ */ defineComponent({
  name: 'GraphInvoice',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    from: [String, Object] as PropType<InvoiceData['from']>,
    to: [String, Object] as PropType<InvoiceData['to']>,
    meta: Array as PropType<InvoiceData['meta']>,
    items: Array as PropType<InvoiceData['items']>,
    totals: Array as PropType<InvoiceData['totals']>,
    note: String,
    corner: String,
    className: String,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const model = invoiceModel(props, slots.default?.() ?? [])
      const qty = model.items.some((row) => row.qty != null)
      const rate = model.items.some((row) => row.rate != null)
      const columns = 2 + Number(qty) + Number(rate)
      const reveal = (node: ReturnType<typeof h>, i: number) =>
        withDirectives(node, [[vReveal, { delay: Math.min(i, 6) * 40 }]])
      const th = (label: string, edge = false) =>
        h(
          'th',
          {
            class: `${edge ? 'px-0' : 'px-3'} pb-3 ${label === 'Description' ? 'text-left' : 'text-right'} font-normal text-graph-muted`,
          },
          label,
        )
      const td = (text: string, edge = false, left = false) =>
        h(
          'td',
          {
            class: `${edge ? 'px-0' : 'px-3'} py-2.5 ${left ? 'text-left' : 'text-right tabular-nums'}`,
          },
          text,
        )
      return h(
        Graph,
        mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
        () =>
          h(GraphBody, { class: 'flex flex-col gap-8' }, () => [
            model.from || model.to
              ? h('div', { class: 'grid gap-6 sm:grid-cols-2' }, [
                  model.from ? party('From', model.from) : null,
                  model.to ? party('Bill to', model.to) : null,
                ])
              : null,
            model.meta.length
              ? h(
                  'dl',
                  { class: 'flex flex-wrap gap-x-8 gap-y-3' },
                  model.meta.map((entry, i) =>
                    h('div', { key: i, class: 'flex flex-col gap-1' }, [
                      h(
                        'dt',
                        { class: 'font-mono tracking-wide text-graph-muted uppercase' },
                        entry.label,
                      ),
                      h('dd', { class: 'text-foreground tabular-nums' }, entry.value),
                    ]),
                  ),
                )
              : null,
            h('div', { class: '@container graph-scroll-x' }, [
              h(
                'table',
                { class: 'graph-invoice-table w-full min-w-lg border-separate border-spacing-0' },
                [
                  h('thead', [
                    h('tr', [
                      th('Description', true),
                      qty ? th('Qty') : null,
                      rate ? th('Rate') : null,
                      th('Amount', true),
                    ]),
                    h('tr', [h('th', { colspan: columns, class: 'p-0' }, [h(GraphRule)])]),
                  ]),
                  h(
                    'tbody',
                    model.items.map((row, i) =>
                      reveal(
                        h('tr', { key: i }, [
                          td(row.description, true, true),
                          qty ? td(row.qty ?? '') : null,
                          rate ? td(row.rate ?? '') : null,
                          td(row.amount, true),
                        ]),
                        i,
                      ),
                    ),
                  ),
                ],
              ),
            ]),
            model.totals.length
              ? h('div', { class: 'flex flex-col gap-3' }, [
                  h(GraphRule),
                  h(
                    'dl',
                    { class: 'ml-auto flex w-full max-w-[22rem] flex-col gap-2' },
                    model.totals.map((entry, i) =>
                      reveal(
                        h(
                          'div',
                          {
                            key: i,
                            class: 'grid grid-cols-[minmax(0,1fr)_8rem] items-baseline gap-x-4',
                          },
                          [
                            h(
                              'dt',
                              { class: entry.accent ? 'text-foreground' : 'text-graph-muted' },
                              entry.label,
                            ),
                            h(
                              'dd',
                              {
                                class: `text-right tabular-nums ${entry.accent ? 'text-graph-accent' : 'text-foreground'}`,
                              },
                              entry.value,
                            ),
                          ],
                        ),
                        i,
                      ),
                    ),
                  ),
                ])
              : null,
            model.note
              ? h('p', { class: 'max-w-[48ch] text-pretty text-graph-muted' }, model.note)
              : null,
          ]),
      )
    }
  },
})
