import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, nextTick, ref, Fragment } from 'vue'
import type { Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { GraphStat, GraphSlope, GraphBullet, Stat, Slope, Target } from '../src'
import {
  statFromList,
  slopeFromList,
  bulletFromList,
  normalizeSlope,
  normalizeBullet,
} from '../src/core'
import { metricItems } from '../src/adapters/stat-slope-bullet'
const item = (text: string, strong = false) => ({ text, strong, em: false, paragraphs: [] })
const list = (rows: string[]) => [
  h(
    'ul',
    rows.map((row) => h('li', row)),
  ),
]
const cases: {
  component: Component
  marker: Component
  props: Record<string, string>
  text: string
  data: Record<string, string | number>
  selector: string
}[] = [
  {
    component: GraphStat,
    marker: Stat,
    props: { title: 'T' },
    text: '142ms read — −18ms',
    data: { value: '142ms', label: 'read', hint: '−18ms' },
    selector: 'li > p:nth-child(2)',
  },
  {
    component: GraphSlope,
    marker: Slope,
    props: { title: 'T', fromLabel: 'before', toLabel: 'after' },
    text: 'read: 160 → 142',
    data: { label: 'read', from: 160, to: 142 },
    selector: 'li > span:first-child',
  },
  {
    component: GraphBullet,
    marker: Target,
    props: { title: 'T' },
    text: 'read: 72 / 80 of 100',
    data: { label: 'read', value: 72, target: 80, max: 100 },
    selector: 'li > span:first-child',
  },
]
it('preserves stat tokens, accents, hints and responsive column limits', () => {
  const w = mount(GraphStat, {
    props: { title: 'WEEK' },
    slots: {
      default: () => [
        h('ul', [
          h('li', '12,400 docs'),
          h('li', '4,100 copies'),
          h('li', [h('strong', '860 shipped')]),
        ]),
      ],
    },
  })
  expect(w.findAll('li > p:first-child').map((n) => n.text())).toEqual(['12,400', '4,100', '860'])
  expect(w.findAll('li > p:nth-child(2)').map((n) => n.text())).toEqual([
    'docs',
    'copies',
    'shipped',
  ])
  expect(w.findAll('li')[2]!.get('p').classes()).toContain('text-graph-accent')
  expect(w.get('ul').classes()).toContain('sm:grid-cols-3')
  expect(w.get('ul').attributes('role')).toBe('list')
  w.unmount()
  const x = mount(GraphStat, {
    props: { title: 'P95' },
    slots: {
      default: () => [
        h('ul', [h('li', '142ms read — −18ms'), h('li', [h('b', '410ms write — +22ms')])]),
      ],
    },
  })
  expect(x.findAll('li > p:last-child').map((n) => n.text())).toEqual(['−18ms', '+22ms'])
  expect(x.get('ul').classes()).toContain('sm:grid-cols-2')
  x.unmount()
  const y = mount(GraphStat, {
    props: { title: 'T', items: Array.from({ length: 6 }, (_, i) => ({ value: i })) },
  })
  expect(y.get('ul').classes()).toContain('sm:grid-cols-4')
  expect(y.findAll('li > p:nth-child(2)').every((n) => n.text() === '')).toBe(true)
  y.unmount()
})
it('matches traffic formatting and primary/secondary slope tones in input order', () => {
  const w = mount(GraphSlope, {
    props: { title: 'TRAFFIC', fromLabel: '2025', toLabel: '2026', palette: 'duo' },
    slots: {
      default: () => list(['docs: 8,200 → 12,400', 'copy: 5,100 → 4,100', 'ship: 640 → 860']),
    },
  })
  expect(w.findAll('li').map((n) => n.attributes('aria-label'))).toEqual([
    'docs from 8,200 to 12,400',
    'copy from 5,100 to 4,100',
    'ship from 640 to 860',
  ])
  expect(w.findAll('li > span:nth-child(3)').map((n) => n.text())).toEqual(['→', '→', '→'])
  expect(w.findAll('li')[0]!.get('span:last-child').classes()).toContain('text-graph-accent')
  expect(w.findAll('li')[1]!.get('span:last-child').classes()).toContain('text-graph-accent-2')
  expect(
    w.findAll('li > span:nth-child(3)').every((n) => n.attributes('aria-hidden') === 'true'),
  ).toBe(true)
  expect(w.findAll('figure div > div > span').map((n) => n.text())).toEqual([
    '',
    '2025',
    '',
    '2026',
  ])
  w.unmount()
})
it('matches latency slopes including neutral direction', () => {
  const w = mount(GraphSlope, {
    props: { title: 'P95', fromLabel: 'before', toLabel: 'after' },
    slots: { default: () => list(['read: 160 → 142', 'write: 388 → 410', 'cache: 12 → 12']) },
  })
  expect(w.findAll('li > span:last-child').map((n) => n.text())).toEqual(['142', '410', '12'])
  expect(w.findAll('li > span:nth-child(3)').map((n) => n.text())).toEqual(['→', '→', '–'])
  expect(w.findAll('li')[2]!.get('span:last-child').classes()).toContain('text-foreground')
  w.unmount()
})
it('matches targets and capacity with independent tick positions', () => {
  const w = mount(GraphBullet, {
    props: { title: 'BUDGET' },
    slots: { default: () => list(['Design: 42 / 40', 'Motion: 18 / 24', 'Docs: 9 / 12']) },
  })
  expect(w.findAll('li > span:last-child').map((n) => n.text())).toEqual([
    '42 / 40',
    '18 / 24',
    '9 / 12',
  ])
  expect(w.findAll('li > span:nth-child(2)').map((n) => n.text())).toEqual([
    '[===================|]',
    '[===============----|]',
    '[===============----|]',
  ])
  expect(w.get('li').attributes('aria-label')).toBe('Design 42 / 40')
  w.unmount()
  const x = mount(GraphBullet, {
    props: { title: 'LOAD', palette: 'duo' },
    slots: {
      default: () => list(['CPU: 72 / 80 of 100', 'RAM: 34 / 64 of 100', 'SSD: 91 / 90 of 100']),
    },
  })
  expect(x.findAll('li > span:nth-child(2)').map((n) => n.text())).toEqual([
    '[==============--|---]',
    '[=======------|------]',
    '[==================|-]',
  ])
  expect(x.findAll('li')[0]!.findAll('span.text-graph-accent-2')).toHaveLength(1)
  expect(
    x.findAll('li [aria-hidden="true"]').filter((n) => n.text() === '[' || n.text() === ']'),
  ).toHaveLength(6)
  x.unmount()
})
it.each(['→', '->', '—>', '=>'])('reads slope separator %s', (arrow) => {
  expect(normalizeSlope([slopeFromList(item(`read: -2.5 ${arrow} 1,234.5`))])).toEqual([
    { label: 'read', from: -2.5, to: 1234.5 },
  ])
})
it.each(['-2.5', '0', '1,234.5', '82%', '4ms', 'missing', '−2', '.5'])(
  'keeps stat token %s as text',
  (value) => {
    expect(statFromList(item(`${value} docs – +12%`, true))).toEqual({
      value,
      label: 'docs',
      hint: '+12%',
      accent: true,
    })
  },
)
it('normalizes missing, finite, zero and decimal values without losing optional targets', () => {
  expect(
    normalizeSlope([slopeFromList(item('Missing')), { from: 'missing', to: Infinity }]),
  ).toEqual([
    { label: 'Missing', from: 0, to: 0 },
    { label: '', from: 0, to: 0 },
  ])
  expect(
    normalizeBullet([
      bulletFromList(item('Missing')),
      bulletFromList(item('A: -2.5 / 0 OF 1,234.5')),
    ]),
  ).toEqual([
    { label: 'Missing', value: 0, target: undefined, max: undefined, display: undefined },
    { label: 'A', value: -2.5, target: 0, max: 1234.5, display: undefined },
  ])
  expect(statFromList(item(''))).toEqual({ value: '', label: '', hint: undefined, accent: false })
})
it('clamps targets outside the scale, colors overshoot and supports custom marks', () => {
  const w = mount(GraphBullet, {
    props: {
      title: 'T',
      ticks: '4',
      palette: 'duo',
      glyphs: ['.', '+', '#'],
      items: [
        { label: 'negative', value: -2, target: -3, max: 10 },
        { label: 'outside', value: 8, target: 20, max: 10 },
        { label: 'over', value: 10, target: 5, max: 10 },
        { label: 'none', value: 1.25, display: '' },
        { label: 'zero', value: 0, target: 0, max: 0 },
        { label: 'display', value: '1,234.5', target: '2,000', display: '61.7%' },
      ],
    },
  })
  expect(w.findAll('li > span:nth-child(2)').map((n) => n.text())).toEqual([
    '[|...]',
    '[###|]',
    '[##|#]',
    '[####]',
    '[....]',
    '[##.|]',
  ])
  expect(w.findAll('li > span:last-child').map((n) => n.text())).toEqual([
    '-2 / -3',
    '8 / 20',
    '10 / 5',
    '1.3',
    '0 / 0',
    '61.7%',
  ])
  expect(w.findAll('li')[2]!.findAll('span.text-graph-accent-2')).toHaveLength(2)
  w.unmount()
})
it('normalizes marker attributes, fragment children and explicit empty labels', () => {
  expect(
    metricItems(
      [
        h(Fragment, null, [
          h(Stat as Component, { value: '12,400', accent: '', hint: '+12%' }, () => 'docs'),
        ]),
      ],
      Stat,
    ),
  ).toEqual([{ value: '12,400', label: 'docs', hint: '+12%', accent: true }])
  expect(
    metricItems([h(Slope, { from: '1,200', to: '2.5', label: '' }, () => 'ignored')], Slope),
  ).toEqual([{ label: '', from: 1200, to: 2.5 }])
  expect(
    metricItems([h(Target, { value: '72', target: '0', max: '100' }, () => 'CPU')], Target),
  ).toEqual([{ label: 'CPU', value: 72, target: 0, max: 100, display: undefined }])
  const wrapper = defineComponent({ setup: () => () => h(Stat, { value: 1 }) })
  expect(metricItems([h(wrapper)], Stat)).toEqual([])
})
it.each(cases)(
  'renders runtime lists, compiler models, data and markers equally in $component.name',
  ({ component, marker, props, text, data }) => {
    const hosts = [
      mount(component as Component, { props, slots: { default: () => list([text]) } }),
      mount(component as Component, { props: { ...props, list: [item(text)] } }),
      mount(component as Component, { props: { ...props, items: [data] } }),
      mount(component as Component, {
        props,
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
  'resolves explicit empty data, null fallback and list priority in $component.name',
  ({ component, marker, props, text, data, selector }) => {
    for (const [extra, expected] of [
      [{ items: [] }, 0],
      [{ items: null }, 1],
      [{ list: [] }, 0],
    ] as const) {
      const w = mount(component as Component, {
        props: { ...props, ...extra },
        slots: {
          default: () => [...list([text]), h(marker as Component, { ...data, label: 'tagged' })],
        },
      })
      expect(w.findAll('li')).toHaveLength(expected)
      if (expected) expect(w.get(selector).text()).toBe('read')
      w.unmount()
    }
    const x = mount(component as Component, {
      props: { ...props, items: [{ ...data, label: 'data' }], list: [item(text)] },
    })
    expect(x.get(selector).text()).toBe('data')
    x.unmount()
  },
)
it.each(cases)(
  'updates compiled slots reactively in $component.name',
  async ({ component, props }) => {
    const value = ref('2'),
      label = ref('before')
    const template =
      component === GraphStat
        ? '<Widget v-bind="props"><ul><li><b>{{ value }} {{ label }} — +12%</b></li></ul></Widget>'
        : component === GraphSlope
          ? '<Widget v-bind="props"><ul><li>{{ label }}: 1 → {{ value }}</li></ul></Widget>'
          : '<Widget v-bind="props"><ul><li>{{ label }}: {{ value }} / 5 of 10</li></ul></Widget>'
    const w = mount(
      defineComponent({
        components: { Widget: component },
        setup: () => ({ value, label, props }),
        template,
      }),
    )
    expect(w.text()).toContain('before')
    value.value = '4'
    label.value = 'after'
    await nextTick()
    expect(w.text()).toContain('after')
    expect(w.text()).toContain('4')
    expect(w.get('li').text()).not.toMatch(/before|object Object/)
    w.unmount()
  },
)
it.each(cases)(
  'hydrates visible SSR and forwards frame attributes in $component.name',
  async ({ component, props, text }) => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const app = defineComponent({
      setup: () => () =>
        h(
          component as Component,
          { ...props, corner: 'x', className: 'custom', class: 'host', 'data-test': 'metrics' },
          () => list([text]),
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
    expect(host.querySelector('figure')!.getAttribute('data-test')).toBe('metrics')
    expect([...host.querySelectorAll('figure > span')].map((n) => n.textContent)).toEqual([
      'x',
      'x',
      'x',
      'x',
    ])
    client.unmount()
    host.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  },
)
