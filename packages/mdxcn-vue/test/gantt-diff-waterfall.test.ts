import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, nextTick, ref, Fragment } from 'vue'
import type { Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { GraphGantt, GraphDiff, GraphWaterfall, Span, Line, Delta } from '../src'
import {
  ganttFromList,
  normalizeGantt,
  diffFromList,
  diffRewrite,
  waterfallFromList,
  normalizeWaterfall,
  waterfallSegments,
  formatWaterfall,
} from '../src/core'
import { diffList } from '../src/adapters/gantt-diff-waterfall'
import { metricItems } from '../src/adapters/stat-slope-bullet'
const item = (text: string, strong = false) => ({ text, strong, em: false, paragraphs: [] })
const list = (text: string) => [h('ul', [h('li', text)])]
const cases = [
  {
    component: GraphGantt,
    marker: Span,
    field: 'items',
    text: 'read: 0.2 0.8 0.5',
    data: { label: 'read', start: 0.2, end: 0.8, complete: 0.5 },
    selector: 'li > span:first-child',
    template: '<ul><li>{{ label }}: 0 {{ value }} 0.5</li></ul>',
  },
  {
    component: GraphDiff,
    marker: Line,
    field: 'rows',
    text: 'read: +2',
    data: { label: 'read', value: '2', sign: 'add' },
    selector: 'li > div > span:nth-child(2)',
    template: '<ul><li>{{ label }}: <del>old</del> {{ value }}</li></ul>',
  },
  {
    component: GraphWaterfall,
    marker: Delta,
    field: 'items',
    text: 'read: 2',
    data: { label: 'read', value: 2 },
    selector: 'li > div > span:first-child',
    template: '<ul><li>{{ label }}: {{ value }}</li></ul>',
  },
]
it('matches Gantt clamping, completion, playhead, axis labels, stage and custom marks', async () => {
  const w = mount(GraphGantt, {
    props: {
      title: 'T',
      columns: '10',
      progress: 1.2,
      stage: 'build',
      ticks: ['mon', 'fri'],
      glyphs: ['.', '+', '#'],
      palette: 'duo',
      items: [
        { label: 'design', start: -0.2, end: 0.3, complete: 1.5 },
        { label: 'build', start: 0.2, end: 0.8, complete: 0.5 },
        { label: 'reverse', start: 0.8, end: 0.2, complete: -1 },
        { label: 'outside', start: 1, end: 2 },
      ],
    },
  })
  expect(w.findAll('li > span:nth-child(2)').map((n) => n.text())).toEqual([
    '###.......',
    '..###+++..',
    '........+.',
    '..........',
  ])
  expect(w.get('li').attributes('aria-label')).toBe('design from -20% to 30%, 150% complete')
  expect(w.findAll('li')[1]!.get('span').classes()).toContain('text-graph-accent')
  expect(w.get('li').attributes('style')).toBeUndefined()
  await w.setProps({ palette: 'mono' })
  expect(w.get('li').attributes('style')).toContain('opacity: 0.4')
  const playhead = w.findAll('span').filter((n) => n.text() === '▾')
  expect(playhead).toHaveLength(10)
  expect(playhead[9]!.classes()).toContain('text-graph-accent')
  expect(playhead.slice(0, 9).every((n) => n.classes().includes('text-transparent'))).toBe(true)
  expect(w.findAll('.justify-between > span').map((n) => n.text())).toEqual(['mon', 'fri'])
  w.unmount()
})
it('preserves upstream Gantt numeric grammar instead of interpreting date strings', () => {
  expect(normalizeGantt([ganttFromList(item('task: -0.2 0.8 0.5', true))])).toEqual([
    { label: 'task', start: 0.2, end: 0.8, complete: 0.5, accent: true },
  ])
  expect(normalizeGantt([{ start: '2026-10-07', end: 'invalid', complete: Infinity }])).toEqual([
    { label: '', start: 2026, end: 0, complete: 0, accent: undefined },
  ])
  expect(ganttFromList(item('task 0.3'))).toEqual({
    label: 'task',
    start: '0.3',
    end: '0.3',
    complete: undefined,
    accent: false,
  })
  expect(normalizeGantt([ganttFromList(item(''))])[0]).toMatchObject({
    label: '',
    start: 0,
    end: 0,
  })
})
it('matches Diff signs, text values, first total and independent rows/footer precedence', () => {
  const hosts = () => [
    h('ul', [
      h('li', 'vendor: 84 kb'),
      h('li', 'app: +31 kb'),
      h('li', 'map: −12 kb'),
      h('li', [h('b', 'shipped: 103 kb')]),
      h('li', [h('b', 'ignored: 999')]),
    ]),
  ]
  const w = mount(GraphDiff, { props: { title: 'T', palette: 'duo' }, slots: { default: hosts } })
  expect(w.findAll('li > div > span:first-child').map((n) => n.element.textContent)).toEqual([
    ' ',
    '+',
    '-',
  ])
  expect(w.findAll('li > div > span:last-child').map((n) => n.text())).toEqual([
    '84 kb',
    '31 kb',
    '12 kb',
  ])
  expect(
    w.findAll('li > div > span[aria-hidden="true"]').filter((n) => n.text() === '+'),
  ).toHaveLength(1)
  expect(w.text()).toContain('103 kb')
  expect(w.text()).not.toContain('999')
  expect(w.findAll('li')[2]!.get('span:nth-child(2)').classes()).toContain('text-graph-accent-2')
  w.unmount()
  for (const [props, expectedRows, expectedFooter] of [
    [{ rows: [] }, 0, '103 kb'],
    [{ rows: null, footer: { label: 'override', value: '0' } }, 3, 'override'],
    [{ rows: [{ label: 'data', value: '7' }], footer: null }, 1, '103 kb'],
    [{ list: [] }, 0, ''],
  ] as const) {
    const x = mount(GraphDiff as Component, {
      props: { title: 'T', ...props },
      slots: { default: hosts },
    })
    expect(x.findAll('li')).toHaveLength(expectedRows)
    if (expectedFooter) expect(x.text()).toContain(expectedFooter)
    else expect(x.text()).not.toContain('shipped')
    x.unmount()
  }
})
it('expands only direct strike nodes in the first paragraph, preserving shared prefixes', () => {
  expect(
    diffList([
      h('ul', [h('li', [h('p', ['config: ', h('del', 'old'), ' new']), h('p', 'ignored')])]),
    ]),
  ).toEqual([
    { label: 'config: old', value: '', sign: 'remove' },
    { label: 'config: new', value: '', sign: 'add' },
  ])
  expect(diffList([h('li', ['prefix ', h('s', 'old'), h('del', 'older'), ' new'])])).toEqual([
    { label: 'prefix oldolder', value: '', sign: 'remove' },
    { label: 'prefix new', value: '', sign: 'add' },
  ])
  expect(diffRewrite([{ text: '', struck: true }])).toEqual([])
  expect(diffList([h('li', h('b', [h('del', 'old'), ' new']))])).toEqual([
    { label: 'old new', value: '', sign: undefined, total: true },
  ])
  expect(diffFromList(item('only: +'))).toEqual([
    { label: 'only', value: '+', sign: 'add', total: false },
  ])
})
it('matches cumulative Waterfall ranges including negative running totals and explicit kinds', () => {
  const segments = waterfallSegments(
    normalizeWaterfall([
      { label: 'start', value: 2 },
      { label: 'out', value: -5 },
      { label: 'in', value: -1, kind: 'in' },
      { label: 'end', value: -2 },
    ]),
  )
  expect(segments.map((s) => [s.kind, s.from, s.to])).toEqual([
    ['start', 0, 2],
    ['out', -3, 2],
    ['in', -3, -2],
    ['end', 0, -2],
  ])
  const w = mount(GraphWaterfall, {
    props: { title: 'T', ticks: '10', palette: 'duo', items: segments },
  })
  expect(w.findAll('li > div > span:nth-child(2)').map((n) => n.text())).toEqual([
    '------████',
    '██████████',
    '██--------',
    '--████----',
  ])
  expect(w.findAll('li > div > span:last-child').map((n) => n.text())).toEqual([
    '2',
    '−5',
    '+1',
    '-2',
  ])
  expect(w.get('.sr-only').text()).toBe('start 2, out −5, in +1, end -2')
  expect(w.findAll('li > .graph-rule')).toHaveLength(1)
  w.unmount()
})
it('treats an unknown Waterfall kind like upstream: reset the running total, no delta', () => {
  const rows = normalizeWaterfall([
    { label: 'a', value: 5 },
    { label: 'z', value: 4, kind: 'bogus' as never },
    { label: 'b', value: 3 },
    { label: 'c', value: 9 },
  ])
  expect(waterfallSegments(rows).map((s) => [s.from, s.to])).toEqual([
    [0, 5],
    [0, 4],
    [4, 7],
    [0, 9],
  ])
  const w = mount(GraphWaterfall, { props: { title: 'T', ticks: 4, items: rows } })
  expect(w.findAll('li > div > span:last-child').map((n) => n.classes('text-foreground'))).toEqual([
    true,
    false,
    true,
    false,
  ])
  w.unmount()
})
it('preserves Waterfall number grammar, formatting and zero/single/explicit reset behavior', () => {
  expect(
    normalizeWaterfall([
      waterfallFromList(item('cost -1,234.5')),
      waterfallFromList(item('Unicode: −2')),
      { value: Infinity },
      { value: 'missing' },
    ]).map((s) => s.value),
  ).toEqual([-1234.5, 0, 0, 0])
  expect(waterfallFromList(item('Missing'))).toEqual({ label: 'Missing', value: '' })
  expect(formatWaterfall({ label: '', value: 1234.5, display: '' }, 'in')).toBe('+1,234.5')
  expect(formatWaterfall({ label: '', value: 0, display: 'free' }, 'out')).toBe('free')
  expect(waterfallSegments(normalizeWaterfall([{ value: 0 }]))[0]).toMatchObject({
    kind: 'start',
    from: 0,
    to: 0,
  })
  expect(
    waterfallSegments(
      normalizeWaterfall([{ value: 5 }, { value: 1, kind: 'end' }, { value: 2, kind: 'out' }]),
    ).map((s) => [s.from, s.to]),
  ).toEqual([
    [0, 5],
    [0, 1],
    [-1, 1],
  ])
  const w = mount(GraphWaterfall, { props: { title: 'T', ticks: 4, items: [{ value: 0 }] } })
  expect(w.get('li > div > span:nth-child(2)').text()).toBe('█---')
  w.unmount()
})
it('normalizes marker attributes, booleans, empty labels and fragment boundaries', () => {
  expect(
    metricItems(
      [
        h(Fragment, null, [
          h(
            Span as Component,
            { start: '0.2', end: '0.8', complete: '0', accent: '' },
            () => 'build',
          ),
        ]),
      ],
      Span,
    ),
  ).toEqual([{ label: 'build', start: 0.2, end: 0.8, complete: 0, accent: true }])
  expect(
    metricItems(
      [h(Line as Component, { value: '0', sign: 'keep', total: '', label: '' }, () => 'ignored')],
      Line,
    ),
  ).toEqual([{ label: '', value: '0', sign: 'keep', total: true }])
  expect(metricItems([h(Delta, { value: '-1,200', kind: 'out' }, () => 'cost')], Delta)).toEqual([
    { label: 'cost', value: -1200, kind: 'out', display: undefined },
  ])
  expect(
    metricItems([h(defineComponent({ setup: () => () => h(Span, { start: 0, end: 1 }) }))], Span),
  ).toEqual([])
})
it.each(cases)(
  'renders lists, compiler models, props and markers equally in $component.name',
  ({ component, marker, field, text, data }) => {
    const hosts = [
      mount(component as Component, {
        props: { title: 'T' },
        slots: { default: () => list(text) },
      }),
      mount(component as Component, { props: { title: 'T', list: [item(text)] } }),
      mount(component as Component, { props: { title: 'T', [field]: [data] } }),
      mount(component as Component, {
        props: { title: 'T' },
        slots: { default: () => h(marker as Component, data) },
      }),
    ]
    const bodies = hosts.map((w) =>
      w
        .get('ul')
        .html()
        .replace(/<!---->/g, ''),
    )
    expect(bodies.slice(1)).toEqual([bodies[0], bodies[0], bodies[0]])
    hosts.forEach((w) => w.unmount())
  },
)
it.each(cases)(
  'resolves empty/null data, compiler and runtime list priority in $component.name',
  ({ component, marker, field, text, data, selector }) => {
    for (const [extra, expected] of [
      [{ [field]: [] }, 0],
      [{ [field]: null }, 1],
      [{ list: [] }, 0],
      [{ list: null }, 1],
    ] as const) {
      const w = mount(component as Component, {
        props: { title: 'T', ...extra },
        slots: {
          default: () => [...list(text), h(marker as Component, { ...data, label: 'tagged' })],
        },
      })
      expect(w.findAll('li')).toHaveLength(expected)
      if (expected) expect(w.get(selector).text()).toBe('read')
      w.unmount()
    }
    const w = mount(component as Component, {
      props: { title: 'T', [field]: [{ ...data, label: 'data' }], list: [item(text)] },
    })
    expect(w.get(selector).text()).toBe('data')
    w.unmount()
    const x = mount(component as Component, {
      props: { title: 'T' },
      slots: { default: () => [h('ul'), h(marker as Component, data)] },
    })
    expect(x.get(selector).text()).toBe('read')
    x.unmount()
  },
)
it.each(cases)(
  'updates compiled slots reactively in $component.name',
  async ({ component, template }) => {
    const value = ref('0.2'),
      label = ref('before')
    const w = mount(
      defineComponent({
        components: { Widget: component },
        setup: () => ({ value, label }),
        template: `<Widget title="T">${template}</Widget>`,
      }),
    )
    value.value = '0.4'
    label.value = 'after'
    await nextTick()
    expect(w.get('ul').text()).toContain('after')
    expect(w.get('ul').text()).not.toMatch(/before|object Object/)
    if (component === GraphDiff) expect(w.findAll('li')[1]!.text()).toContain('0.4')
    else if (component === GraphWaterfall) expect(w.get('li').text()).toContain('0.4')
    else expect(w.get('li').attributes('aria-label')).toContain('to 40%')
    w.unmount()
  },
)
it.each(cases)(
  'hydrates visible SSR and forwards frame attrs in $component.name',
  async ({ component, text }) => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const app = defineComponent({
      setup: () => () =>
        h(
          component as Component,
          {
            title: 'T',
            corner: 'x',
            className: 'custom',
            class: 'host',
            'data-test': 'final',
            ...(component === GraphGantt
              ? { progress: 0.5, ticks: ['mon', 'fri'], stage: 'read', palette: 'mono' }
              : {}),
          },
          () =>
            component === GraphDiff
              ? [
                  h('ul', [
                    h('li', ['config: ', h('del', 'old'), ' new']),
                    h('li', h('b', 'total: 2')),
                  ]),
                ]
              : component === GraphWaterfall
                ? [h('ul', [h('li', text), h('li', 'cost: -5'), h('li', 'total: -3')])]
                : list(text),
        ),
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
    expect(host.querySelector('figure')!.classList.contains('custom')).toBe(true)
    expect(host.querySelector('figure')!.classList.contains('host')).toBe(true)
    expect(host.querySelector('figure')!.getAttribute('data-test')).toBe('final')
    client.unmount()
    host.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  },
)
