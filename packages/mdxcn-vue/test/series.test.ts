import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, Fragment, h, nextTick, ref } from 'vue'
import type { Component, VNodeChild } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { GraphBars, GraphSpark, Series } from '../src'
import { barsModel, sparkModel } from '../src/adapters/series'
import { numbers, seriesOf } from '../src/core'
import { vReveal } from '../src/directives/reveal'
import fixtures from './fixtures/series-examples.json'

const widgets: Record<string, Component> = { GraphBars, GraphSpark }
const strip = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ id="[^"]*"/g, '')
    .replace(/ aria-labelledby="[^"]*"/g, '')
const ul = (...rows: VNodeChild[]) =>
  h(
    'ul',
    rows.map((row) => h('li', null, [row])),
  )
// Independently transcribed React host inputs, never generated from reader output.
function hosts(title: string) {
  if (title === 'THROUGHPUT')
    return [ul('before: 2 4 3 5 2', [h('strong', 'after'), ': 2 4 3 5 2'])]
  if (title === 'DRAFT TO SHIPPED')
    return [ul('draft: 1 2 2 3 1', [h('strong', 'shipped'), ': 3 5 4 6 5'])]
  if (title === 'DEPLOYS') return [h('p', '2 3 0*3 5 8 6 9 — three quiet days, then a busy week')]
  return []
}
it.each(fixtures)('$name $props.title matches independent model, DOM and glyphs', (c) => {
  const input = hosts(c.props.title)
  if (c.body)
    expect(
      JSON.parse(
        JSON.stringify(
          c.name === 'GraphBars' ? { series: barsModel(input) } : { written: sparkModel(input) },
        ),
      ),
    ).toEqual(c.model)
  const runtime = mount(widgets[c.name]!, {
    props: c.props as Record<string, unknown>,
    slots: { default: () => input },
  })
  const data = mount(widgets[c.name]!, { props: { ...c.props, ...c.model } })
  expect(strip(runtime.html())).toBe(strip(data.html()))
  if (c.points) expect(runtime.get('[class~="gap-0.5"][aria-hidden="true"]').text()).toBe(c.points)
  runtime.unmount()
  data.unmount()
})
it.each(fixtures)(
  '$name $props.title hydrates visible SSR with attrs and no warnings',
  async (c) => {
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
    const before = container.innerHTML
    const warn = vi.spyOn(console, 'warn'),
      error = vi.spyOn(console, 'error')
    const client = createSSRApp(app)
    try {
      client.mount(container)
      await nextTick()
      expect(container.innerHTML).toBe(before)
      expect(warn).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
      expect(container.querySelector('figure')?.getAttribute('data-test')).toBe('yes')
      expect(container.querySelector('figure')?.classList.contains('custom')).toBe(true)
    } finally {
      client.unmount()
      container.remove()
      vi.restoreAllMocks()
      vi.unstubAllGlobals()
    }
  },
)
it('shared series grammar keeps aligned labels, finite values and list precedence', () => {
  expect(
    seriesOf(
      [{ text: 'Mon: 12,400ms' }, { text: 'bad: no' }, { text: '3' }, { text: 'Tue: -4.5' }],
      '99 — ignored',
    ),
  ).toEqual({ data: [12400, 3, -4.5], labels: ['Mon', '', 'Tue'] })
  expect(seriesOf([{ text: 'bad: no' }], '99 — ignored')).toEqual({ data: [], labels: [] })
  expect(seriesOf([], '2*3, 4×2 NaN Infinity — caption')).toEqual({
    data: [2, 2, 2, 4, 4],
    labels: [],
    caption: 'caption',
  })
})
it('source grammar preserves emphasis delimiters, paragraphs, links and opaque components', () => {
  const wrapper = defineComponent({ setup: () => () => h('p', '99') })
  expect(sparkModel([h(wrapper)])).toEqual({ data: [], labels: [], caption: undefined })
  expect(
    sparkModel([
      h(Fragment, [
        h('p', ['1 ', h('strong', '2'), ' ', h('em', '3')]),
        h('p', ['4 — ', h('strong', 'bold'), ' ', h('a', { href: '/' }, 'link')]),
      ]),
    ]),
  ).toEqual({ data: [1, 4], labels: [], caption: '**bold** link' })
})
it('Bars list wins over Series; fields resolve independently and empty arrays win', () => {
  const nodes = [
    ul('before: 1 2', [h('strong', 'after'), ': 3 4']),
    h(Series, { label: 'ignored', values: [99] }),
  ]
  const w = mount(GraphBars, {
    props: { title: 'B', from: { label: 'prop', values: [] } },
    slots: { default: () => nodes },
  })
  expect(w.findAll('p').map((n) => n.text())).toEqual(['prop', 'after'])
  expect(w.findAll('[class~="w-[1ch]"]')).toHaveLength(2)
  w.unmount()
  const empty = mount(GraphBars, {
    props: { title: 'B', series: [] },
    slots: { default: () => nodes },
  })
  expect(empty.findAll('p').map((n) => n.text())).toEqual(['', ''])
  empty.unmount()
})
it('Series normalizes string, array, body, size and explicit empty values without mutating VNodes', () => {
  const nodes = [
    h(Series, { label: 'run', values: '2*3', size: 'lg' }),
    h(Series, { label: 'body' }, () => '3 4'),
    h(Series, { label: 'empty', values: [] }, () => '99'),
  ]
  const before = nodes.map((n) => ({ props: n.props, children: n.children }))
  expect(barsModel(nodes)).toEqual([
    { label: 'run', values: [2, 2, 2], size: 'lg' },
    { label: 'body', values: [3, 4], size: undefined },
    { label: 'empty', values: [], size: undefined },
  ])
  nodes.forEach((n, i) => {
    expect(n.props).toBe(before[i]!.props)
    expect(n.children).toBe(before[i]!.children)
  })
})
it('runtime filters header-anchor from list, raw source and Series body paths', () => {
  const anchor = () => h('a', { class: ['header-anchor'], href: '#' }, '99')
  expect(sparkModel([h('p', ['1 2', anchor(), ' — caption', anchor()])])).toEqual({
    data: [1, 2],
    labels: [],
    caption: 'caption',
  })
  expect(sparkModel([ul(['Mon: 2', anchor()])])).toEqual({ data: [2], labels: ['Mon'] })
  expect(barsModel([ul(['A: 2 3', anchor()])])[0]?.values).toEqual([2, 3])
  expect(barsModel([h(Series, { label: 'A' }, () => ['2 3', anchor()])])[0]?.values).toEqual([2, 3])
})
it('block boundaries stay separate numbers, as MDX keeps newlines the template compiler drops', () => {
  const nodes = [
    h(Series, { label: 'a' }, () => [h('p', '1 2'), h('p', '3 4')]),
    h(Series, { label: 'b' }, () => [ul('1', '2', '3')]),
  ]
  expect(barsModel(nodes).map((s) => s.values)).toEqual([
    [1, 2, 3, 4],
    [1, 2, 3],
  ])
  expect(barsModel([ul([h('p', 'A: 1 2'), h('p', '3 4')], 'B: 5')]).map((s) => s.values)).toEqual([
    [1, 2, 3, 4],
    [5],
  ])
  expect(sparkModel([h('h3', 'T'), h('p', '1 2 — cap')]).data).toEqual([1, 2])
  expect(sparkModel([h('blockquote', [h('p', '1 2'), h('p', '3')])]).data).toEqual([1, 2, 3])
  expect(sparkModel([ul([h('p', 'Mon: 1'), h('p', '2')])]).data).toEqual([1])
})
it('Spark data suppresses written caption while explicit caption, including empty, wins', () => {
  const input = () => hosts('DEPLOYS')
  for (const [props, caption] of [
    [{ data: [] }, undefined],
    [{ data: '1 2', caption: 'own' }, 'own'],
    [{ data: null, caption: '' }, undefined],
    [{ data: null }, 'three quiet days, then a busy week'],
  ] as const) {
    const w = mount(GraphSpark, { props: { title: 'S', ...props }, slots: { default: input } })
    expect(w.find('p').exists()).toBe(caption !== undefined)
    if (caption) expect(w.get('p').text()).toBe(caption)
    w.unmount()
  }
})
it.each([
  { data: [], points: '' },
  { data: [2], points: '█' },
  { data: [4, 4], points: '██' },
  { data: [0, 0], points: '▁▁' },
  { data: [-1, 0, 2], points: '▁▁█' },
  { data: [1, Number.NaN, 2], points: '▁▁▁' },
  { data: '1 NaN Infinity 2', points: '▅█' },
])('Spark upstream scaling for $data yields $points', ({ data, points }) => {
  const w = mount(GraphSpark, { props: { title: 'S', data } })
  expect(w.get('[class~="gap-0.5"][aria-hidden="true"]').text()).toBe(points)
  expect(w.get('.sr-only').text()).toBe(`Sparkline with ${numbers(data).length} points`)
  expect(w.get('[class~="gap-0.5"][aria-hidden="true"]').attributes('aria-hidden')).toBe('true')
  w.unmount()
})
it.each([
  { values: [], counts: [] },
  { values: [2], counts: [5] },
  { values: [4, 4], counts: [5, 5] },
  { values: [0, 0], counts: [1, 1] },
  { values: [-1, 0, 2], counts: [0, 1, 5] },
  { values: [1, Number.NaN, 2], counts: [0, 0, 0] },
])('Bars upstream cell scaling for $values', ({ values, counts }) => {
  const w = mount(GraphBars, { props: { title: 'B', from: { label: 'from', values } } })
  expect(
    w
      .findAll('[class~="w-[1ch]"]')
      .map(
        (n) => n.findAll('span').filter((s) => !s.classes().includes('text-transparent')).length,
      ),
  ).toEqual(counts)
  expect(w.findAll('[aria-hidden="true"] > .shrink-0').map((n) => n.text())).toEqual(['▶', '▶'])
  w.unmount()
})
it('custom glyphs, palettes, sizes and mono dim opacity follow upstream', () => {
  const spark = mount(GraphSpark, { props: { title: 'S', data: [0, 1], glyphs: ['.', '#'] } })
  expect(spark.get('[class~="gap-0.5"][aria-hidden="true"]').text()).toBe('.#')
  expect(spark.get('.text-graph-muted').attributes('style')).toBe('opacity: 0.4;')
  spark.unmount()
  const duo = mount(GraphSpark, { props: { title: 'S', data: [0, 1], palette: 'duo', glyphs: [] } })
  expect(duo.get('.text-graph-accent-2').attributes('style')).toBeUndefined()
  expect(duo.get('[class~="gap-0.5"][aria-hidden="true"]').text()).toBe('·█')
  duo.unmount()
  const bars = mount(GraphBars, {
    props: {
      title: 'B',
      from: { label: 'a', values: [1], size: 'lg' },
      to: { label: 'b', values: [1] },
      glyphs: 'ascii',
      palette: 'duo',
      processor: 'edit',
    },
  })
  expect(bars.findAll('[class~="w-[1ch]"]').map((n) => n.findAll('span').length)).toEqual([8, 5])
  expect(bars.findAll('[class~="h-[1em]"].text-graph-accent-2')).toHaveLength(8)
  expect(bars.text()).toContain('@')
  expect(bars.text()).toContain('edit')
  bars.unmount()
})
it.each(['GraphBars', 'GraphSpark'])('%s reacts to slot and prop changes', async (name) => {
  const value = ref(1),
    data = ref(false)
  const props = () =>
    name === 'GraphBars'
      ? { series: [{ label: 'prop', values: [value.value] }] }
      : { data: [value.value], caption: 'prop' }
  const app = defineComponent({
    setup: () => () =>
      h(widgets[name]!, { title: 'T', ...(data.value ? props() : {}) }, () => [
        name === 'GraphBars' ? ul(`slot: ${value.value}`) : h('p', `${value.value} — slot`),
      ]),
  })
  const w = mount(app)
  value.value = 2
  await nextTick()
  expect(w.text()).toContain('slot')
  data.value = true
  await nextTick()
  expect(w.text()).toContain('prop')
  expect(w.text()).not.toContain('slot')
  w.unmount()
})
it.each(['GraphBars', 'GraphSpark'])('%s caps reveal at 240 ms for long series', (name) => {
  const directive = vReveal as {
    mounted: (...args: [HTMLElement, { value?: { delay?: number } }]) => void
  }
  const mounted = vi.spyOn(directive, 'mounted')
  const values = Array.from({ length: 60 }, () => 1)
  const w = mount(widgets[name]!, {
    props:
      name === 'GraphBars'
        ? { title: 'B', from: { label: 'a', values }, to: { label: 'b', values } }
        : { title: 'S', data: values },
  })
  const delays = mounted.mock.calls.map((call) => call[1].value?.delay)
  expect(delays.at(-1)).toBe(240)
  expect(Math.max(...delays.map((d) => d ?? 0))).toBe(240)
  expect(delays[0]).toBe(name === 'GraphBars' ? 40 : 0)
  w.unmount()
  mounted.mockRestore()
})
it.each(['GraphBars', 'GraphSpark'])(
  '%s renders all 5000 points from the capped run grammar in SSR',
  async (name) => {
    const values = numbers('2*9999')
    expect(values).toHaveLength(5000)
    const props =
      name === 'GraphBars'
        ? { title: 'B', from: { label: 'a', values } }
        : { title: 'S', data: values }
    const html = await renderToString(createSSRApp({ render: () => h(widgets[name]!, props) }))
    expect(
      (
        html.match(
          name === 'GraphBars'
            ? /class="flex w-\[1ch\]/g
            : /class="min-w-0 flex-1 overflow-hidden text-center flex-none"/g,
        ) ?? []
      ).length,
    ).toBe(5000)
    expect(html).not.toMatch(/opacity:0(?:;|"|$)|translateY/)
  },
)
