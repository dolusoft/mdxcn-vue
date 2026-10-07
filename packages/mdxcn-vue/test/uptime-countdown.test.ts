import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick, Fragment, defineComponent } from 'vue'
import type { Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { GraphUptime, GraphCountdown } from '../src'
import { uptimeDays, countdownWritten, parseInstant } from '../src/core'
import { uptimeModel, countdownModel } from '../src/adapters/uptime-countdown'
import { vReveal } from '../src/directives/reveal'
import fixtures from './fixtures/uptime-countdown-examples.json'
const components: Record<string, Component> = { GraphUptime, GraphCountdown }
const strip = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ id="[^"]*"/g, '')
    .replace(/ aria-labelledby="[^"]*"/g, '')
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
it.each(fixtures)('$example independent upstream fixture matches runtime and model', async (c) => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2027-01-01T00:00:00Z'))
  const nodes = [h('p', c.body)]
  if (c.body)
    expect(
      c.name === 'GraphUptime' ? { days: uptimeModel(nodes) } : { written: countdownModel(nodes) },
    ).toEqual(c.model)
  const runtime = mount(components[c.name]!, {
    props: c.props as Record<string, unknown>,
    slots: { default: () => nodes },
  })
  const model = mount(components[c.name]!, { props: { ...c.props, ...c.model } })
  await nextTick()
  expect(strip(runtime.html())).toBe(strip(model.html()))
  expect(runtime.get('.sr-only').text()).toBe(c.summary)
  if (c.name === 'GraphUptime') {
    expect(
      runtime
        .findAll('.select-none > div > span > span')
        .map((n) => n.text())
        .join(''),
    ).toBe(c.glyphs)
    expect(runtime.findAll('.select-none > div')).toHaveLength(c.rows!)
  } else expect(runtime.get('.text-3xl').text()).toBe(c.value)
  runtime.unmount()
  model.unmount()
})
it.each(fixtures)(
  '$example SSR hydrates without warnings before mounted clock updates',
  async (c) => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2027-01-01T00:00:00Z'))
    vi.stubGlobal('IntersectionObserver', undefined)
    const app = {
      render: () =>
        h(components[c.name]!, { ...c.props, ...c.model, className: 'custom', 'data-test': 'yes' }),
    }
    const html = await renderToString(createSSRApp(app))
    expect(html).not.toMatch(/opacity:0(?:;|"|$)|translateY/)
    if (c.name === 'GraphCountdown') expect(html).toContain('remaining 00:00:00')
    const host = document.createElement('div')
    host.innerHTML = html
    document.body.append(host)
    const warn = vi.spyOn(console, 'warn'),
      error = vi.spyOn(console, 'error'),
      client = createSSRApp(app)
    try {
      client.mount(host)
      expect(host.innerHTML).toBe(html)
      await nextTick()
      expect(host.querySelector('.sr-only')?.textContent).toBe(c.summary)
      expect(host.querySelector('figure.custom')?.getAttribute('data-test')).toBe('yes')
      expect(warn).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
    } finally {
      client.unmount()
      host.remove()
    }
  },
)
it.each(['bad', 'constructor', 'toString', '__proto__', 'OK'])(
  'uptime rejects invalid status %s',
  (value) => expect(uptimeDays(`ok ${value} down`)).toEqual(['ok', 'down']),
)
it('uptime expands runs with upstream token bounds and array support', () => {
  expect(uptimeDays('ok*2,down×2 empty*0 degraded')).toEqual([
    'ok',
    'ok',
    'down',
    'down',
    'degraded',
  ])
  expect(uptimeDays('ok*9999')).toHaveLength(5000)
  expect(uptimeDays('ok*10000')).toEqual([])
  expect(uptimeDays(['ok', 'empty'])).toEqual(['ok', 'empty'])
})
it.each([{ days: [] }, { days: ['empty'] }, { days: ['degraded', 'down'] }])(
  'uptime empty and zero uptime ranges $days',
  ({ days }) => {
    const w = mount(GraphUptime, {
      props: { title: 'U', days: days as ('empty' | 'degraded' | 'down')[] },
    })
    expect(w.get('.tabular-nums').text()).toBe('0%')
    w.unmount()
  },
)
it.each([
  [0, 3],
  [-1, 3],
  [1.9, 3],
  ['2', 2],
  [Number.NaN, 1],
  [Infinity, 1],
])('uptime normalizes columns %s to %s rows', (columns, rows) => {
  const w = mount(GraphUptime, { props: { title: 'U', days: 'ok*3', columns } })
  expect(w.findAll('.select-none > div')).toHaveLength(rows)
  w.unmount()
})
it('uptime empty prop wins over children and presentation labels stay literal', () => {
  const w = mount(GraphUptime, {
    props: { title: 'U', days: [], from: 'invalid date', to: 'Feb 29' },
    slots: { default: () => h('p', 'ok*3') },
  })
  expect(w.get('.sr-only').text()).toBe('0 percent uptime over 0 days, invalid date to Feb 29')
  w.unmount()
})
it('host adapters exclude anchors, preserve source markers, fragments and opaque components', () => {
  const opaque = defineComponent({ render: () => h('p', 'down') })
  expect(
    uptimeModel([
      h(Fragment, [
        h('p', [
          'ok',
          h('em', '2 down'),
          '2 ',
          h('a', { class: 'header-anchor' }, 'ok'),
          h(opaque),
        ]),
      ]),
    ]),
  ).toEqual(['ok', 'ok', 'down', 'down'])
  expect(
    countdownModel([
      h('p', [
        '2027-01-01 — until  launch\n',
        h('strong', 'now'),
        h('a', { class: 'header-anchor' }, '#'),
      ]),
    ]),
  ).toEqual({ label: '2027-01-01', rest: 'until launch now' })
  expect(countdownWritten('')).toEqual({ label: '', rest: '' })
})
it('countdown props override target while caption independently falls back to Markdown', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2027-01-01T00:00:00Z'))
  const w = mount(GraphCountdown, {
    props: { title: 'C', to: '2027-01-02' },
    slots: { default: () => h('p', '2020-01-01 — written caption') },
  })
  await nextTick()
  expect(w.get('.text-3xl').text()).toBe('1d 00:00:00')
  expect(w.text()).toContain('written caption')
  w.unmount()
})
it('countdown ticks, crosses completion, updates props and clears the interval', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2027-01-01T00:00:00Z'))
  const w = mount(GraphCountdown, {
    props: { title: 'C', to: '2027-01-01T00:00:02Z', done: 'closed', caption: '' },
  })
  await nextTick()
  expect(w.get('.text-3xl').text()).toBe('00:00:02')
  await vi.advanceTimersByTimeAsync(1000)
  expect(w.get('.sr-only').text()).toBe('remaining 00:00:01')
  await vi.advanceTimersByTimeAsync(1000)
  expect(w.get('.sr-only').text()).toBe('closed')
  expect(w.get('.text-3xl').classes()).toContain('text-graph-muted')
  expect(w.find('[aria-live]').exists()).toBe(false)
  await w.setProps({ to: new Date('2027-01-01T00:00:03Z') })
  expect(w.get('.text-3xl').text()).toBe('00:00:01')
  w.unmount()
  expect(vi.getTimerCount()).toBe(0)
})
it.each(['bad', '2027-13-01', '2027-01-32', '', Infinity, Number.NaN, new Date(Number.NaN)])(
  'countdown invalid instant %s stays at placeholder',
  (to) => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const w = mount(GraphCountdown, { props: { title: 'C', to } })
    expect(w.get('.sr-only').text()).toBe('remaining 00:00:00')
    w.unmount()
  },
)
it.each([
  ['2024-02-29', '2024-02-29T00:00:00Z'],
  ['2023-02-29', '2023-03-01T00:00:00Z'],
  ['2026-03-08T02:30:00', '2026-03-08T02:30:00Z'],
  ['2026-11-01T01:30:00', '2026-11-01T01:30:00Z'],
  ['2026-03-31T23:59:59', '2026-03-31T23:59:59Z'],
  ['2026-03-08T02:30:00-08:00', '2026-03-08T10:30:00Z'],
])('UTC instant %s resolves deterministically', (input, expected) =>
  expect(parseInstant(input, true)).toBe(Date.parse(expected)),
)
it('UTC mode preserves timestamp zero and legacy non-ISO parser behavior', () => {
  expect(parseInstant(0, true)).toBe(0)
  expect(parseInstant(new Date(0), true)).toBe(0)
  expect(parseInstant('March 1, 2026', true)).toBeNaN()
  expect(parseInstant('March 1, 2026')).toBe(Date.parse('March 1, 2026'))
})
it('countdown recognizes epoch zero and empty caption overrides written caption', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const w = mount(GraphCountdown, {
    props: { title: 'C', to: 0, caption: '', written: { label: '2027-01-01', rest: 'hidden' } },
  })
  await nextTick()
  expect(w.get('.sr-only').text()).toBe('done')
  expect(w.findAll('p')).toHaveLength(1)
  w.unmount()
})
it('uptime custom glyphs, tones and reactive prop changes preserve upstream mapping', async () => {
  const w = mount(GraphUptime, {
    props: { title: 'U', days: 'ok degraded down empty', glyphs: ['.', '#'], palette: 'multi' },
  })
  const cells = () => w.findAll('.select-none > div > span > span')
  expect(cells().map((n) => n.text())).toEqual(['#', '#', '.', '-'])
  expect(cells()[0]!.classes()).toContain('text-graph-accent')
  expect(cells()[1]!.classes()).toContain('text-graph-accent-2')
  expect(w.get('.sr-only').text()).toBe('33 percent uptime over 3 days')
  await w.setProps({ days: 'ok*2 empty' })
  expect(w.get('.sr-only').text()).toBe('100 percent uptime over 2 days')
  w.unmount()
})
it.each(['uptime', 'countdown'])('%s reveal delay never exceeds 240 ms', (name) => {
  const spy = vi.spyOn(
    vReveal as { mounted: (...args: [HTMLElement, { value?: { delay?: number } }]) => void },
    'mounted',
  )
  const w = mount(name === 'uptime' ? GraphUptime : GraphCountdown, {
    props:
      name === 'uptime'
        ? { title: 'U', days: 'ok*10', columns: 1 }
        : { title: 'C', to: '2027-01-01' },
  })
  const delays = spy.mock.calls.map((call) => call[1].value?.delay ?? 0)
  expect(delays[0]).toBe(0)
  expect(Math.max(...delays)).toBe(name === 'uptime' ? 240 : 0)
  if (name === 'uptime') {
    expect(delays[1]).toBe(50)
    expect(delays.at(-1)).toBe(240)
  }
  w.unmount()
})
it.each([
  ['2026-12-01 10:00', '2026-12-01T10:00:00Z'],
  ['2026-12-01 10:00:30.5', '2026-12-01T10:00:30.500Z'],
  ['2026-12-01t10:00:00z', '2026-12-01T10:00:00Z'],
  [' 2026-12-01T10:00 ', '2026-12-01T10:00:00Z'],
  ['2026-12-01T10:00:00+0300', '2026-12-01T07:00:00Z'],
  ['2026-12-01 10:00+03:00', '2026-12-01T07:00:00Z'],
])('UTC mode accepts the RFC 3339 form %s', (input, expected) =>
  expect(parseInstant(input, true)).toBe(Date.parse(expected)),
)
it.each(['2026/12/01', 'Dec 1, 2026', '2026-12-01T10', '2026-12', '2026'])(
  'UTC mode keeps %s at the placeholder',
  (input) => expect(parseInstant(input, true)).toBeNaN(),
)
