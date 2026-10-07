import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import type { Component, VNode } from 'vue'
import { renderToString } from 'vue/server-renderer'
import {
  GraphSheet,
  GraphInvoice,
  Section,
  Head,
  Row,
  Foot,
  Cell,
  From,
  To,
  Meta,
  Item,
  Total,
} from '../src'
import type { InvoiceData, SheetData, TotalProps } from '../src'
import { sheetModel, invoiceModel } from '../src/adapters/sheet-invoice'
import { partyOf, moneyLine, invoiceItems } from '../src/core'
import fixtureData from './fixtures/sheet-invoice-examples.json'
interface Example {
  name: string
  props: Record<string, string>
  model: Record<string, unknown>
}
const examples = fixtureData as Example[]
const widgets: Record<string, Component> = { GraphSheet, GraphInvoice }
const strip = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ id="[^"]*"/g, '')
    .replace(/ aria-labelledby="[^"]*"/g, '')
function table(headers: string[], rows: readonly (readonly unknown[])[]) {
  return h('table', [
    h('thead', [
      h(
        'tr',
        headers.map((c) => h('th', c)),
      ),
    ]),
    h(
      'tbody',
      rows.map((row) =>
        h(
          'tr',
          row.map((c) => h('td', String(c ?? ''))),
        ),
      ),
    ),
  ])
}
function hosts(c: Example): VNode[] {
  if (c.name === 'GraphSheet') {
    const model = c.model as unknown as Required<SheetData>
    return model.sections!.flatMap((s) => [
      h('h3', s.title),
      table(model.headers as string[], s.rows),
    ])
  }
  const model = c.model as InvoiceData
  const items = model.items ?? []
  const qty = items.some((i) => i.qty != null),
    rate = items.some((i) => i.rate != null)
  return [
    h(
      'ul',
      model.meta?.map((m) => h('li', `${m.label}: ${m.value}`)),
    ),
    table(
      ['Description', ...(qty ? ['Qty'] : []), ...(rate ? ['Rate'] : []), 'Amount'],
      items.map((i) => [
        i.description,
        ...(qty ? [i.qty] : []),
        ...(rate ? [i.rate] : []),
        i.amount,
      ]),
    ),
    ...(model.totals?.map((t) =>
      h('p', [t.accent ? h('strong', t.label) : t.label, ` ${t.value}`]),
    ) ?? []),
    ...(model.note ? [h('p', model.note)] : []),
  ]
}
it.each(examples)('$name $props.title matches independent models and runtime/data DOM', (c) => {
  const model = c.name === 'GraphSheet' ? sheetModel({}, hosts(c)) : invoiceModel({}, hosts(c))
  expect(JSON.parse(JSON.stringify(model))).toEqual(c.model)
  const data = mount(widgets[c.name]!, { props: { ...c.props, ...c.model } })
  const runtime = mount(widgets[c.name]!, { props: c.props, slots: { default: () => hosts(c) } })
  expect(strip(runtime.html())).toBe(strip(data.html()))
  expect(data.find('table').exists()).toBe(true)
  // Preserve upstream native markup; do not add GraphTable's focusable region.
  expect(data.find('[role="region"], th[scope], [aria-expanded]').exists()).toBe(false)
  data.unmount()
  runtime.unmount()
})
it('Sheet resolves fields independently and preserves empty marker and prop priority', () => {
  const nodes = [
    h(Head),
    h(Section, { title: 'Tag' }, () => [h(Row, { cells: ['item', 0] })]),
    h(Foot, { cells: [] }),
    h('h3', 'Markdown'),
    table(['A', 'B'], [['md', '1']]),
  ]
  expect(sheetModel({}, nodes)).toMatchObject({
    headers: [],
    sections: [{ title: 'Tag', rows: [['item', 0]] }],
    footer: [],
  })
  expect(
    sheetModel({ headers: 'X | Y', sections: [], footer: [], align: 'left right' }, nodes),
  ).toMatchObject({ headers: ['X', 'Y'], sections: [], footer: [], align: ['left', 'right'] })
  expect(sheetModel({ sections: null }, nodes).sections[0]?.title).toBe('Tag')
  expect(
    sheetModel({}, [h(Section, { title: 'S', rows: [] }, () => [h(Row, { cells: ['ignored'] })])])
      .sections,
  ).toEqual([{ title: 'S', rows: [] }])
})
it('Sheet reads Head Cell alignment, nested cells and Foot without cloning VNodes', () => {
  const rich = h('a', { href: '/docs' }, 'link')
  const nodes = [
    h(Head, {}, () => [
      h(Cell, { align: 'right' }, () => 'A'),
      h(Cell, { align: 'left' }, () => 'B'),
    ]),
    h(Section, { title: 'S' }, () => [h(Row, { cells: [rich, null, undefined, -1, 0] })]),
    h(Foot, {}, () => 'Total | 0'),
  ]
  const result = sheetModel({}, nodes)
  expect(result.align).toEqual(['right', 'left'])
  expect(result.sections[0]?.rows[0]?.[0]).toBe(rich)
  const w = mount(GraphSheet, { props: { title: 'S' }, slots: { default: () => nodes } })
  expect(w.get('tbody a').attributes('href')).toBe('/docs')
  expect(w.get('tfoot tr:last-child').text()).toBe('Total0')
  w.unmount()
})
it.each(['Total', 'bold', 'single', 'explicit'])(
  'Sheet and Invoice follow upstream %s table footer detection',
  (kind) => {
    const t = table(
      ['Description', 'Amount'],
      kind === 'single'
        ? [['Total', '2']]
        : [
            ['Item', '1'],
            ['Total', '2'],
          ],
    )
    if (kind === 'bold')
      t.children = [
        h('thead', [h('tr', [h('th', 'Description'), h('th', 'Amount')])]),
        h('tbody', [
          h('tr', [h('td', 'Item'), h('td', '1')]),
          h('tr', [h('td', [h('b', 'Due')]), h('td', '2')]),
        ]),
      ]
    if (kind === 'explicit')
      t.children = [
        h('thead', [h('tr', [h('th', 'Description'), h('th', 'Amount')])]),
        h('tbody', [h('tr', [h('td', 'Item'), h('td', '1')])]),
        h('tfoot', [h('tr', [h('td', 'Total'), h('td', '2')])]),
      ]
    const s = sheetModel({}, [h('h3', 'S'), t])
    expect(s.footer).toBeUndefined()
    expect(s.sections[0]?.rows).toHaveLength(1)
    const inv = invoiceModel({}, [t])
    expect(inv.items).toHaveLength(1)
    expect(inv.items[0]?.description).toBe(kind === 'single' ? 'Total' : 'Item')
    expect(inv.totals).toEqual([])
  },
)
it('Invoice props, markers and Markdown select each field independently', () => {
  const nodes = [
    h(From, { name: 'F' }, () => [h('p', ' one '), h('p', 'two\nthree')]),
    h(To, { name: 'T', lines: [] }, () => 'ignored'),
    h(Meta, { label: 'No' }, () => '7'),
    h(Item, { amount: '0' }, () => 'Free'),
    h(Total, { label: 'Due', value: '0', accent: '' } as unknown as TotalProps),
    table(['Description', 'Amount'], [['md', '1']]),
    h('p', 'Tax 2'),
    h('p', 'Note'),
  ]
  expect(invoiceModel({}, nodes)).toMatchObject({
    from: { name: 'F', lines: ['one', 'two', 'three'] },
    to: { name: 'T', lines: undefined },
    meta: [{ label: 'No', value: '7' }],
    items: [{ description: 'Free', amount: '0' }],
    totals: [{ label: 'Due', value: '0', accent: true }],
    note: 'Note',
  })
  expect(
    invoiceModel({ from: '', to: ' \n ', meta: [], items: [], totals: [], note: '' }, nodes),
  ).toEqual({ from: undefined, to: undefined, meta: [], items: [], totals: [], note: '' })
  expect(invoiceModel({ meta: null, items: null, totals: null }, nodes).items[0]?.description).toBe(
    'Free',
  )
  expect(invoiceModel({}, [h(Total, {}, () => 'Due 7')]).totals[0]).toMatchObject({
    label: 'Due 7',
    value: 'Due 7',
    accent: false,
  })
})
it('Invoice party strings and objects retain upstream normalization', () => {
  const fallback = { name: 'fallback' }
  expect(partyOf('', fallback)).toBeUndefined()
  expect(partyOf(null, fallback)).toBe(fallback)
  const object = { name: '', lines: [] }
  expect(partyOf(object, fallback)).toBe(object)
  expect(partyOf(' A \n \n B \n C ')).toEqual({ name: 'A', lines: ['B', 'C'] })
})
it.each(['-1,234.50', '0', '12.75', '+1,000', '−12.50', ','])(
  'money grammar retains %s literally',
  (value) => {
    expect(moneyLine(`Due ${value}`)).toEqual({ label: 'Due', value })
  },
)
it.each(['NaN', '1e3', '$12', '12€', '.5', 'Infinity'])(
  'money grammar rejects %s like upstream',
  (value) => {
    expect(moneyLine(`Due ${value}`)).toBeNull()
  },
)
it('Invoice table header inference handles missing cells and zero without calculations', () => {
  expect(
    invoiceItems({
      headers: ['Description', 'Qty', 'Rate', 'Amount'],
      rows: [
        ['A', '0', '-1,234.50'],
        ['B', '', '', 'NaN'],
      ],
    }),
  ).toEqual([
    { description: 'A', qty: '0', rate: '-1,234.50', amount: '' },
    { description: 'B', qty: undefined, rate: undefined, amount: 'NaN' },
  ])
  expect(
    invoiceItems({ headers: ['Description', 'Price', 'Sum'], rows: [['A', '0', '1,200.50']] }),
  ).toEqual([{ description: 'A', qty: undefined, rate: '0', amount: '1,200.50' }])
  expect(invoiceItems({ headers: ['A', 'B', 'C'], rows: [['A', '2', '0']] })).toEqual([
    { description: 'A', qty: '2', rate: undefined, amount: '0' },
  ])
})
it('Invoice keeps subtotal, tax and total paragraphs literal and bold accent only', () => {
  const w = mount(GraphInvoice, {
    props: { title: 'I', items: [{ description: 'A', amount: 'NaN' }] },
    slots: {
      default: () => [
        h('p', 'Subtotal -1,234.50'),
        h('p', 'Tax 0'),
        h('p', [h('strong', 'Due'), ' −12.75']),
        h('p', '$5'),
        h('p', 'later'),
      ],
    },
  })
  expect(w.findAll('dl dd').map((n) => n.text())).toEqual(['-1,234.50', '0', '−12.75'])
  expect(w.get('dd.text-graph-accent').text()).toBe('−12.75')
  expect(w.get('p.max-w-\\[48ch\\]').text()).toBe('$5')
  expect(w.get('tbody td:last-child').text()).toBe('NaN')
  w.unmount()
})
it.each(['GraphSheet', 'GraphInvoice'])(
  '%s reparses reactive compiled slots and prop replacement',
  async (name) => {
    const value = ref('before')
    const app = defineComponent({
      components: { Widget: widgets[name]! },
      setup: () => ({ value }),
      template:
        name === 'GraphSheet'
          ? '<Widget title="T"><h3>{{value}}</h3><table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>{{value}}</td><td>0</td></tr></tbody></table></Widget>'
          : '<Widget title="T"><table><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody><tr><td>{{value}}</td><td>0</td></tr></tbody></table><p><strong>{{value}}</strong> 0</p></Widget>',
    })
    const w = mount(app)
    value.value = 'after'
    await nextTick()
    const fresh = mount(app)
    expect(strip(w.html())).toBe(strip(fresh.html()))
    expect(w.text()).not.toContain('before')
    w.unmount()
    fresh.unmount()
    const data =
      name === 'GraphSheet'
        ? { sections: [{ title: 'S', rows: [['before']] }] }
        : { items: [{ description: 'before', amount: '0' }] }
    const next =
      name === 'GraphSheet'
        ? { sections: [{ title: 'N', rows: [['after']] }] }
        : { items: [{ description: 'after', amount: '1' }] }
    const d = mount(widgets[name]!, { props: { title: 'T', ...data } })
    await d.setProps(next)
    const f = mount(widgets[name]!, { props: { title: 'T', ...next } })
    expect(strip(d.html())).toBe(strip(f.html()))
    d.unmount()
    f.unmount()
  },
)
it.each(examples)(
  '$name $props.title hydrates visible SSR with native tables and no warnings',
  async (c) => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const app = defineComponent({
      setup: () => () =>
        h(widgets[c.name]!, { ...c.props, ...c.model, className: 'custom', 'data-test': 'yes' }),
    })
    const html = await renderToString(createSSRApp(app))
    expect(html).not.toMatch(/opacity:0|translateY/)
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.append(container)
    const before = container.innerHTML,
      warn = vi.spyOn(console, 'warn'),
      error = vi.spyOn(console, 'error')
    const client = createSSRApp(app)
    client.mount(container)
    await nextTick()
    expect(container.innerHTML).toBe(before)
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    expect(container.querySelector('figure')?.getAttribute('data-test')).toBe('yes')
    client.unmount()
    container.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  },
)
it.each(['GraphSheet', 'GraphInvoice', 'InvoiceTotals'])(
  '%s caps the 60th row reveal delay',
  (name) => {
    const callbacks: { target?: Element; callback: IntersectionObserverCallback }[] = []
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        entry: { target?: Element; callback: IntersectionObserverCallback }
        constructor(callback: IntersectionObserverCallback) {
          this.entry = { callback }
          callbacks.push(this.entry)
        }
        observe(target: Element) {
          this.entry.target = target
        }
        disconnect() {}
      },
    )
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }))
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 10000,
      bottom: 10020,
      left: 0,
      right: 100,
    } as DOMRect)
    const animate = vi.fn<
      (frames: Keyframe[], options: KeyframeAnimationOptions) => { cancel(): void; onfinish: null }
    >(() => ({ cancel() {}, onfinish: null }))
    Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate })
    const props =
      name === 'GraphSheet'
        ? {
            headers: ['A'],
            sections: [{ title: 'S', rows: Array.from({ length: 60 }, (_, i) => [String(i)]) }],
          }
        : name === 'GraphInvoice'
          ? {
              items: Array.from({ length: 60 }, (_, i) => ({
                description: String(i),
                amount: '0',
              })),
            }
          : { totals: Array.from({ length: 60 }, (_, i) => ({ label: String(i), value: '0' })) }
    const w = mount(name === 'GraphSheet' ? GraphSheet : GraphInvoice, {
      props: { title: 'T', ...props },
    })
    const target =
      name === 'InvoiceTotals'
        ? w.findAll('dl > div')[59]!.element
        : w.findAll('tbody tr')[name === 'GraphSheet' ? 60 : 59]!.element
    callbacks
      .find((c) => c.target === target)!
      .callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    expect(animate.mock.calls[0]?.[1]).toMatchObject({ delay: 240 })
    w.unmount()
    Reflect.deleteProperty(HTMLElement.prototype, 'animate')
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  },
)
it('Invoice meta list items ignore nested lists and collapse wrapped text like upstream itemText', () => {
  const nodes = [
    h('ul', [
      h('li', ['Invoice: INV-1', h('ul', [h('li', 'nested')])]),
      h('li', ['Date: Mar\n   18  ', h('ol', [h('li', 'x: y')])]),
    ]),
  ]
  expect(invoiceModel({}, nodes).meta).toEqual([
    { label: 'Invoice', value: 'INV-1' },
    { label: 'Date', value: 'Mar 18' },
  ])
})
it('Sheet runtime section titles exclude the VitePress header-anchor permalink', () => {
  const heading = h('h3', { id: 'scope' }, [
    'Scope ',
    h('a', { class: 'header-anchor', href: '#scope' }, '​'),
  ])
  expect(sheetModel({}, [heading, table(['A'], [['1']])]).sections[0]?.title).toBe('Scope')
})
