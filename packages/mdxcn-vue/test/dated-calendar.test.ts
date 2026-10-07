import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, Fragment, h, nextTick } from 'vue'
import type { Component, VNode } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { GraphActivity, GraphCalendar } from '../src'
import {
  activityDays,
  activityMonths,
  buildWeeks,
  calendarMark,
  calendarWeeks,
  parseUTC,
  toISO,
} from '../src/core'
import { activityModel, calendarModel } from '../src/adapters/dated-calendar'
import { vReveal } from '../src/directives/reveal'
import fixtures from './fixtures/dated-calendar-examples.json'
const widgets: Record<string, Component> = { GraphActivity, GraphCalendar }
const strip = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ id="[^"]*"/g, '')
    .replace(/ aria-labelledby="[^"]*"/g, '')
const hosts = (body: string): VNode[] =>
  body
    ? [
        h(
          'ul',
          body
            .split('\n')
            .map((line) =>
              h(
                'li',
                line.includes('**')
                  ? [h('strong', line.slice(2).replaceAll('**', ''))]
                  : line.slice(2),
              ),
            ),
        ),
      ]
    : []
it.each(fixtures)('$name independent upstream fixture matches model, DOM and summary', (c) => {
  const nodes = hosts(c.body)
  if (c.body)
    expect(
      JSON.parse(
        JSON.stringify(
          c.name === 'GraphActivity'
            ? { days: activityModel(nodes) }
            : { written: calendarModel(nodes) },
        ),
      ),
    ).toEqual(c.model)
  const runtime = mount(widgets[c.name]!, {
    props: (c.body ? c.props : { ...c.props, ...c.model }) as Record<string, unknown>,
    slots: { default: () => nodes },
  })
  const model = mount(widgets[c.name]!, { props: { ...c.props, ...c.model } })
  const direct = mount(widgets[c.name]!, {
    props: (c.name === 'GraphCalendar' && c.body
      ? { ...c.props, marks: c.model.written, today: 18 }
      : { ...c.props, ...c.model }) as Record<string, unknown>,
  })
  expect(strip(runtime.html())).toBe(strip(model.html()))
  expect(strip(runtime.html())).toBe(strip(direct.html()))
  expect(runtime.get('.sr-only').text()).toBe(c.summary)
  if (c.name === 'GraphActivity') {
    expect(
      runtime
        .findAll('.scrollbar-graph span.leading-none')
        .map((cell) => cell.text())
        .join(''),
    ).toBe(c.glyphs)
    const weeks = buildWeeks(
      c.model.days!,
      'weekStartsOn' in c.props ? (c.props.weekStartsOn as 0 | 1) : 0,
    )
    expect(weeks).toHaveLength(c.weeks)
    expect(weeks[0]![0]!.date).toBe(c.first)
    expect(weeks.at(-1)!.at(-1)!.date).toBe(c.last)
  } else expect(runtime.findAll('.flex.flex-col.gap-1 > div')).toHaveLength(c.weeks)
  runtime.unmount()
  model.unmount()
  direct.unmount()
})
it.each(fixtures)('$name hydrates visible SSR without warnings', async (c) => {
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
})
it.each([
  ['2024-02-29', '2024-02-29'],
  ['2023-02-29', '2023-03-01'],
  ['2026-13-01', '2027-01-01'],
  ['2026-03-00', '2026-02-28'],
  ['0001-01-01', '1901-01-01'],
])('UTC date %s preserves upstream rollover to %s', (input, expected) =>
  expect(toISO(parseUTC(input))).toBe(expected),
)
it.each(['bad', '2026-3-01', '2026-03-01T00:00:00Z', '2026-NaN-01', ''])(
  'malformed %s is ignored without serialization errors',
  (input) => {
    expect(parseUTC(input)).toBeNaN()
    expect(activityDays([`${input}: 1`])).toEqual([])
    expect(buildWeeks([{ date: input, count: 1 }], 0)).toEqual([])
  },
)
it.each(['2024-02-28', '2026-03-07', '2026-10-31', '2026-12-31'])(
  'daily runs across leap/month/year/DST boundary %s stay consecutive UTC days',
  (start) => {
    const days = activityDays([`${start}: 1*2 0×2 bad Infinity 3`])
    expect(days.map((day) => day.count)).toEqual([1, 1, 0, 0, 3])
    for (let i = 1; i < days.length; i++)
      expect(parseUTC(days[i]!.date) - parseUTC(days[i - 1]!.date)).toBe(86400000)
  },
)
it.each([
  [2024, 2, 29],
  [2023, 2, 28],
  [2026, 12, 31],
  [2026, 13, 31],
  [2026, 0, 31],
] as const)('calendar %s/%s has %s days and whole weeks', (year, month, length) => {
  for (const start of [0, 1] as const) {
    const weeks = calendarWeeks(year, month, start)
    expect(weeks.every((week) => week.length === 7)).toBe(true)
    expect(weeks.flat().filter((day) => day !== null)).toEqual(
      Array.from({ length }, (_, i) => i + 1),
    )
  }
})
it('empty and non-finite calendar and activity ranges are empty', () => {
  expect(buildWeeks([], 0)).toEqual([])
  expect(calendarWeeks(NaN, 2, 1)).toEqual([])
  expect(calendarWeeks(2026, Infinity, 0)).toEqual([])
  const w = mount(GraphActivity, { props: { title: 'T', days: [] } })
  expect(w.get('.sr-only').text()).toBe('0 contributions across 0 days')
  expect(w.findAll('.scrollbar-graph span.leading-none')).toHaveLength(0)
  w.unmount()
})
it('duplicates overwrite grid counts while raw day totals and missing-day filling remain upstream-compatible', () => {
  const days = [
    { date: '2026-03-01', count: 2 },
    { date: '2026-03-01', count: 5 },
    { date: '2026-03-03', count: 1 },
  ]
  expect(
    buildWeeks(days, 0)[0]!
      .slice(0, 3)
      .map((cell) => cell.count),
  ).toEqual([5, 0, 1])
  const w = mount(GraphActivity, { props: { title: 'T', days } })
  expect(w.get('.sr-only').text()).toBe('8 contributions across 3 days')
  w.unmount()
})
it('month labels only appear for in-range first days', () => {
  expect(
    activityMonths(
      buildWeeks(
        [
          { date: '2026-02-28', count: 0 },
          { date: '2026-03-02', count: 1 },
        ],
        0,
      ),
    ),
  ).toEqual(['', 'Mar'])
})
it('source runs restore emphasis, paragraphs break lines and list precedence wins', () => {
  expect(
    activityModel([h('p', ['2026-03-07: 1', h('em', '2 0'), '2 3']), h('p', '2026-03-12: 4')]).map(
      (day) => day.count,
    ),
  ).toEqual([1, 1, 0, 0, 3, 4])
  expect(activityModel([h('p', '2026-03-01: 9'), h('ul', h('li', 'invalid'))])).toEqual([])
})
it('fragments are transparent, custom components opaque, and header anchors excluded', () => {
  const hidden = defineComponent({ setup: () => () => h('li', '2026-03-01: 99') })
  const nodes = [
    h(Fragment, {}, [h('p', ['2026-03-01: ', h('a', { class: ['header-anchor'] }, '99'), '1'])]),
    h(hidden),
  ]
  expect(activityModel(nodes)).toEqual([{ date: '2026-03-01', count: 1 }])
  expect(
    calendarModel([
      h(
        'ul',
        h('li', [
          '12: ',
          h('a', { class: 'header-anchor' }, '#'),
          'note',
          h('ul', h('li', '18: nested')),
        ]),
      ),
    ]),
  ).toEqual([{ day: 12, accent: true, label: 'note', today: false }])
})
it('days empty prop suppresses slot and updates reactively', async () => {
  const w = mount(GraphActivity, {
    props: { title: 'T', days: [] },
    slots: { default: () => h('ul', h('li', '2026-03-01: 99')) },
  })
  expect(w.get('.sr-only').text()).toBe('0 contributions across 0 days')
  await w.setProps({ days: [{ date: '2026-03-01', count: 1200 }] })
  expect(w.text()).toContain('1,200 contributions')
  w.unmount()
})
it.each([
  [false, false, false],
  [false, true, true],
  ['', false, true],
] as const)('caption %s and legend %s preserve footer presence %s', (caption, legend, present) => {
  const w = mount(GraphActivity, { props: { title: 'T', caption, legend } })
  expect(w.find('.flex.flex-wrap').exists()).toBe(present)
  w.unmount()
})
it('max, custom glyphs and palette control intensity without changing totals', () => {
  const w = mount(GraphActivity, {
    props: {
      title: 'T',
      days: [{ date: '2026-03-01', count: 2 }],
      max: '8',
      glyphs: ['.', '#'],
      palette: 'duo',
    },
  })
  expect(w.findAll('.scrollbar-graph span.leading-none')[0]!.text()).toBe('.')
  expect(w.findAll('.scrollbar-graph span.leading-none')[0]!.classes()).toContain(
    'text-graph-accent-2',
  )
  expect(w.get('.sr-only').text()).toBe('2 contributions across 1 days')
  w.unmount()
})
it('calendar marks prop does not suppress inferred today, notes sort and empty marks win', async () => {
  const written = [
    { day: 18, label: 'later', today: true },
    { day: 4, label: 'earlier', accent: false },
  ]
  const w = mount(GraphCalendar, { props: { year: '2026', month: '3', written, marks: [12] } })
  expect(w.get('.sr-only').text()).toBe('March 2026, today 18, marked 12')
  expect(w.findAll('li')).toHaveLength(0)
  await w.setProps({ marks: null })
  expect(w.findAll('li').map((li) => li.text())).toEqual(['4earlier', '[18]later'])
  await w.setProps({ marks: [], today: '0' })
  expect(w.get('.sr-only').text()).toBe('March 2026')
  expect(w.findAll('li')).toHaveLength(0)
  w.unmount()
})
it('calendar duplicate false marks remain in summary, notes survive out-of-month days', () => {
  const w = mount(GraphCalendar, {
    props: {
      year: 2024,
      month: 2,
      marks: [{ day: 29 }, { day: 29, accent: false }, { day: 40, label: 'outside' }],
      today: 29,
      palette: 'multi',
    },
  })
  expect(w.get('.sr-only').text()).toBe('February 2024, today 29, marked 29, 40')
  expect(w.text()).toContain('outside')
  expect(
    w
      .findAll('span')
      .find((n) => n.text() === '[29]')!
      .classes(),
  ).toContain('text-graph-accent-2')
  w.unmount()
})
it('calendar parses prefix integers and ignores invalid labels', () => {
  expect(calendarMark('12th: note', true)).toEqual([
    { day: 12, accent: true, label: 'note', today: true },
  ])
  expect(calendarMark('no: note')).toEqual([])
})
it('out-of-range calendar month retains UTC rollover grid and upstream empty month summary', () => {
  const w = mount(GraphCalendar, { props: { year: 2026, month: 13 } })
  expect(w.find('figcaption').text()).toContain('undefined 2026')
  expect(w.get('.sr-only').text()).toBe('2026')
  expect(w.findAll('.flex.flex-col.gap-1 span').filter((n) => n.text())).toHaveLength(31)
  w.unmount()
})
it.each(['GraphActivity', 'GraphCalendar'])('%s reveal delay is capped at 240 ms', (name) => {
  const directive = vReveal as {
      mounted: (...args: [HTMLElement, { value?: { delay?: number } }]) => void
    },
    spy = vi.spyOn(directive, 'mounted')
  const w = mount(widgets[name]!, {
    props:
      name === 'GraphActivity'
        ? { title: 'T', days: activityDays(['2026-01-01: 1*371']) }
        : {
            year: 2026,
            month: 3,
            marks: Array.from({ length: 12 }, (_, i) => ({ day: i + 1, label: 'note' })),
          },
  })
  const delays = spy.mock.calls.map((call) => call[1].value?.delay ?? 0)
  expect(delays[0]).toBe(0)
  expect(delays[1]).toBe(name === 'GraphActivity' ? 10 : 40)
  expect(Math.max(...delays)).toBe(240)
  expect(delays.at(-1)).toBe(240)
  w.unmount()
  spy.mockRestore()
})
it('activity plain rows split before each date label when a template condensed the newline', () => {
  const rows = '2026-03-02: 1 2 3 2026-03-16: 4 5 6'
  const expected = activityDays([], '2026-03-02: 1 2 3\n2026-03-16: 4 5 6')
  expect(expected).toHaveLength(6)
  expect(activityDays([], rows)).toEqual(expected)
  expect(activityModel([h('p', rows)])).toEqual(expected)
})
it('numeric-string weekStartsOn "1" gives Monday-first labels and grid', () => {
  const calendar = mount(GraphCalendar, { props: { year: 2026, month: 3, weekStartsOn: '1' } })
  expect(calendar.findAll('.grid')[0]!.text()).toBe('MTWTFSS')
  expect(calendar.findAll('.grid')[1]!.text().replace(/\s/g, '')).toBe('1')
  calendar.unmount()
  const activity = mount(GraphActivity, {
    props: { title: 'A', days: [{ date: '2026-03-01', count: 1 }], weekStartsOn: '1' },
  })
  expect(activity.findAll('.w-\\[2ch\\] > span').map((n) => n.text())).toEqual([
    'M',
    '',
    'W',
    '',
    'F',
    '',
    '',
  ])
  activity.unmount()
})
