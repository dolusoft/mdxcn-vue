import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import type { Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { GraphScore, GraphRank, GraphFunnel, Rank, Stage, numberOf } from '../src'
import { firstToken, numericFromList, scoreFromList } from '../src/core'
import { numericList, numericItems } from '../src/adapters/numeric-list'
const item = (text: string, strong = false) => ({ text, strong, em: false, paragraphs: [] })
const list = (...rows: string[]) => [
  h(
    'ul',
    rows.map((row) => h('li', row)),
  ),
]
const review = () => [
  h('ul', [
    h('li', 'Performance: 4/5'),
    h('li', 'Accessibility: 5/5'),
    h('li', [h('strong', 'Docs: 2.5/5')]),
    h('li', 'Motion: 4/5'),
  ]),
]
const routes = () => list('12,400 /docs', '4,100 /install', '860 /plot', '420 /rank')
const install = () => list('12,400 docs', '4,100 copy', '860 ship')
it('matches review dots, halves, accent and accessibility independently', () => {
  const w = mount(GraphScore, { props: { title: 'REVIEW' }, slots: { default: review } })
  expect(w.findAll('li > span:last-child').map((n) => n.text())).toEqual([
    '4/5',
    '5/5',
    '2.5/5',
    '4/5',
  ])
  expect(w.findAll('li').map((n) => n.attributes('aria-label'))).toEqual([
    'Performance 4 of 5',
    'Accessibility 5 of 5',
    'Docs 2.5 of 5',
    'Motion 4 of 5',
  ])
  expect(w.findAll('li')[2]!.text()).toContain('●●◐○○')
  expect(w.findAll('li')[0]!.find('.text-graph-muted').exists()).toBe(true)
  expect(w.findAll('li')[2]!.get('span').classes()).toContain('text-graph-accent')
  expect(w.get('ol').attributes('role')).toBe('list')
  w.unmount()
})
it('uses the first nonzero row max, row override, clamp and ascii marks', () => {
  const w = mount(GraphScore, {
    props: { title: 'VENDORS', glyphs: 'ascii' },
    slots: { default: () => list('Acme: 8/10', 'Globex: 6.5', 'Initech: 4') },
  })
  expect(w.findAll('li > span:last-child').map((n) => n.text())).toEqual(['8/10', '6.5/10', '4/10'])
  expect(w.findAll('li')[1]!.text()).toContain('@@@@@@-...')
  w.unmount()
  const x = mount(GraphScore, {
    props: {
      title: 'MAX',
      max: 7,
      items: [
        { label: 'A', value: -2, max: 0 },
        { label: 'B', value: 99, max: 3 },
        { label: 'C', value: 0 },
      ],
    },
  })
  expect(x.findAll('li > span:last-child').map((n) => n.text())).toEqual(['0/1', '3/3', '0/7'])
  x.unmount()
  const y = mount(GraphScore, {
    props: {
      title: 'MAX',
      items: [
        { label: 'A', value: 1 },
        { label: 'B', value: 2, max: 8 },
      ],
    },
  })
  expect(y.findAll('li > span:last-child').map((n) => n.text())).toEqual(['1/8', '2/8'])
  y.unmount()
})
it('matches routes in input order with twenty scaled ticks and decorative brackets', () => {
  const w = mount(GraphRank, { props: { title: 'ROUTES' }, slots: { default: routes } })
  expect(w.findAll('li > span:first-child').map((n) => n.text())).toEqual([
    '/docs',
    '/install',
    '/plot',
    '/rank',
  ])
  expect(w.findAll('li > span:last-child').map((n) => n.text())).toEqual([
    '12,400',
    '4,100',
    '860',
    '420',
  ])
  expect(w.findAll('li')[1]!.text()).toContain('[=======-------------]')
  expect(
    w.findAll('li [aria-hidden="true"]').filter((n) => n.text() === '[' || n.text() === ']'),
  ).toHaveLength(8)
  expect(w.get('ol').classes()).toContain('list-none')
  w.unmount()
})
it('preserves percent display and explicit rank scale', () => {
  const w = mount(GraphRank, {
    props: { title: 'COVERAGE', max: 100 },
    slots: { default: () => list('100% frame', '82% plot', '41% invoice') },
  })
  expect(w.findAll('li')[1]!.text()).toContain('[================----]')
  expect(w.findAll('li > span:last-child').map((n) => n.text())).toEqual(['100%', '82%', '41%'])
  w.unmount()
})
it('matches install ratios, widths, focus and minimum one cell', () => {
  const w = mount(GraphFunnel, {
    props: { title: 'INSTALL', stage: 'ship' },
    slots: { default: install },
  })
  expect(w.findAll('li > span:last-child').map((n) => n.text())).toEqual(['', '33%', '7%'])
  expect(w.findAll('li')[1]!.text()).toContain('███████-------------')
  expect(w.findAll('li')[0]!.attributes('style')).toBe('opacity: 0.4;')
  expect(w.findAll('li')[2]!.attributes('style')).toBeUndefined()
  w.unmount()
  const x = mount(GraphFunnel, {
    props: {
      title: 'ZERO',
      steps: [
        { label: 'A', value: 0 },
        { label: 'B', value: -2 },
      ],
    },
  })
  expect(x.findAll('li')[1]!.text()).toContain('█-------------------')
  expect(x.findAll('li > span:last-child')[1]!.text()).toBe('-200%')
  x.unmount()
})
it('matches signup with sixteen cells and rounded head ratios', () => {
  const w = mount(GraphFunnel, {
    props: { title: 'SIGNUP', ticks: '16' },
    slots: { default: () => list('8,000 visit', '2,400 start', '960 verify', '180 paid') },
  })
  expect(w.findAll('li > span:last-child').map((n) => n.text())).toEqual(['', '30%', '12%', '2%'])
  expect(w.findAll('li')[1]!.text()).toContain('█████-----------')
  w.unmount()
})
it.each([
  ['-2.5', -2.5],
  ['0', 0],
  ['1,234.5', 1234.5],
  ['82%', 82],
  ['4ms', 4],
  ['missing', 0],
  ['−2', 0],
  ['.5', 0.5],
] as const)('parses upstream numeric token %s', (token, value) => {
  expect(numberOf(token)).toBe(value)
  expect(numericFromList(item(`${token} docs`))).toEqual({ label: 'docs', value, display: token })
})
it('preserves missing values and split grammar', () => {
  expect(firstToken('')).toEqual({ token: '', rest: '' })
  expect(scoreFromList(item('Missing'))).toEqual({
    label: 'Missing',
    value: 0,
    max: undefined,
    accent: false,
  })
  expect(scoreFromList(item('Docs: 2.5/5', true))).toEqual({
    label: 'Docs',
    value: 2.5,
    max: 5,
    accent: true,
  })
  expect(numericFromList(item('docs'))).toEqual({ label: '', value: 0, display: 'docs' })
})
it('normalizes marker props, keeps empty labels, and excludes nested text', () => {
  expect(
    numericItems(
      [h(Rank as Component, { value: '1,200', label: '', display: '' }, () => 'ignored')],
      Rank,
    ),
  ).toEqual([{ label: '', value: 1200, display: '' }])
  expect(numericItems([h(Stage, { value: 3 }, () => 'ship')], Stage)).toEqual([
    { label: 'ship', value: 3, display: undefined },
  ])
  expect(
    numericList([h('li', [h('b', 'Docs: 4/5'), h('ul', [h('li', 'ignored')])])])[0],
  ).toMatchObject({ text: 'Docs: 4/5', strong: true })
})
it.each([GraphScore, GraphRank, GraphFunnel])(
  'preserves empty data and null fallback in %s',
  (component) => {
    const field = component === GraphFunnel ? 'steps' : 'items'
    const w = mount(component as Component, {
      props: { title: 'T', [field]: [] },
      slots: { default: () => list('2 docs') },
    })
    expect(w.findAll('li')).toHaveLength(0)
    w.unmount()
    const x = mount(component as Component, {
      props: { title: 'T', [field]: null },
      slots: { default: () => list('2 docs') },
    })
    expect(x.findAll('li')).toHaveLength(1)
    x.unmount()
  },
)
it.each([GraphRank, GraphFunnel])(
  'prefers lists over markers and data over compiler lists in %s',
  (component) => {
    const marker = component === GraphRank ? Rank : Stage,
      field = component === GraphRank ? 'items' : 'steps'
    const w = mount(component as Component, {
      props: { title: 'T' },
      slots: { default: () => [...list('2 listed'), h(marker, { value: 3 }, () => 'tagged')] },
    })
    expect(w.get('li > span:first-child').text()).toBe('listed')
    w.unmount()
    const x = mount(component as Component, {
      props: { title: 'T', [field]: [{ label: 'data', value: 4 }], list: [item('2 compiled')] },
    })
    expect(x.get('li > span:first-child').text()).toBe('data')
    x.unmount()
  },
)
it.each([GraphScore, GraphRank, GraphFunnel])(
  'updates compiled dynamic slots safely in %s',
  async (component) => {
    const value = ref('2'),
      label = ref('before')
    const template =
      component === GraphScore
        ? '<Widget title="T"><ul><li><b>{{ label }}: {{ value }}/5</b></li></ul></Widget>'
        : '<Widget title="T"><ul><li><code>{{ value }}</code> {{ label }}</li></ul></Widget>'
    const w = mount(
      defineComponent({
        components: { Widget: component },
        setup: () => ({ value, label }),
        template,
      }),
    )
    expect(w.text()).toContain('before')
    value.value = '4'
    label.value = 'after'
    await nextTick()
    expect(w.text()).toContain('after')
    expect(w.text()).not.toMatch(/before|object Object/)
    expect(w.text()).toContain('4')
    w.unmount()
  },
)
it.each([GraphScore, GraphRank, GraphFunnel])(
  'hydrates visible SSR without warnings in %s',
  async (component) => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const app = defineComponent({
      setup: () => () =>
        h(component as Component, { title: 'T' }, component === GraphScore ? review : routes),
    })
    const html = await renderToString(createSSRApp(app))
    expect(html).not.toMatch(/opacity:0|translateY/)
    const host = document.createElement('div')
    host.innerHTML = html
    document.body.append(host)
    const before = host.innerHTML,
      warn = vi.spyOn(console, 'warn'),
      error = vi.spyOn(console, 'error')
    const client = createSSRApp(app)
    client.mount(host)
    await nextTick()
    expect(host.innerHTML).toBe(before)
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    client.unmount()
    host.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  },
)

