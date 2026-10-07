import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, Fragment, h, nextTick, ref } from 'vue'
import type { Component, VNode } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { GraphCells, GraphMeter, GraphWaffle, Grid } from '../src'
import { fraction, fractionOf, gridCellsOf } from '../src/core'
import { cellsModel, fractionModel } from '../src/adapters/grid-fraction'
import { vReveal } from '../src/directives/reveal'
import fixtures from './fixtures/grid-fraction-examples.json'
const widgets: Record<string, Component> = { GraphCells, GraphMeter, GraphWaffle }
const strip = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ id="[^"]*"/g, '')
    .replace(/ aria-labelledby="[^"]*"/g, '')
const hosts = (c: (typeof fixtures)[number]): VNode[] =>
  c.body
    ? c.name === 'GraphCells'
      ? [
          h(
            'ul',
            c.body.split('\n').map((line) => h('li', line.slice(2))),
          ),
        ]
      : [h('p', c.body)]
    : []
const glyphs = (w: ReturnType<typeof mount>, name: string) =>
  w
    .findAll(name === 'GraphMeter' ? '.block.w-full' : '[aria-hidden="true"] span')
    .map((node) => node.text())
    .join('')
it.each(fixtures)('$name $props.title matches independent upstream models and glyphs', (c) => {
  const input = hosts(c)
  if (c.body)
    expect(
      JSON.parse(
        JSON.stringify(
          c.name === 'GraphCells'
            ? { items: cellsModel(input) }
            : { written: fractionModel(input) },
        ),
      ),
    ).toEqual(c.model)
  const runtime = mount(widgets[c.name]!, {
    props: c.props as Record<string, unknown>,
    slots: { default: () => input },
  })
  const model = mount(widgets[c.name]!, { props: { ...c.props, ...c.model } })
  const direct = mount(widgets[c.name]!, {
    props: {
      ...c.props,
      ...(c.name === 'GraphCells'
        ? c.model
        : c.body
          ? { value: c.model.written!.token, caption: c.model.written!.caption }
          : {}),
    },
  })
  expect(strip(runtime.html())).toBe(strip(model.html()))
  expect(strip(runtime.html())).toBe(strip(direct.html()))
  const text = glyphs(runtime, c.name)
  expect(text).toBe(
    c.glyphs ??
      '█'.repeat(c.filled) +
        '░'.repeat(Number('cells' in c.props ? c.props.cells : 100) - c.filled),
  )
  if (c.summary) expect(runtime.get('.sr-only').text()).toBe(c.summary)
  else expect(runtime.find('.sr-only').exists()).toBe(false)
  expect(runtime.find('[role="meter"]').exists()).toBe(false)
  runtime.unmount()
  model.unmount()
  direct.unmount()
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
    const before = container.innerHTML,
      warn = vi.spyOn(console, 'warn'),
      error = vi.spyOn(console, 'error'),
      client = createSSRApp(app)
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
  },
)
it.each([
  [0, 0],
  ['0', 0],
  ['100%', 1],
  ['150%', 1.5],
  [-1, -1],
  ['-25%', -0.25],
  ['bad', 0],
  ['NaN', 0],
  ['Infinity', 0],
  [Number.NaN, Number.NaN],
  [Infinity, Infinity],
  ['12,400%', 0.12],
  ['1e-1', 0.1],
  ['.5junk', 0.5],
  ['', 0],
  [null, 0],
])('fraction preserves upstream grammar for %s', (value, expected) =>
  expect(fraction(value)).toBe(expected),
)
it.each(['GraphMeter', 'GraphWaffle'])(
  '%s clamps and rounds while retaining numeric NaN',
  (name) => {
    for (const [value, percent] of [
      [0, '0'],
      ['150%', '100'],
      [-1, '0'],
      ['bad', '0'],
      [Number.NaN, 'NaN'],
      [Infinity, '100'],
      [-Infinity, '0'],
      ['33.5%', '34'],
    ] as const) {
      const w = mount(widgets[name]!, {
        props: { title: 'T', value, ticks: 3, cells: 3, columns: 2 },
      })
      expect(w.get('.sr-only').text()).toBe(`${percent} percent`)
      expect(glyphs(w, name)).toBe(
        name === 'GraphMeter'
          ? percent === '100'
            ? '==='
            : percent === '34'
              ? '=--'
              : '---'
          : percent === '100'
            ? '███'
            : percent === '34'
              ? '█░░'
              : '░░░',
      )
      w.unmount()
    }
  },
)
it.each(['GraphMeter', 'GraphWaffle'])(
  '%s respects caption/value null and empty precedence',
  (name) => {
    const w = mount(widgets[name]!, {
      props: { title: 'T' },
      slots: { default: () => h('p', '67% — written caption') },
    })
    expect(w.get('.sr-only').text()).toContain('written caption')
    w.setProps({ value: 0 })
    return nextTick().then(async () => {
      expect(w.get('.sr-only').text()).toBe('0 percent')
      await w.setProps({ caption: 'explicit' })
      expect(w.get('.sr-only').text()).toContain('explicit')
      await w.setProps({ value: null, caption: '' })
      expect(w.get('.sr-only').text()).toBe('67 percent')
      await w.setProps({ value: '', caption: null })
      expect(w.get('.sr-only').text()).toBe('0 percent')
      w.unmount()
    })
  },
)
it('Grid precedence, direct blocks, slash rows, paragraph and newline fallback', () => {
  const tagged = [h(Grid, { label: 'blocks' }, () => [h('p', '1,0 / 1'), h('p', '0 1')])]
  expect(cellsModel(tagged)).toEqual([
    {
      label: 'blocks',
      cells: [
        [1, 0, 1],
        [0, 1],
      ],
    },
  ])
  expect(cellsModel([h(Grid, { label: 'slash' }, () => h('p', '1 0 / 0 1'))])).toEqual([
    {
      label: 'slash',
      cells: [
        [1, 0],
        [0, 1],
      ],
    },
  ])
  expect(cellsModel([h(Grid, { label: 'lines' }, () => ['1 0\n0 1'])])).toEqual([
    {
      label: 'lines',
      cells: [
        [1, 0],
        [0, 1],
      ],
    },
  ])
  expect(cellsModel([h(Grid, { label: 'lines' }, () => [h('p', '1 0'), 'ignored\n1'])])).toEqual([
    { label: 'lines', cells: [[1, 0]] },
  ])
  expect(cellsModel([h(Grid, { label: 'empty', cells: [] }, () => '1')])).toEqual([
    { label: 'empty', cells: [] },
  ])
  const nodes = [...tagged, h('ul', [h('li', ['listed: 1', h('ul', h('li', 'ignored: 0'))])])]
  expect(cellsModel(nodes)).toEqual([{ label: 'listed', cells: [[1]] }])
  const w = mount(GraphCells, { props: { title: 'T', items: [] }, slots: { default: () => nodes } })
  expect(w.text()).not.toMatch(/listed|blocks/)
  w.unmount()
})
it('grid rows retain finite numbers without run expansion; only exact 1 fills', () => {
  expect(gridCellsOf('1,0 NaN 2*3 -1 0.5 0x1 Infinity / / 2')).toEqual([[1, 0, -1, 0.5, 1], [2]])
  const w = mount(GraphCells, {
    props: { title: 'T', items: [{ label: 'r', cells: [[1, 0, -1, 0.5, 2, Number.NaN]] }] },
  })
  expect(glyphs(w, 'GraphCells')).toBe('█·····')
  w.unmount()
})
it.each(['GraphCells', 'GraphMeter', 'GraphWaffle'])(
  '%s filters permalinks, reads fragments and keeps custom wrappers opaque',
  (name) => {
    const hidden = defineComponent({ setup: () => () => h('p', '99% leaked') })
    const nodes = [
      h(Fragment, {}, [
        h('h2', [h('a', { class: ['header-anchor'] }, '#')]),
        h('p', '67% — caption'),
      ]),
      h(hidden),
    ]
    expect(fractionModel(nodes)).toEqual({ token: '67%', caption: 'caption' })
    expect(
      cellsModel([
        h(Fragment, {}, [
          h(Grid, { label: 'r' }, () => [
            h('p', ['1 ', h('a', { class: 'header-anchor' }, '99'), '0']),
          ]),
        ]),
      ]),
    ).toEqual([{ label: 'r', cells: [[1, 0]] }])
    const w = mount(widgets[name]!, { props: { title: 'T' }, slots: { default: () => nodes } })
    expect(w.html()).not.toMatch(/header-anchor|leaked/)
    w.unmount()
  },
)
it.each(['GraphCells', 'GraphMeter', 'GraphWaffle'])(
  '%s caps filled-cell reveal at 240 ms',
  (name) => {
    const directive = vReveal as {
      mounted: (...args: [HTMLElement, { value?: { delay?: number } }]) => void
    }
    const spy = vi.spyOn(directive, 'mounted')
    const w = mount(widgets[name]!, {
      props: {
        title: 'T',
        value: 1,
        ticks: 60,
        cells: 100,
        items: [{ label: 'r', cells: [Array.from({ length: 60 }, () => 1)] }],
      },
    })
    const delays = spy.mock.calls.map((call) => call[1].value?.delay ?? 0)
    expect(delays[0]).toBe(0)
    expect(delays[1]).toBe(name === 'GraphWaffle' ? 6 : 30)
    expect(delays.at(-1)).toBe(240)
    expect(Math.max(...delays)).toBe(240)
    w.unmount()
    spy.mockRestore()
  },
)
it('Waffle partial rows preserve blank padding and independent rounding', () => {
  const w = mount(GraphWaffle, { props: { title: 'T', value: '50%', cells: '3', columns: '2' } })
  expect(w.findAll('[aria-hidden="true"] div')).toHaveLength(2)
  expect(w.findAll('[aria-hidden="true"] span')).toHaveLength(4)
  expect(glyphs(w, 'GraphWaffle')).toBe('██░')
  expect(w.get('.sr-only').text()).toBe('50 percent')
  w.unmount()
})
it.each(['GraphMeter', 'GraphWaffle'])(
  '%s renders empty tracks and preserves fractional length conversion',
  (name) => {
    for (const count of [0, -1, Number.NaN, 2.5]) {
      const w = mount(widgets[name]!, {
        props: { title: 'T', value: 1, ticks: count, cells: count, columns: 2 },
      })
      expect(glyphs(w, name).length).toBe(count === 2.5 ? (name === 'GraphMeter' ? 2 : 3) : 0)
      w.unmount()
    }
  },
)
it('empty Cells renders no grids and Waffle rejects infinite row length as upstream', () => {
  expect(cellsModel([])).toEqual([])
  expect(fractionOf('')).toEqual({ token: '', caption: undefined })
  const w = mount(GraphCells, { props: { title: 'T' } })
  expect(w.findAll('[aria-hidden="true"] span')).toHaveLength(0)
  w.unmount()
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  try {
    expect(() => mount(GraphWaffle, { props: { title: 'T', columns: 0 } })).toThrow(RangeError)
  } finally {
    warn.mockRestore()
  }
})
it.each(['GraphMeter', 'GraphWaffle'])(
  '%s applies custom glyphs, palette and static count props',
  (name) => {
    const w = mount(widgets[name]!, {
      props: {
        title: 'T',
        value: 0.5,
        ticks: '4',
        cells: '4',
        columns: '2',
        glyphs: ['.', '#'],
        palette: 'duo',
      },
    })
    expect(glyphs(w, name)).toBe('##..')
    expect(w.findAll('.text-graph-accent')).not.toHaveLength(0)
    w.unmount()
  },
)
it('Cells palette, Grid cells and reactive props/slots retain schema ownership', async () => {
  const value = ref('25%'),
    label = ref('first')
  const app = defineComponent({
    setup: () => () =>
      h('div', [
        h(GraphMeter, { title: 'T' }, () => `${value.value} — caption`),
        h(GraphCells, { title: 'C', palette: 'duo', glyphs: ['.', '#'] }, () =>
          h(Grid, { label: label.value, cells: [[1, 0]] }, () => '0'),
        ),
      ]),
  })
  const w = mount(app)
  expect(w.text()).toContain('25%')
  expect(w.text()).toContain('first')
  expect(w.find('.text-graph-accent').exists()).toBe(true)
  value.value = '75%'
  label.value = 'second'
  await nextTick()
  expect(w.text()).toContain('75%')
  expect(w.text()).toContain('second')
  w.unmount()
})
it('block boundaries keep MDX newlines the template compiler drops', () => {
  // `67%` and `used` are separate blocks: gluing them would read `67%used`, which is 100 percent.
  expect(fractionModel([h('p', '67%'), h('p', 'used')])).toEqual(fractionOf('67%\nused'))
  expect(fractionModel([h('p', '67%'), h('p', '— used')])).toEqual(fractionOf('67%\n— used'))
  expect(fractionModel([h('ul', [h('li', '67%'), h('li', '33%')])])).toEqual(fractionOf('67%\n33%'))
  expect(fractionModel([h('h3', '67%'), h('p', 'used')])).toEqual(fractionOf('67%\nused'))
  expect(fractionModel([h('p', '67%'), h('p', 'used')]).token).toBe('67%')
  // Loose item: the second paragraph is a new line of cells, never glued to the first.
  expect(cellsModel([h('ul', [h('li', [h('p', 'a: 1 0'), h('p', '0 1')])])])).toEqual([
    { label: 'a', cells: [[1, 0, 0, 1]] },
  ])
})
