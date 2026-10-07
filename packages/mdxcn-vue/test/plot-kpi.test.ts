import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, Fragment, h, nextTick, ref } from 'vue'
import type { Component, VNode } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { GraphPlot, GraphKpi } from '../src'
import { kpiModel, sparkModel } from '../src/adapters/series'
import { vReveal } from '../src/directives/reveal'
import fixtures from './fixtures/plot-kpi-examples.json'
const widgets: Record<string, Component> = { GraphPlot, GraphKpi }
const strip = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ id="[^"]*"/g, '')
    .replace(/ aria-labelledby="[^"]*"/g, '')
const hosts = (name: string): VNode[] =>
  name === 'GraphPlot'
    ? [
        h(
          'ul',
          ['Mon: 12', 'Tue: 18', 'Wed: 15', 'Thu: 24', 'Fri: 31'].map((s) => h('li', s)),
        ),
      ]
    : [h('p', [h('strong', '12,400'), ' this week — +18%']), h('p', '4 5 5 6 8 7 9 8 11 10 12 14')]
it.each(fixtures)('$name $props.title matches independent models, glyphs and DOM', (c) => {
  const input = c.body ? hosts(c.name) : []
  if (c.body)
    expect(
      JSON.parse(
        JSON.stringify({ written: c.name === 'GraphPlot' ? sparkModel(input) : kpiModel(input) }),
      ),
    ).toEqual(c.model)
  const runtime = mount(widgets[c.name]!, {
    props: c.props as Record<string, unknown>,
    slots: { default: () => input },
  })
  const model = mount(widgets[c.name]!, { props: { ...c.props, ...c.model } })
  const direct = mount(widgets[c.name]!, { props: { ...c.props, ...c.model.written } })
  expect(strip(runtime.html())).toBe(strip(model.html()))
  expect(strip(runtime.html())).toBe(strip(direct.html()))
  expect(runtime.get('.sr-only').text()).toBe(c.summary)
  if (c.points) expect(runtime.get('[class~="gap-0.5"]').text()).toBe(c.points)
  if (c.caps) {
    const columns = runtime.findAll('[class~="h-full"]')
    expect(columns).toHaveLength(c.caps.length)
    columns.forEach((column, i) => {
      const cells = column.findAll('span')
      const cap = cells.findIndex((cell) => cell.text() === '█')
      expect(cap < 0 ? null : cells.length - 1 - cap).toBe(c.caps![i])
    })
  }
  runtime.unmount()
  model.unmount()
  direct.unmount()
})
it.each(fixtures)('$name $props.title hydrates visible SSR without warnings', async (c) => {
  vi.stubGlobal('IntersectionObserver', undefined)
  const app = defineComponent({
    setup: () => () =>
      h(widgets[c.name]!, { ...c.props, ...c.model, className: 'custom', 'data-test': 'yes' }),
  })
  const html = await renderToString(createSSRApp(app))
  expect(html).not.toMatch(/opacity:0(?:;|"|$)|translateY/)
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)
  const before = container.innerHTML,
    warn = vi.spyOn(console, 'warn'),
    error = vi.spyOn(console, 'error')
  const client = createSSRApp(app)
  try {
    client.mount(container)
    await nextTick()
    expect(container.innerHTML).toBe(before)
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    expect(container.querySelector('figure.custom')?.getAttribute('data-test')).toBe('yes')
  } finally {
    client.unmount()
    container.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  }
})
it('Plot labels fall back independently even when explicit data wins', () => {
  const w = mount(GraphPlot, {
    props: { title: 'P', data: [99] },
    slots: { default: () => hosts('GraphPlot') },
  })
  expect(w.text()).toContain('Mon')
  expect(w.text()).toContain('Fri')
  expect(w.get('.sr-only').text()).toContain('1 points')
  w.unmount()
  const empty = mount(GraphPlot, {
    props: { title: 'P', data: [], labels: [] },
    slots: { default: () => hosts('GraphPlot') },
  })
  expect(empty.text()).not.toContain('Mon')
  expect(empty.get('.sr-only').text()).toContain('0 points')
  empty.unmount()
})
it('KPI props override each field independently, including empty strings and arrays', () => {
  const w = mount(GraphKpi, {
    props: { title: 'K', value: '', hint: '', data: [] },
    slots: { default: () => hosts('GraphKpi') },
  })
  expect(w.get('p').text()).toBe('')
  expect(w.text()).toContain('this week')
  expect(w.text()).not.toContain('+18%')
  expect(w.find('[class~="gap-0.5"]').exists()).toBe(false)
  w.unmount()
})
it('KPI visible lines preserve paragraph precedence and discard permalinks without mutation', () => {
  const anchor = h('a', { class: ['header-anchor'] }, '99'),
    node = h('p', [h('strong', '12'), ' reads — +2', anchor])
  const nodes = [
    h(Fragment, [
      'ignored 999',
      node,
      h('p', '1 2'),
      h(defineComponent({ render: () => h('p', '888') })),
    ]),
  ]
  expect(kpiModel(nodes)).toEqual({ value: '12', label: 'reads', hint: '+2', data: [1, 2] })
  expect(node.children).toContain(anchor)
  expect(anchor.children).toBe('99')
})
it.each([
  { data: [], min: '0', max: '0', caps: [] },
  { data: [4], min: '0', max: '4', caps: [2] },
  { data: [4, 4], min: '0', max: '4', caps: [2, 2] },
  { data: [0, 0], min: '0', max: '0', caps: [0, 0] },
  { data: [-4, 2], min: '-4', max: '2', caps: [0, 2] },
  { data: [NaN, 2], min: 'NaN', max: 'NaN', caps: [null, null] },
  { data: [-1.25, 2.25], min: '-1.3', max: '2.3', caps: [0, 2] },
])('Plot scale and caps preserve upstream $data', (c) => {
  const w = mount(GraphPlot, { props: { title: 'P', data: c.data, height: 3 } })
  expect(w.get('.sr-only').text()).toBe(
    `area plot, ${c.data.length} points, min ${c.min}, max ${c.max}`,
  )
  expect(
    w.findAll('[class~="h-full"]').map((column) => {
      const cap = column.findAll('span').findIndex((cell) => cell.text() === '█')
      return cap < 0 ? null : 2 - cap
    }),
  ).toEqual(c.caps)
  w.unmount()
})
it.each([
  [[], ''],
  [[4], '█'],
  [[4, 4], '██'],
  [[0, -4], '▁▁'],
  [[NaN, 2], '▁▁'],
  ['bad 2*2 Infinity', '██'],
] as const)('KPI scale preserves upstream %s', (data, points) => {
  const w = mount(GraphKpi, { props: { title: 'K', data } })
  expect(w.find('[class~="gap-0.5"]').exists()).toBe(points.length > 0)
  if (points) expect(w.get('[class~="gap-0.5"]').text()).toBe(points)
  w.unmount()
})
it.each([0, -1, 0.5, 1, 2, NaN])(
  'Plot clamps progress %s and highlights the last shown cap',
  (progress) => {
    const w = mount(GraphPlot, {
      props: { title: 'P', data: [1, 2, 3, 4], progress, variant: 'line' },
    })
    const shown = Number.isNaN(progress) ? 0 : Math.round(Math.min(1, Math.max(0, progress)) * 4)
    expect(w.findAll('[class~="h-full"] span').filter((cell) => cell.text() === '█')).toHaveLength(
      shown,
    )
    expect(w.findAll('[class~="h-full"] .text-graph-accent')).toHaveLength(shown ? 1 : 0)
    w.unmount()
  },
)
it.each(['GraphPlot', 'GraphKpi'])('%s caps long-series reveal at 240 ms', (name) => {
  const directive = vReveal as {
    mounted: (...args: [HTMLElement, { value?: { delay?: number } }]) => void
  }
  const mounted = vi.spyOn(directive, 'mounted')
  const w = mount(widgets[name]!, {
    props: { title: 'T', data: Array.from({ length: 60 }, () => 1) },
  })
  const delays = mounted.mock.calls.map((call) => call[1].value?.delay ?? 0)
  expect(delays[0]).toBe(0)
  expect(delays.at(-1)).toBe(240)
  expect(Math.max(...delays)).toBe(240)
  w.unmount()
  mounted.mockRestore()
})
it.each(['GraphPlot', 'GraphKpi'])(
  '%s renders every capped run point in visible SSR',
  async (name) => {
    const html = await renderToString(
      createSSRApp({ render: () => h(widgets[name]!, { title: 'T', data: '2*9999', height: 1 }) }),
    )
    const doc = document.createElement('div')
    doc.innerHTML = html
    expect(
      doc.querySelectorAll(name === 'GraphPlot' ? '[class~="h-full"]' : '[class~="flex-none"]'),
    ).toHaveLength(5000)
    expect(html).not.toMatch(/opacity:0(?:;|"|$)|translateY/)
  },
)
it.each(['GraphPlot', 'GraphKpi'])('%s responds to slot and prop updates', async (name) => {
  const value = ref(1),
    explicit = ref(false)
  const w = mount(
    defineComponent({
      setup: () => () =>
        h(
          widgets[name]!,
          { title: 'T', ...(explicit.value ? { data: [3], label: 'prop' } : {}) },
          () => [h('p', name === 'GraphPlot' ? `${value.value}` : `12 reads\n${value.value}`)],
        ),
    }),
  )
  value.value = 2
  await nextTick()
  if (name === 'GraphPlot') expect(w.get('.sr-only').text()).toContain('max 2')
  explicit.value = true
  await nextTick()
  expect(w.get('.sr-only').text()).toContain(name === 'GraphPlot' ? 'max 3' : 'prop')
  w.unmount()
})

it('Plot custom marks, area fill and single label retain upstream classes', () => {
  const w = mount(GraphPlot, {
    props: {
      title: 'P',
      data: [0, 2],
      height: 3,
      labels: ['same'],
      glyphs: ['.', '+', '#'],
      palette: 'duo',
    },
  })
  expect(w.findAll('[class~="h-full"]')[0]!.text()).toBe('#')
  expect(w.findAll('[class~="h-full"]')[1]!.text()).toBe('#++')
  expect(w.findAll('.text-graph-accent-2')).toHaveLength(2)
  expect(w.findAll('[class~="justify-between"]').at(-1)!.text()).toBe('same')
  w.unmount()
})
it.each(['GraphPlot', 'GraphKpi'])('%s normalizes kebab props and retains attrs', (name) => {
  const w = mount(widgets[name]!, {
    props: { title: 'T', 'class-name': 'custom', corner: 'x', data: 'NaN 2 3', palette: 'multi' },
    attrs: { 'data-test': 'yes' },
  })
  expect(w.get('figure').classes()).toContain('custom')
  expect(w.get('figure').attributes('data-test')).toBe('yes')
  expect(
    w.findAll(name === 'GraphPlot' ? '[class~="h-full"]' : '[class~="flex-none"]'),
  ).toHaveLength(2)
  w.unmount()
})
it.each(['mono', 'duo', 'multi'] as const)(
  'KPI custom glyphs and %s palette preserve live and dim tones',
  (palette) => {
    const w = mount(GraphKpi, {
      props: { title: 'K', value: '12', label: 'reads', data: [1, 2], glyphs: ['.', '#'], palette },
    })
    const spans = w.findAll('[class~="flex-none"] > span')
    expect(spans.map((s) => s.text())).toEqual(['#', '#'])
    expect(spans[0]!.classes()).toContain(
      palette === 'mono' ? 'text-graph-muted' : 'text-graph-accent-2',
    )
    expect(spans[0]!.attributes('style')).toBe(palette === 'mono' ? 'opacity: 0.4;' : undefined)
    expect(spans[1]!.classes()).toContain('text-graph-accent')
    w.unmount()
  },
)
it('KPI raw multiline input and null field props use visible fallback', () => {
  const w = mount(GraphKpi, {
    props: { title: 'K', value: null, label: null, hint: null, data: null },
    slots: { default: () => ['12 reads — +2\n1 2'] },
  })
  expect(w.get('.sr-only').text()).toBe('12 reads. +2')
  expect(w.get('[class~="gap-0.5"]').text()).toBe('▅█')
  w.unmount()
})
it('KPI keeps one line per block, as MDX newlines separate list items and quoted paragraphs', () => {
  const ul = h('ul', [h('li', '12,400 docs — +18%'), h('li', '4 5 6')])
  expect(kpiModel([ul])).toEqual({
    value: '12,400',
    label: 'docs',
    hint: '+18%',
    data: [4, 5, 6],
  })
  expect(kpiModel([h('blockquote', [h('p', '12 docs'), h('p', '1 2 3')])])).toEqual({
    value: '12',
    label: 'docs',
    hint: undefined,
    data: [1, 2, 3],
  })
})