it('keeps rank input order, negative values and truthy display fallback', () => {
  const w = mount(GraphRank, {
    props: {
      title: 'R',
      ticks: '4',
      items: [
        { label: 'small', value: 1.25, display: '' },
        { label: 'large', value: '4ms' },
        { label: 'negative', value: -2 },
      ],
    },
  })
  expect(w.findAll('li > span:first-child').map((n) => n.text())).toEqual([
    'small',
    'large',
    'negative',
  ])
  expect(w.findAll('li > span:last-child').map((n) => n.text())).toEqual(['1.3', '4', '-2'])
  expect(w.findAll('li')[2]!.text()).toContain('[----]')
  w.unmount()
})
it('keeps funnel empty display, largest scale and first-stage denominator', () => {
  const w = mount(GraphFunnel, {
    props: {
      title: 'F',
      ticks: 4,
      steps: [
        { label: 'first', value: 2, display: '' },
        { label: 'largest', value: 4 },
      ],
    },
  })
  expect(w.findAll('li > span:nth-last-child(2)').map((n) => n.text())).toEqual(['', '4'])
  expect(w.findAll('li')[0]!.text()).toContain('██--')
  expect(w.findAll('li > span:last-child').map((n) => n.text())).toEqual(['', '200%'])
  w.unmount()
})
it.each([GraphScore, GraphRank, GraphFunnel])(
  'forwards frame props and attributes in %s',
  (component) => {
    const w = mount(component as Component, {
      props: { title: 'FRAME', className: 'custom', corner: 'x' },
      attrs: { class: 'host', 'data-test': 'numeric' },
    })
    expect(w.classes()).toContain('custom')
    expect(w.classes()).toContain('host')
    expect(w.attributes('data-test')).toBe('numeric')
    expect(w.findAll('figure > span').map((n) => n.text())).toEqual(['x', 'x', 'x', 'x'])
    w.unmount()
  },
)
it('uses duo series classes without mono dimming and custom glyph marks', () => {
  const w = mount(GraphFunnel, {
    props: {
      title: 'F',
      ticks: 2,
      stage: 'B',
      palette: 'duo',
      glyphs: ['.', '+', '#'],
      steps: [
        { label: 'A', value: 2 },
        { label: 'B', value: 1 },
      ],
    },
  })
  expect(w.findAll('li')[0]!.attributes('style')).toBeUndefined()
  expect(w.findAll('li')[0]!.text()).toContain('##')
  expect(w.findAll('li')[1]!.text()).toContain('#.')
  expect(w.findAll('li')[1]!.find('.text-graph-accent-2').exists()).toBe(true)
  w.unmount()
})
